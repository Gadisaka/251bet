import { runOddspapiCatalogue } from "../../jobs/oddspapi/syncCatalogue.js";
import {
  runOddspapiFixtures,
  runOddspapiFixturesLookback,
} from "../../jobs/oddspapi/syncFixtures.js";
import { runOddspapiOdds } from "../../jobs/oddspapi/syncOdds.js";
import { getFixturesDaysAhead } from "../../Config/ingestionConfig.js";
import { isOddspapiShadowEnabled } from "../../services/providers/oddspapi/config.js";

export async function processOddspapiShadow(job) {
  if (!isOddspapiShadowEnabled()) {
    return { skipped: true, reason: "shadow disabled" };
  }
  const name = job.name;
  switch (name) {
    case "oddspapi:catalogue":
      return runOddspapiCatalogue();
    case "oddspapi:fixtures-near":
      return runOddspapiFixtures({
        label: "near",
        startOffset: 0,
        endOffset: Math.min(2, getFixturesDaysAhead() - 1),
      });
    case "oddspapi:fixtures-future":
      return runOddspapiFixtures({
        label: "future",
        daysAhead: getFixturesDaysAhead(),
      });
    case "oddspapi:fixtures-lookback":
      return runOddspapiFixturesLookback();
    case "oddspapi:odds-hot":
      return runOddspapiOdds({ tier: "hot" });
    case "oddspapi:odds-warm":
      return runOddspapiOdds({ tier: "warm" });
    case "oddspapi:odds-cold":
      return runOddspapiOdds({ tier: "cold" });
    default:
      throw new Error(`unknown oddspapi job ${name}`);
  }
}
