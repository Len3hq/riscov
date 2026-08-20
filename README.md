# riscov

**Ris**k Dis**cov**ery — an AI agent that watches on-chain assets on X Layer and reasons about their risk in context, the way a human analyst would, instead of comparing numbers to fixed thresholds.

Live: **[riscov.vercel.app](https://riscov.vercel.app)**

---

## The problem

Most on-chain risk checks happen once, at listing, and never again. And the ones that do run continuously are usually `if liquidity < X then flag` — a rule that can't tell the difference between a 3-day-old token with normally-thin liquidity and an established token that just had 80% of its liquidity pulled overnight. Both look identical to a threshold. They are not identical to a human.

## What riscov does

riscov is an LLM agent — the **Watcher** — with a set of tools for gathering evidence about an asset (audit/verification status, liquidity depth and trend, real-world price feeds, recent team/news activity, known rug-pull patterns). Given an asset, it decides for itself which tools to call and in what order, follows up on red flags the way an analyst would, and weighs everything together into one judgment:

**Green / Yellow / Red — plus a plain-English explanation of why.**

That written reasoning is the product, not the color. The same "thin liquidity" signal can and should produce different ratings depending on what else is true about the asset — if it can't, it's a threshold wearing an LLM costume.

The rating gets written on-chain to a small ledger contract on **X Layer**, so any other contract, app, or agent can read it — and a tiny demo market contract shows what that's for: its max leverage is *derived live* from the ledger's current rating (Green → 20x, Yellow → 5x, Red → paused), with no manual transaction required when the rating changes.

## How it works

```
Tools (raw evidence)              The Watcher (LLM agent)         RiscovLedger (X Layer)        Consumers
──────────────────────            ────────────────────────        ───────────────────────       ─────────
getAuditStatus            ┐                                    ┌── submitRating(asset,       ┌── DemoMarket:
getLiquidity               ├─► agent picks which tools to call, ├──   rating, reasonHash)      ├──   maxLeverage()
getMarketPrice             │     in what order, based on what   │   getRating(asset) →         │     reads the
getReserveStatus           │     it finds so far                │     rating, timestamp,       │     ledger live —
searchRecentActivity       │   ─► reasons over combined evidence│     reasonHash               │     no push needed
getPastIncidentPatterns   ┘   ─► writes rating + explanation   ┘   event on every change      └── any MCP/x402
                                                                                                     consumer
```

Nothing in the tools decides the rating — they only fetch raw facts (on-chain reads, price feeds, audit registries, web/news search, a small library of past incident patterns). The agent is the only thing that turns those facts into a judgment, and it can chain tool calls: e.g. thin liquidity on its own can prompt it to check recent team activity before concluding, instead of stopping at the first number.

## Project structure

```
src/
  agent/watcher.ts        the Watcher — tool-use loop + reasoning
  tools/                  evidence-gathering functions the agent can call
  ledger.ts               writes/reads RiscovLedger on-chain
  demoMarket.ts           reads DemoMarket's derived leverage/pause state
  mcp/server.ts           exposes checkAssetRisk as an MCP tool
  paidServer.ts           x402 pay-per-call HTTP endpoint (POST /check-risk)
  scheduler.ts            re-checks registered assets on a timer
  cli.ts                  npm run check -- <ASSET> [--submit]
  demo.ts                 end-to-end scripted demo (see below)
contracts/
  RiscovLedger.sol        stores current rating + reasoning hash per asset
  DemoMarket.sol          leverage limits derived live from the ledger
web/                      React + Vite frontend (riscov.vercel.app)
skills/riscov-risk-check/ packaged Skill so any agent can add riscov in one command
```

## Quick start

```bash
npm install
cp .env.example .env   # fill in OPENAI_API_KEY at minimum
```

Run a risk check for a registered asset (see `src/data/assets.json`):

```bash
npm run check -- FROG
```

Add `--submit` to also write the result to `RiscovLedger` on-chain (needs `WATCHER_PRIVATE_KEY`, `LEDGER_CONTRACT_ADDRESS`, and testnet/mainnet gas):

```bash
npm run check -- FROG --submit
```

Run the full scripted demo — same asset, two points in time, two different signals in the same-looking data, two different on-chain outcomes:

```bash
npm run demo
```

Other useful scripts:

```bash
npm run watch                    # scheduler: re-check registered assets every WATCH_INTERVAL_MINUTES
npm run mcp:server                # start the MCP server (checkAssetRisk tool)
npm run paid:server                # start the x402-gated paid HTTP endpoint
npm run compile && npm run test:contracts   # Solidity contracts (Hardhat)
npm run deploy:testnet            # deploy RiscovLedger to X Layer testnet
```

See [.env.example](.env.example) for every environment variable and which phase of the build needs it.

## The demo, concretely

$FROG launches. Day 3: liquidity is thin, but the audit is clean and the team is active — riscov rates it **Yellow**, and `DemoMarket` opens at 5x leverage. Day 210: the same "thin liquidity" language would apply if you only looked at the raw number, but this time an 80% liquidity pull in under a day matches a known rug-pull pattern — riscov rates it **Red**, writes out exactly why, and `DemoMarket`'s leverage drops to 0 automatically, no separate transaction against the market contract. `npm run demo` runs both scenarios end to end.

## Tech stack

- **Agent**: OpenAI function-calling (tool-use loop), TypeScript
- **Chain**: X Layer (fully EVM-equivalent OP Stack chain) — testnet `1952`, mainnet `196` — via `ethers` / Hardhat
- **Distribution**: MCP (`@modelcontextprotocol/sdk`) for free/direct agent calls, [x402](https://x402.org) via `@okxweb3/x402-*` for pay-per-call, packaged as an installable Skill
- **Frontend**: React 19 + Vite, deployed to Vercel (`web/`)

## Design

Brand and UI tokens are specified in [files/RISCOV_DESIGN.md](files/RISCOV_DESIGN.md) — dark-only, square geometry, JetBrains Mono, a strict Green/Yellow/Red semantic palette used only for ratings, never decoration.

## Background

- [RISCOV_IDEA.md](RISCOV_IDEA.md) — the pitch, in full
- [RISCOV_BUILD_PLAN.md](RISCOV_BUILD_PLAN.md) — phased build plan and exit conditions for each phase
