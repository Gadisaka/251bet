/** Interval / clock-slice markets (not full-match 1X2). */
export function isLiveOddsWindowOrIntervalMarket(nameRaw) {
  const n = String(nameRaw || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
  if (!n) return false;

  if (
    /\b\d{1,3}\s*(min|mins|minute|minutes)\b/.test(n) ||
    /\bin\s+\d{1,3}\s*(min|mins|minute|minutes)\b/.test(n) ||
    /\b(from|until|next)\s+\d{1,3}(\s*(min|mins|minute|minutes))?\b/.test(n) ||
    /\b\d{1,2}\s*['′]/.test(n) ||
    /\b1x2\b.*[-–—]\s*\d/.test(n) ||
    /\b1x2\b.*\b\d{1,3}\s*(min|mins)\b/.test(n)
  ) {
    return true;
  }

  if (
    /\b(first|1st|second|2nd)\s+half\b/.test(n) ||
    /\bhalf\s*time\b(?!\s*full\b)/.test(n) ||
    /\b15\s*minutes\b|\b10\s*minutes\b|\b30\s*minutes\b|\b40\s*minutes\b|\b45\s*minutes\b|\b60\s*minutes\b/.test(
      n,
    )
  ) {
    return true;
  }

  return false;
}

/**
 * Compact-strip 1X2 only: mapped Match Winner, exact Full Time Result,
 * Match Result, or a bare 1X2. Period / qualify / ET variants stay out.
 */
export function isLiveThreeWayResultMarket(nameRaw) {
  if (isLiveOddsWindowOrIntervalMarket(nameRaw)) return false;
  const trimmed = String(nameRaw || "").trim();
  const n = trimmed.toLowerCase().replace(/\s+/g, " ");
  if (n === "match winner") return true;
  if (n === "full time result" || n === "fulltime result") return true;
  if (n === "match result") return true;
  return /^1x2$/i.test(trimmed);
}

export function isLiveDoubleChanceMarket(nameRaw) {
  if (isLiveOddsWindowOrIntervalMarket(nameRaw)) return false;
  return String(nameRaw || "")
    .toLowerCase()
    .includes("double chance");
}

export function isLiveMainMarketCategory(nameRaw) {
  return (
    isLiveThreeWayResultMarket(nameRaw) || isLiveDoubleChanceMarket(nameRaw)
  );
}

/** Higher = better source for the compact 1 / X / 2 row. */
export function liveThreeWayMarketPriority(nameRaw) {
  if (!isLiveThreeWayResultMarket(nameRaw)) return -1;
  const n = String(nameRaw || "")
    .toLowerCase()
    .replace(/\s+/g, " ");
  if (n === "match winner") return 100;
  if (n === "full time result" || n === "fulltime result") return 90;
  if (n === "match result") return 80;
  if (/^1x2$/i.test(String(nameRaw || "").trim())) return 75;
  return 50;
}

export function pickBestLiveThreeWayMarket(markets) {
  let best = null;
  let bestPri = -1;
  for (const m of markets || []) {
    const p = liveThreeWayMarketPriority(m?.name);
    if (p > bestPri) {
      bestPri = p;
      best = m;
    }
  }
  return best;
}

export function isLiveLineSuspended(ol) {
  return ol?.suspended === true || ol?.active === false;
}
