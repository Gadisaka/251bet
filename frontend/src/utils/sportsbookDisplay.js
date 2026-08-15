/** Saturated per-sport bar colour behind competition and live headers. */
const SPORT_ACCENT_VAR = {
  football: "var(--sb-sport-football)",
  basketball: "var(--sb-sport-basketball)",
  tennis: "var(--sb-sport-tennis)",
  volleyball: "var(--sb-sport-volleyball)",
  "table-tennis": "var(--sb-sport-tabletennis)",
  cricket: "var(--sb-sport-cricket)",
};

export function sportAccentColor(sportId) {
  return (
    SPORT_ACCENT_VAR[String(sportId || "").toLowerCase()] ||
    "var(--sb-sport-default)"
  );
}

/**
 * Market strip options above the match list. Only markets the summary payload
 * actually prices are offered, so every tab switches real odds rather than
 * acting as decoration.
 */
export const MATCH_MARKET_TABS = Object.freeze([
  { id: "1x2", label: "Match Result", selections: ["1", "x", "2"] },
  { id: "dc", label: "Double Chance", selections: ["1x", "12", "x2"] },
]);

export const DEFAULT_MARKET_TAB = MATCH_MARKET_TABS[0];
