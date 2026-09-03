import { resolveCompactMarketToken } from "./compactMarketToken.js";
import { accumulatorPercentFromBonusesList } from "./accumulatorBonus.js";
import {
  getSportsbookDayOffset,
  SPORTSBOOK_TIMEZONE,
} from "./sportsbookDay.js";

export const MIN_MULTIPLE_LEGS = 3;
export const TARGET_MULTIPLE_LEGS = 5;

const BLOCKED_STATUS =
  /^(LIVE|HT|1H|2H|FT|AET|PEN|FINISHED|CANC|PST|ABD|AWD|WO)/i;

const THEMES = Object.freeze([
  {
    id: "match-result",
    titleKey: "home.motdMatchResult",
    title: "Football. Matchday Match Result",
    pick: (map) => favoriteInRange(map, 1.3, 2.2),
  },
  {
    id: "home-wins",
    titleKey: "home.motdHomeWins",
    title: "Football. Matchday Home Wins",
    pick: (map) => tokenInRange(map, "1", 1.4, 2.2),
  },
  {
    id: "away-wins",
    titleKey: "home.motdAwayWins",
    title: "Football. Matchday Away Wins",
    pick: (map) => tokenInRange(map, "2", 1.65, 2.55),
  },
]);

export function marketMapOf(match) {
  return (match?.markets || []).reduce((acc, market) => {
    acc[String(market.id).toLowerCase()] = market.value;
    return acc;
  }, {});
}

function tokenInRange(map, token, min, max) {
  const n = Number(map[token]);
  if (!Number.isFinite(n) || n < min || n > max) return null;
  return token;
}

function favoriteInRange(map, min, max) {
  const home = Number(map["1"]);
  const away = Number(map["2"]);
  if (!Number.isFinite(home) || !Number.isFinite(away)) return null;
  const token = home <= away ? "1" : "2";
  return tokenInRange(map, token, min, max);
}

function isBlockedStatus(status) {
  return BLOCKED_STATUS.test(String(status || "").trim());
}

export function formatMultipleLegDate(kickoffAt) {
  if (!kickoffAt) return "";
  const date = new Date(kickoffAt);
  if (Number.isNaN(date.getTime())) return "";
  const day = date.toLocaleDateString("en-GB", {
    timeZone: SPORTSBOOK_TIMEZONE,
    day: "2-digit",
    month: "short",
  });
  const time = date.toLocaleTimeString("en-GB", {
    timeZone: SPORTSBOOK_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${day} ${time}`;
}

function selectionLabel(match, token) {
  if (token === "1") return match.homeTeam || "Home";
  if (token === "2") return match.awayTeam || "Away";
  return "Draw";
}

export function isMultipleCandidate(match, now = new Date()) {
  if (!match) return false;
  if (String(match.sportId || "").toLowerCase() !== "football") return false;
  if (isBlockedStatus(match.status)) return false;
  const kickoff = match.kickoffAt ? new Date(match.kickoffAt).getTime() : NaN;
  if (!Number.isFinite(kickoff) || kickoff <= now.getTime()) return false;
  const map = marketMapOf(match);
  return Boolean(map["1"] && map["2"]);
}

function sortCandidates(matches, now) {
  return [...matches]
    .filter((match) => isMultipleCandidate(match, now))
    .sort((a, b) => {
      const ao = getSportsbookDayOffset(new Date(a.kickoffAt), now) ?? 99;
      const bo = getSportsbookDayOffset(new Date(b.kickoffAt), now) ?? 99;
      if (ao !== bo) return ao - bo;
      const ar = a.leagueRank ?? 9999;
      const br = b.leagueRank ?? 9999;
      if (ar !== br) return ar - br;
      const at = new Date(a.kickoffAt).getTime();
      const bt = new Date(b.kickoffAt).getTime();
      if (at !== bt) return at - bt;
      return Number(a.apiFixtureId || 0) - Number(b.apiFixtureId || 0);
    });
}

function buildLeg(match, token) {
  const meta = resolveCompactMarketToken(token);
  const map = marketMapOf(match);
  const value = map[token];
  if (!meta || !value) return null;
  const pickName = selectionLabel(match, token);
  return {
    id: `${match.apiFixtureId}-${token}`,
    match: match.match,
    market: `Match Result — ${pickName}`,
    value: String(value),
    date: formatMultipleLegDate(match.kickoffAt),
    apiFixtureId: match.apiFixtureId,
    matchName: match.match,
    league: match.league,
    kickoffAt: match.kickoffAt,
    matchStatus: match.status,
    fromLive: false,
    ...meta,
  };
}

function collectLegs(candidates, used, pick, limit) {
  const legs = [];
  for (const match of candidates) {
    if (legs.length >= limit) break;
    const fixtureId = match.apiFixtureId;
    if (fixtureId == null || used.has(fixtureId)) continue;
    const token = pick(marketMapOf(match));
    if (!token) continue;
    const leg = buildLeg(match, token);
    if (!leg) continue;
    used.add(fixtureId);
    legs.push(leg);
  }
  return legs;
}

/**
 * Build up to three accumulator tickets from upcoming football 1X2 prices.
 * List payloads only carry Match Winner + Double Chance, so these cards stay
 * on Match Result (favorites, home wins, away wins) from live fixtures.
 */
export function buildMultipleOfTheDayTickets(
  matches = [],
  { bonuses = [], now = new Date() } = {},
) {
  const candidates = sortCandidates(matches, now);
  if (candidates.length < MIN_MULTIPLE_LEGS) return [];

  const used = new Set();
  const tickets = [];

  for (const theme of THEMES) {
    const legs = collectLegs(
      candidates,
      used,
      theme.pick,
      TARGET_MULTIPLE_LEGS,
    );
    if (legs.length < MIN_MULTIPLE_LEGS) continue;
    tickets.push({
      id: `mod-${theme.id}`,
      titleKey: theme.titleKey,
      title: theme.title,
      bonusPercent: accumulatorPercentFromBonusesList(bonuses, legs.length),
      legs,
    });
  }

  return tickets;
}

export function ticketToSlipSelections(ticket) {
  return (ticket?.legs || []).map((leg) => ({
    id: `${leg.matchName}-${leg.label}`,
    apiFixtureId: leg.apiFixtureId,
    matchName: leg.matchName,
    league: leg.league,
    marketLabel: leg.marketLabel,
    marketCode: leg.marketCode,
    marketParams: leg.marketParams,
    label: leg.label,
    value: String(leg.value),
    kickoffAt: leg.kickoffAt,
    matchStatus: leg.matchStatus,
    fromLive: Boolean(leg.fromLive),
  }));
}
