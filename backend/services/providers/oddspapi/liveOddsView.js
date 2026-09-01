import { getCache } from "../../cacheService.js";
import { getOddspapiConfig, oddspapiWsCacheKey } from "./config.js";
import { flattenOdds } from "./normalize.js";
import { legacyMarketsFromLines } from "./marketBridge.js";
import { loadMarketMap } from "../../../jobs/oddspapi/cache.js";

function mongoMarkets(fx) {
  return (fx.markets || [])
    .filter((m) => Array.isArray(m.odd_lines) && m.odd_lines.length > 0)
    .map((m) => ({
      name: m.name,
      odd_lines: m.odd_lines.map((ol) => ({ value: ol.value, odd: ol.odd })),
    }));
}

/**
 * Build the `/odds/live` payload for OddsPapi fixtures: prefer the merged
 * WebSocket book when it has 1xBet prices, otherwise the last REST snapshot.
 */
export async function buildOddspapiLiveOdds(fixtures, dropUnsupported) {
  const cfg = getOddspapiConfig();
  const marketMap = await loadMarketMap();
  const out = [];
  for (const fx of fixtures) {
    let markets = mongoMarkets(dropUnsupported ? dropUnsupported(fx) : fx);
    const ws = fx.provider_fixture_id
      ? await getCache(oddspapiWsCacheKey(fx.provider_fixture_id))
      : null;
    if (ws?.bookmakerOdds) {
      const { lines } = flattenOdds(ws, cfg.bookmaker);
      const fromWs = legacyMarketsFromLines(lines, marketMap);
      if (fromWs.length) markets = fromWs;
    }
    out.push({
      api_fixture_id: fx.api_fixture_id,
      status: fx.status,
      elapsed: null,
      home_score: fx.home_score,
      away_score: fx.away_score,
      markets,
    });
  }
  return out;
}
