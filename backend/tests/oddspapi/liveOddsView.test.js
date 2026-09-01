import test from "node:test";
import assert from "node:assert/strict";
import {
  isPriceStale,
} from "../../services/providers/oddspapi/liveOddsView.js";
import { legacyMarketsFromLines } from "../../services/providers/oddspapi/marketBridge.js";

test("isPriceStale is true when the 1X2 changed before the last score", () => {
  assert.equal(
    isPriceStale("2026-09-01T18:00:00.000Z", "2026-09-01T18:12:00.000Z"),
    true,
  );
  assert.equal(
    isPriceStale("2026-09-01T18:12:00.000Z", "2026-09-01T18:00:00.000Z"),
    false,
  );
  assert.equal(isPriceStale(null, "2026-09-01T18:00:00.000Z"), false);
  assert.equal(isPriceStale("2026-09-01T18:00:00.000Z", null), false);
});

test("legacyMarketsFromLines carries active/suspended from the line and book", () => {
  const markets = legacyMarketsFromLines(
    [
      {
        marketId: 101,
        outcomeId: 101,
        price: 4.61,
        active: false,
        changedAt: "2026-09-01T18:00:00.000Z",
      },
    ],
    {
      101: {
        marketId: 101,
        marketName: "Full Time Result",
        marketType: "1x2",
        period: "fulltime",
        outcomes: { 101: "1" },
      },
    },
  );
  assert.equal(markets[0].name, "Match Winner");
  assert.equal(markets[0].odd_lines[0].active, false);
  assert.equal(markets[0].odd_lines[0].suspended, true);
  assert.equal(markets[0].odd_lines[0].changed_at, "2026-09-01T18:00:00.000Z");

  const bookDown = legacyMarketsFromLines(
    [
      {
        marketId: 101,
        outcomeId: 101,
        price: 1.9,
        active: true,
      },
    ],
    {
      101: {
        marketType: "1x2",
        period: "fulltime",
        outcomes: { 101: "1" },
      },
    },
    { bookSuspended: true },
  );
  assert.equal(bookDown[0].odd_lines[0].suspended, true);
});
