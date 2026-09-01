import {
  mapStatusId,
  namespacedLeagueId,
  namespacedTeamId,
  parseProviderFixtureId,
  PROVIDER,
} from "./config.js";

export function utcDayBounds(offsetDays) {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() + offsetDays);
  const end = new Date(start);
  end.setUTCHours(23, 59, 59, 999);
  return { start, end };
}

/** OddsPapi allows ≤10 days between from/to when querying by sportId. Use 9. */
export function fixtureWindows(daysAhead) {
  const windows = [];
  let offset = 0;
  const span = Math.max(1, Number(daysAhead) || 1);
  while (offset < span) {
    const size = Math.min(9, span - offset);
    windows.push({ startOffset: offset, endOffset: offset + size - 1 });
    offset += size;
  }
  return windows;
}

export function windowToRange(startOffset, endOffset) {
  const from = utcDayBounds(startOffset).start;
  const to = utcDayBounds(endOffset).end;
  return { from: from.toISOString(), to: to.toISOString(), start: from, end: to };
}

export function normalizeFixture(raw) {
  const provider_fixture_id = raw.fixtureId;
  const api_fixture_id = parseProviderFixtureId(provider_fixture_id);
  if (api_fixture_id == null) {
    throw new Error(`unparseable fixtureId: ${provider_fixture_id}`);
  }
  const p1 = Number(raw.participant1Id);
  const p2 = Number(raw.participant2Id);
  if (!Number.isFinite(p1) || !Number.isFinite(p2)) {
    throw new Error(`fixture ${provider_fixture_id} missing participants`);
  }
  return {
    api_fixture_id,
    provider: PROVIDER,
    provider_fixture_id,
    provider_tournament_id: Number(raw.tournamentId),
    provider_season_id: raw.seasonId == null ? null : Number(raw.seasonId),
    external_ids: raw.externalProviders || null,
    start_time: new Date(raw.startTime || raw.trueStartTime),
    status: mapStatusId(raw.statusId),
    statusId: Number(raw.statusId),
    participant1Id: p1,
    participant2Id: p2,
    participant1Name: raw.participant1Name || `Team ${p1}`,
    participant2Name: raw.participant2Name || `Team ${p2}`,
    tournamentId: Number(raw.tournamentId),
    tournamentName: raw.tournamentName || `Tournament ${raw.tournamentId}`,
    categoryName: raw.categoryName || null,
    categorySlug: raw.categorySlug || null,
    hasOdds: Boolean(raw.hasOdds),
    home_api_team_id: namespacedTeamId(p1),
    away_api_team_id: namespacedTeamId(p2),
    api_league_id: namespacedLeagueId(raw.tournamentId),
  };
}

/**
 * Flatten 1xBet (or configured bookmaker) odds into persistable lines.
 * Player-prop rows (playerId !== 0) are dropped — the plan does not include them.
 */
export function flattenOdds(raw, bookmakerSlug) {
  const book = raw?.bookmakerOdds?.[bookmakerSlug];
  if (!book?.markets) return { suspended: false, lines: [] };
  const lines = [];
  for (const [mid, market] of Object.entries(book.markets)) {
    for (const [oid, outcome] of Object.entries(market.outcomes || {})) {
      for (const [pid, player] of Object.entries(outcome.players || {})) {
        if (String(pid) !== "0") continue;
        if (player?.price == null) continue;
        lines.push({
          marketId: Number(mid),
          outcomeId: Number(oid),
          playerId: 0,
          price: Number(player.price),
          value: String(player.bookmakerOutcomeId || oid),
          active: player.active !== false && market.marketActive !== false,
          mainLine: Boolean(player.mainLine),
          maxLimit: player.limit == null ? null : Number(player.limit),
        });
      }
    }
  }
  return { suspended: book.suspended === true, lines };
}

export function marketStorageName(marketId, catalogueName) {
  const id = Number(marketId);
  const name = catalogueName ? String(catalogueName) : "market";
  return `${id}:${name}`;
}
