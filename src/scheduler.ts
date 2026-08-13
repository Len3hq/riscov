import { runWatcher } from "./agent/watcher.ts";
import { logResult, printResult } from "./logging/logger.ts";
import { listAssets } from "./assetRegistry.ts";
import { config } from "./config.ts";

async function checkAll() {
  const assets = listAssets();
  for (const asset of assets) {
    try {
      console.log(`\n[${new Date().toISOString()}] Checking ${asset}...`);
      const result = await runWatcher({ asset });
      printResult(result);
      logResult(result);
    } catch (err) {
      console.error(`Watcher run failed for ${asset}:`, err);
    }
  }
}

async function main() {
  const intervalMs = config.watchIntervalMinutes * 60_000;
  console.log(
    `Riscov Watcher starting — checking [${listAssets().join(", ")}] every ${config.watchIntervalMinutes} minute(s). Ctrl+C to stop.`
  );

  await checkAll();
  setInterval(checkAll, intervalMs);
}

main().catch((err) => {
  console.error("Scheduler failed to start:", err);
  process.exit(1);
});
