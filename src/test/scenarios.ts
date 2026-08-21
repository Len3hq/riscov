/**
 * Phase 1 exit-condition harness (see RISCOV_BUILD_PLAN.md):
 * feed the agent the SAME "thin/dropping liquidity" signal in two different
 * contexts and confirm it reaches two different, correctly-reasoned conclusions.
 */
import { runWatcher } from "../agent/watcher.ts";
import { printResult, logResult } from "../logging/logger.ts";
import { youngTokenScenarioTools, establishedTokenScenarioTools } from "./fixtures.ts";

async function main() {
  console.log("=== Scenario 1: 3-day-old token, thin (but stable) liquidity ===");
  const r1 = await runWatcher({ asset: "DEMO-YOUNG", tools: youngTokenScenarioTools });
  printResult(r1);
  logResult(r1);

  console.log("\n=== Scenario 2: 210-day-old token, same-looking liquidity signal but an 80% overnight drop ===");
  const r2 = await runWatcher({ asset: "DEMO-ESTABLISHED", tools: establishedTokenScenarioTools });
  printResult(r2);
  logResult(r2);

  console.log("\n=== Exit condition check ===");
  console.log(`Scenario 1 rating: ${r1.rating} (expected: Yellow)`);
  console.log(`Scenario 2 rating: ${r2.rating} (expected: Red)`);

  const passed = r1.rating !== r2.rating && r2.rating === "Red";
  if (passed) {
    console.log("PASS — the agent reasoned differently about the same-looking signal in different contexts.");
  } else {
    console.log(
      "FAIL — ratings did not diverge as expected. If both ratings match, the agent is behaving like a threshold rule; check the system prompt and tool outputs above."
    );
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error("Scenario test failed:", err);
  process.exit(1);
});
