import { SPORTSBOOK_TIMEZONE } from "../../utils/sportsbookDay.js";

export function splitMatchTeams(matchName) {
  const [home = "Home", away = "Away"] = String(matchName || "").split(" V ");
  return { home, away };
}

export function formatLeagueLabel(league) {
  const [zone, name] = String(league || "").split(" - ");
  if (!name) return zone || "";
  return name;
}

export function formatKickoffTime(kickoffAt, date) {
  if (kickoffAt) {
    const parsed = new Date(kickoffAt);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleTimeString("en-GB", {
        timeZone: SPORTSBOOK_TIMEZONE,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    }
  }
  const timePart = String(date || "").split(" ")[1] || "";
  return timePart.slice(0, 5);
}

export function formatKickoffDateKey(kickoffAt, date) {
  if (kickoffAt) {
    const parsed = new Date(kickoffAt);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed
        .toLocaleDateString("en-GB", {
          timeZone: SPORTSBOOK_TIMEZONE,
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
        .replace(/\//g, ".");
    }
  }
  const datePart = String(date || "").split(" ")[0] || "";
  return datePart.replace(/\//g, ".");
}

export function formatKickoffDateTime(kickoffAt, date) {
  const dateKey = formatKickoffDateKey(kickoffAt, date);
  const time = formatKickoffTime(kickoffAt, date);
  return [dateKey, time].filter(Boolean).join(" ");
}

export function groupMatchesByDate(matches) {
  const groups = [];
  const index = new Map();
  for (const match of matches || []) {
    const key = formatKickoffDateKey(match.kickoffAt, match.date) || "—";
    if (!index.has(key)) {
      index.set(key, groups.length);
      groups.push({ date: key, matches: [] });
    }
    groups[index.get(key)].matches.push(match);
  }
  return groups;
}

export function marketMapFromMatch(match) {
  return (match?.markets || []).reduce((acc, market) => {
    acc[String(market.id).toLowerCase()] = market.value;
    return acc;
  }, {});
}
