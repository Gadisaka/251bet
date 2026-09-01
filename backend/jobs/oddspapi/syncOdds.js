import prisma from "../../Config/db.js";
import { upsertNoTx } from "../../utils/upsertNoTx.js";
import { getOddspapiConfig, PROVIDER } from "../../services/providers/oddspapi/config.js";
import { getOddsByTournaments } from "../../services/providers/oddspapi/endpoints.js";
import { flattenOdds, normalizeFixture } from "../../services/providers/oddspapi/normalize.js";
import { quotaSnapshot, allowOddsTier } from "../../services/providers/oddspapi/quota.js";
import { legacyMarket } from "../../services/providers/oddspapi/marketBridge.js";
import { recomputeExtraMarketsCountForFixture } from "../../services/extraMarketsCount.js";
import { ingestFixtureList } from "./syncFixtures.js";
import { chunkIds, loadMarketMap, shadowStatsIncr } from "./cache.js";

const BOOKMAKER_FALLBACK_ID = 910_000_001;

async function resolveBookmaker(slug) {
  const named = await prisma.bookmaker.findFirst({
    where: { name: { contains: "1xBet" } },
  });
  if (named) return named;
  const existing = await prisma.bookmaker.findUnique({
    where: { api_bookmaker_id: 11 },
  });
  if (existing) return existing;
  return upsertNoTx(prisma.bookmaker, {
    where: { api_bookmaker_id: BOOKMAKER_FALLBACK_ID },
    update: { name: slug },
    create: { api_bookmaker_id: BOOKMAKER_FALLBACK_ID, name: slug },
  });
}

async function dropProviderShapedMarkets(fixtureId) {
  const markets = await prisma.fixtureMarket.findMany({
    where: { fixture_id: fixtureId },
    select: { id: true, name: true },
  });
  const staleIds = markets.filter((m) => /^\d+:/.test(m.name)).map((m) => m.id);
  if (!staleIds.length) return 0;
  await prisma.fixtureMarket.deleteMany({ where: { id: { in: staleIds } } });
  return staleIds.length;
}

async function persistLines(fixtureRow, lines, bookmaker, marketMap) {
  await dropProviderShapedMarkets(fixtureRow.id);

  const byName = new Map();
  for (const line of lines) {
    const cat = marketMap[String(line.marketId)];
    const legacy = legacyMarket(line.marketId, line.outcomeId, cat);
    if (!legacy) continue;
    if (!byName.has(legacy.name)) byName.set(legacy.name, []);
    byName.get(legacy.name).push({ line, legacy });
  }

  for (const [name, group] of byName) {
    const market = await upsertNoTx(prisma.fixtureMarket, {
      where: { fixture_id_name: { fixture_id: fixtureRow.id, name } },
      update: {},
      create: {
        fixture_id: fixtureRow.id,
        name,
      },
    });
    for (const { line, legacy } of group) {
      await upsertNoTx(prisma.fixtureOddLine, {
        where: {
          market_id_bookmaker_id_value: {
            market_id: market.id,
            bookmaker_id: bookmaker.id,
            value: legacy.value,
          },
        },
        update: {
          odd: line.price,
          provider_market_id: line.marketId,
          provider_outcome_id: line.outcomeId,
          provider_player_id: line.playerId,
          active: line.active,
          main_line: line.mainLine,
          max_limit: line.maxLimit,
        },
        create: {
          market_id: market.id,
          bookmaker_id: bookmaker.id,
          value: legacy.value,
          odd: line.price,
          provider_market_id: line.marketId,
          provider_outcome_id: line.outcomeId,
          provider_player_id: line.playerId,
          active: line.active,
          main_line: line.mainLine,
          max_limit: line.maxLimit,
        },
      });
    }
  }
  await recomputeExtraMarketsCountForFixture(fixtureRow.id).catch(() => {});
}

function hoursFromNow(h) {
  return new Date(Date.now() + h * 3600_000);
}

async function tournamentIdsForTier(tier) {
  const now = new Date();
  let end;
  let start = now;
  if (tier === "hot") end = hoursFromNow(3);
  else if (tier === "warm") {
    start = now;
    end = hoursFromNow(24);
  } else {
    start = hoursFromNow(24);
    end = hoursFromNow(14 * 24);
  }

  const rows = await prisma.fixture.findMany({
    where: {
      provider: PROVIDER,
      start_time: { gte: start, lte: end },
      status: { in: ["NS", "LIVE", "HT"] },
      provider_tournament_id: { not: null },
    },
    select: { provider_tournament_id: true },
  });
  const ids = [...new Set(rows.map((r) => r.provider_tournament_id).filter(Boolean))];
  return ids;
}

export async function runOddspapiOdds({ tier = "hot" } = {}) {
  const snap = await quotaSnapshot();
  if (!allowOddsTier(snap.mode, tier)) {
    console.warn(`[oddspapi:odds] skip tier=${tier} quota mode=${snap.mode}`);
    return { tier, skipped: true, reason: snap.mode, batches: 0, fixtures: 0 };
  }

  const cfg = getOddspapiConfig();
  const ids = await tournamentIdsForTier(tier);
  if (!ids.length) {
    console.log(`[oddspapi:odds] tier=${tier} no local tournaments yet`);
    return { tier, batches: 0, fixtures: 0 };
  }

  const bookmaker = await resolveBookmaker(cfg.bookmaker);
  const marketMap = await loadMarketMap();
  const batches = chunkIds(ids, cfg.batchSize);
  let fixtures = 0;
  let lines = 0;

  for (const batch of batches) {
    const res = await getOddsByTournaments(batch, { bucket: `odds_${tier}` });
    if (res.empty) continue;
    await ingestFixtureList(res.list);
    for (const raw of res.list) {
      let fx;
      try {
        fx = normalizeFixture(raw);
      } catch {
        continue;
      }
      const row = await prisma.fixture.findUnique({
        where: { api_fixture_id: fx.api_fixture_id },
      });
      if (!row) continue;
      const flat = flattenOdds(raw, cfg.bookmaker);
      if (!flat.lines.length) continue;
      await persistLines(row, flat.lines, bookmaker, marketMap);
      fixtures += 1;
      lines += flat.lines.length;
    }
    console.log(
      `[oddspapi:odds] tier=${tier} batch=${batch.join(",")} n=${res.list.length} ${res.ms}ms`,
    );
  }

  await shadowStatsIncr("odds_fixtures", fixtures);
  return { tier, batches: batches.length, fixtures, lines, tournaments: ids.length };
}
