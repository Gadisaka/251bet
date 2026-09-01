/**
 * Bridge OddsPapi `(marketId, outcomeId)` pairs onto the selection shape our
 * grading engine understands (`market_code` + `params`).
 *
 * Scope is deliberately narrow: only markets that `marketEvaluatorV2` can
 * settle from a fixture's score alone. Corners, bookings and player props need
 * API-Football statistics we never collect for OddsPapi rows, and Asian
 * handicaps need the fractional `result_factor` column that does not exist yet
 * (§6.2). Anything unmapped returns `null` and is counted, not guessed.
 *
 * Keyed on the catalogue's `marketType`/`period` rather than raw market ids,
 * because a single family (e.g. `totals|fulltime`) spans 34 ids that differ
 * only by `handicap`.
 */

function label(catalogue, outcomeId) {
  const name = catalogue?.outcomes?.[String(outcomeId)];
  return name == null ? "" : String(name).trim();
}

function side1x2(raw) {
  const key = raw.toUpperCase();
  if (key === "1") return "HOME";
  if (key === "X") return "DRAW";
  if (key === "2") return "AWAY";
  return null;
}

function overUnderSide(raw) {
  const key = raw.toUpperCase();
  if (key === "OVER") return "OVER";
  if (key === "UNDER") return "UNDER";
  return null;
}

function yesNo(raw) {
  const key = raw.toUpperCase();
  if (key === "YES") return "YES";
  if (key === "NO") return "NO";
  return null;
}

function oddEven(raw) {
  const key = raw.toUpperCase();
  if (key === "ODD") return "ODD";
  if (key === "EVEN") return "EVEN";
  return null;
}

function doubleChance(raw) {
  const key = raw.toUpperCase().replace(/\s+/g, "");
  if (key === "1X" || key === "X1") return "1X";
  if (key === "12" || key === "21") return "12";
  if (key === "X2" || key === "2X") return "X2";
  return null;
}

function numericLine(catalogue) {
  const n = Number(catalogue?.handicap);
  return Number.isFinite(n) ? n : null;
}

/**
 * Each handler receives the outcome label and catalogue entry and returns
 * `{ market_code, selection, params }`, or `null` when the outcome is not one
 * we can grade.
 */
const FAMILIES = new Map([
  [
    "1x2|fulltime",
    (name) => {
      const side = side1x2(name);
      return side && { market_code: "MATCH_WINNER", selection: name, params: { side } };
    },
  ],
  [
    "1x2|p1",
    (name) => {
      const side = side1x2(name);
      return side && { market_code: "HALF_TIME_RESULT", selection: name, params: { side } };
    },
  ],
  [
    "doublechance|fulltime",
    (name) => {
      const combination = doubleChance(name);
      return (
        combination && {
          market_code: "DOUBLE_CHANCE",
          selection: combination,
          params: { combination },
        }
      );
    },
  ],
  [
    "drawnobet|fulltime",
    (name) => {
      const side = side1x2(name);
      if (!side || side === "DRAW") return null;
      return { market_code: "DRAW_NO_BET", selection: name, params: { side } };
    },
  ],
  [
    "bothteamsscore|fulltime",
    (name) => {
      const pick = yesNo(name);
      return pick && { market_code: "BTTS", selection: pick, params: { pick } };
    },
  ],
  [
    "totals|fulltime",
    (name, catalogue) => {
      const side = overUnderSide(name);
      const line = numericLine(catalogue);
      if (!side || line === null) return null;
      return {
        market_code: "OVER_UNDER",
        selection: `${side === "OVER" ? "Over" : "Under"} ${line}`,
        params: { side, line },
      };
    },
  ],
  [
    "totals|p1",
    (name, catalogue) => {
      const side = overUnderSide(name);
      const line = numericLine(catalogue);
      if (!side || line === null) return null;
      return {
        market_code: "HT_OVER_UNDER",
        selection: `${side === "OVER" ? "Over" : "Under"} ${line}`,
        params: { side, line },
      };
    },
  ],
  [
    "oddeven|fulltime",
    (name) => {
      const pick = oddEven(name);
      return pick && { market_code: "ODD_EVEN", selection: pick, params: { pick } };
    },
  ],
]);

/** Market ids whose catalogue `marketType` is unreliable across API versions. */
const MARKET_ID_OVERRIDES = new Map([[104, "bothteamsscore|fulltime"]]);

export function familyKey(marketId, catalogue) {
  const override = MARKET_ID_OVERRIDES.get(Number(marketId));
  if (override) return override;
  return `${catalogue?.marketType ?? ""}|${catalogue?.period ?? ""}`;
}

export function isBridgeable(marketId, catalogue) {
  if (catalogue?.playerProp) return false;
  return FAMILIES.has(familyKey(marketId, catalogue));
}

/**
 * @returns {{ market_code: string, selection: string, params: object }|null}
 */
export function bridgeSelection(marketId, outcomeId, catalogue) {
  if (catalogue?.playerProp) return null;
  const handler = FAMILIES.get(familyKey(marketId, catalogue));
  if (!handler) return null;
  const name = label(catalogue, outcomeId);
  if (!name) return null;
  return handler(name, catalogue) || null;
}

/** Market families the bridge covers, for reporting and tests. */
export function bridgedFamilies() {
  return [...FAMILIES.keys()];
}
