/**
 * Phase 3 exit condition (see RISCOV_BUILD_PLAN.md):
 * run both signal scenarios, show the agent's differing reasoning for each,
 * watch the rating update on-chain, watch DemoMarket's limits update in
 * response — end to end, no manual transaction against DemoMarket itself.
 */
import { runWatcher } from "./agent/watcher.ts";
import { printResult, logResult, logReasoningByHash } from "./logging/logger.ts";
import { youngTokenScenarioTools, establishedTokenScenarioTools } from "./test/fixtures.ts";
import { submitRatingOnChain } from "./ledger.ts";
import { readDemoMarketStatus } from "./demoMarket.ts";
import { config } from "./config.ts";

function printMarketStatus(label: string, status: Awaited<ReturnType<typeof readDemoMarketStatus>>) {
  const bar = "═".repeat(60);
  console.log(bar);
  console.log(`DemoMarket status — ${label}`);
  console.log(bar);
  console.log(`  Ledger rating:  ${status.rating ?? "(none yet)"}`);
  console.log(`  Max leverage:   ${status.maxLeverage}x`);
  console.log(`  Paused:         ${status.isPaused}`);
  console.log(bar);
}

async function step(label: string, tools: Parameters<typeof runWatcher>[0]["tools"], asset: string) {
  console.log(`\n>>> ${label}`);
  const result = await runWatcher({ asset, tools });
  printResult(result);
  logResult(result);

  console.log(`\nSubmitting to RiscovLedger on-chain...`);
  const submission = await submitRatingOnChain(result);
  logReasoningByHash(submission.reasonHash, result);
  console.log(`Tx: ${submission.txHash} (block ${submission.blockNumber})`);

  console.log(`\nReading DemoMarket — no transaction sent to DemoMarket itself:`);
  const status = await readDemoMarketStatus();
  printMarketStatus(label, status);

  return { result, status };
}

async function main() {
  const started = Date.now();
  const asset = config.demoMarket.assetSymbol;

  console.log(`Riscov Phase 3 demo — asset "${asset}"`);
  console.log(
    `Same asset, two points in time: a 3-day-old launch, then the same token 210 days in after a sudden liquidity withdrawal.\n`
  );

  const scenario1 = await step(
    "Scenario 1 — 3-day-old token, thin (but stable) liquidity",
    youngTokenScenarioTools,
    asset
  );

  const scenario2 = await step(
    "Scenario 2 — same asset, 210 days later: same-looking liquidity signal, but an 80% overnight drop",
    establishedTokenScenarioTools,
    asset
  );

  const elapsedSec = ((Date.now() - started) / 1000).toFixed(1);

  console.log(`\n${"#".repeat(60)}`);
  console.log("Summary");
  console.log("#".repeat(60));
  console.log(`Scenario 1: rating=${scenario1.result.rating}  maxLeverage=${scenario1.status.maxLeverage}x  paused=${scenario1.status.isPaused}`);
  console.log(`Scenario 2: rating=${scenario2.result.rating}  maxLeverage=${scenario2.status.maxLeverage}x  paused=${scenario2.status.isPaused}`);
  console.log(`\nElapsed: ${elapsedSec}s`);

  const flipped =
    scenario1.result.rating !== scenario2.result.rating &&
    scenario1.status.maxLeverage !== scenario2.status.maxLeverage;

  if (flipped) {
    console.log(
      "\nPASS — the agent reasoned differently about the same-looking signal in two contexts, the rating changed on-chain, and DemoMarket's limits followed automatically with no separate transaction against it."
    );
  } else {
    console.log("\nFAIL — DemoMarket limits did not change between scenarios as expected.");
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error("Demo run failed:", err);
  process.exit(1);
});
