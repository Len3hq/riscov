---
name: riscov-risk-check
description: Get an AI-reasoned Green/Yellow/Red risk rating, with plain-English justification, for an on-chain asset on X Layer — via Riscov's Watcher agent.
---

# Riscov Risk Check

Riscov's Watcher is an LLM agent — not a threshold rule — that gathers evidence about an on-chain asset (liquidity, audit/verification status, recent news and team activity, and known rug-pull/exploit patterns) and reasons about it in context to produce a **Green / Yellow / Red** rating plus a written explanation of why. The same raw signal (e.g. thin liquidity) can be rated differently depending on context (a 3-day-old token vs. an established one that just lost 80% of its liquidity overnight) — that contextual judgment is the product, not a number crossing a line.

## When to use this skill

Use this whenever you need to answer "is this X Layer asset safe right now, and why?" before quoting a price, opening a position, listing a market, or setting risk limits (e.g. max leverage/borrow) against it.

## How to call it

### Option A — MCP (free, direct)

Riscov exposes a `checkAssetRisk` tool over MCP (stdio transport). Any MCP-speaking agent can spawn and call it directly:

```json
{
  "command": "npx",
  "args": ["tsx", "src/mcp/server.ts"],
  "cwd": "<path to the riscov repo>"
}
```

Tool: `checkAssetRisk({ asset: string })` → returns `{ asset, rating, reasoning, evidenceCited, timestamp }`.

See `src/mcp/testClient.ts` in this repo for a minimal working example of connecting and calling it.

### Option B — Paid HTTP endpoint (x402, pay-per-call)

For production/marketplace use (e.g. as an OKX Agent-to-MCP ASP), Riscov also runs a paid HTTP endpoint gated by the [x402 protocol](https://x402.org) — `POST /check-risk` with `{ "asset": "<symbol>" }`, priced per call, settled on X Layer. See `src/paidServer.ts` and `src/paidClient.ts` for the resource-server and paying-client implementations. Endpoint URL and price are set by whoever deploys the server (not fixed here) — check with the Riscov operator or the OKX.AI marketplace listing once registered.

## Interpreting the result

- `rating`: `"Green"`, `"Yellow"`, or `"Red"` — the Watcher's overall judgment, not a formula output.
- `reasoning`: plain-English explanation citing the *specific* evidence weighed together — read this, don't just branch on the rating. A Yellow with reasoning "thin liquidity, but normal for a 3-day-old token" is a very different situation from a Yellow with reasoning "liquidity dropping steadily, borderline pattern match."
- `evidenceCited`: short list of the concrete facts the rating rests on.

## What this skill does NOT do

It doesn't hold funds, execute trades, or guarantee an asset is safe — it's one input (a reasoned opinion, refreshed on demand or on a timer) to combine with your own risk process, the same way you'd weigh a human analyst's note.
