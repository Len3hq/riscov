import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import type { WatcherResult } from "../agent/types.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOGS_DIR = path.join(__dirname, "..", "..", "logs");
const REASONING_DIR = path.join(LOGS_DIR, "reasoning");

/**
 * Best-effort local persistence — never throws. Serverless hosts (e.g.
 * Vercel) run this on a read-only filesystem, and a logging failure must
 * never take down a request whose actual work (the rating) already
 * succeeded, especially on the paid endpoint where the payer has already
 * settled payment for that result by the time this runs.
 */
export function logResult(result: WatcherResult): string | null {
  try {
    mkdirSync(LOGS_DIR, { recursive: true });
    const safeAsset = result.asset.replace(/[^a-zA-Z0-9_-]/g, "_");
    const filename = `${safeAsset}-${result.timestamp.replace(/[:.]/g, "-")}.json`;
    const filepath = path.join(LOGS_DIR, filename);
    writeFileSync(filepath, JSON.stringify(result, null, 2), "utf-8");
    return filepath;
  } catch (err) {
    console.warn(`logResult: local logging skipped (${err instanceof Error ? err.message : err})`);
    return null;
  }
}

/**
 * The Ledger contract only stores a hash of the reasoning (to keep gas low).
 * This saves the actual reasoning text content-addressed by that same hash,
 * so anyone with the on-chain reasonHash can find and verify it locally.
 * Stands in for a real hosted endpoint/IPFS pin (Phase 4+).
 */
export function logReasoningByHash(reasonHash: string, result: WatcherResult): string | null {
  try {
    mkdirSync(REASONING_DIR, { recursive: true });
    const filepath = path.join(REASONING_DIR, `${reasonHash}.json`);
    writeFileSync(
      filepath,
      JSON.stringify(
        { asset: result.asset, rating: result.rating, reasoning: result.reasoning, evidenceCited: result.evidenceCited, timestamp: result.timestamp },
        null,
        2
      ),
      "utf-8"
    );
    return filepath;
  } catch (err) {
    console.warn(`logReasoningByHash: local logging skipped (${err instanceof Error ? err.message : err})`);
    return null;
  }
}

export function printResult(result: WatcherResult): void {
  const bar = "─".repeat(60);
  console.log(bar);
  console.log(`Asset:   ${result.asset}`);
  console.log(`Rating:  ${result.rating}`);
  console.log(`Turns:   ${result.modelTurns} | Tool calls: ${result.toolCalls.length}`);
  console.log(bar);
  console.log("Reasoning:");
  console.log(result.reasoning);
  console.log();
  console.log("Evidence cited:");
  for (const e of result.evidenceCited) console.log(`  - ${e}`);
  console.log();
  console.log("Tool call trace:");
  for (const tc of result.toolCalls) {
    console.log(`  [${tc.tookMs}ms] ${tc.tool}(${JSON.stringify(tc.args)})`);
  }
  console.log(bar);
}
