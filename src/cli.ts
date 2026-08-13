import { runWatcher } from "./agent/watcher.ts";
import { logResult, logReasoningByHash, printResult } from "./logging/logger.ts";
import { listAssets } from "./assetRegistry.ts";
import { submitRatingOnChain } from "./ledger.ts";

async function main() {
  const args = process.argv.slice(2);
  const submit = args.includes("--submit");
  const asset = args.find((a) => !a.startsWith("--"));

  if (!asset) {
    console.error(`Usage: npm run check -- <ASSET_SYMBOL> [--submit]`);
    console.error(`  --submit   also write the resulting rating to RiscovLedger on-chain`);
    console.error(`Registered assets: ${listAssets().join(", ") || "(none yet — edit src/data/assets.json)"}`);
    process.exit(1);
  }

  console.log(`Checking ${asset}...`);
  const result = await runWatcher({ asset });
  printResult(result);
  const filepath = logResult(result);
  console.log(`Logged to ${filepath}`);

  if (submit) {
    console.log(`\nSubmitting rating to RiscovLedger on-chain...`);
    const submission = await submitRatingOnChain(result);
    logReasoningByHash(submission.reasonHash, result);
    console.log(`Tx: ${submission.txHash} (block ${submission.blockNumber})`);
    console.log(`assetId:    ${submission.assetId}`);
    console.log(`reasonHash: ${submission.reasonHash}`);
  }
}

main().catch((err) => {
  console.error("Watcher run failed:", err);
  process.exit(1);
});
