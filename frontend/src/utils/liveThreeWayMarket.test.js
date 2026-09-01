import { describe, expect, it } from "vitest";
import {
  isLiveThreeWayResultMarket,
  liveThreeWayMarketPriority,
  pickBestLiveThreeWayMarket,
} from "./liveThreeWayMarket.js";

describe("live 1X2 picker", () => {
  it("accepts exact full-time names only", () => {
    expect(isLiveThreeWayResultMarket("Match Winner")).toBe(true);
    expect(isLiveThreeWayResultMarket("Full Time Result")).toBe(true);
    expect(isLiveThreeWayResultMarket("1X2")).toBe(true);
    expect(isLiveThreeWayResultMarket("Match Winner (to qualify)")).toBe(false);
    expect(isLiveThreeWayResultMarket("Full Time Result - First Half")).toBe(
      false,
    );
    expect(isLiveThreeWayResultMarket("1x2 - 15 minutes")).toBe(false);
  });

  it("ignores Match Winner (to qualify) and picks full-time 1X2", () => {
    expect(liveThreeWayMarketPriority("Match Winner (to qualify)")).toBe(-1);
    const withoutExact = pickBestLiveThreeWayMarket([
      { name: "Match Winner (to qualify)" },
      { name: "Full Time Result" },
    ]);
    expect(withoutExact.name).toBe("Full Time Result");
    const withExact = pickBestLiveThreeWayMarket([
      { name: "Match Winner (to qualify)" },
      { name: "Full Time Result" },
      { name: "Match Winner" },
    ]);
    expect(withExact.name).toBe("Match Winner");
  });
});
