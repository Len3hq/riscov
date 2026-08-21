# riscov

**An AI agent that never stops watching.** riscov rates the real-time risk of assets on X Layer — not with a threshold formula, but with an LLM agent that gathers evidence itself (liquidity, audit status, real-world price, proof-of-reserve, recent news, past incident patterns), decides what else is worth checking based on what it finds, and reasons its way to a **Green / Yellow / Red** judgment with a plain-English explanation. The same "thin liquidity" signal reads as normal for a 3-day-old token and as a red flag for an established one that just lost 80% of its pool overnight — riscov is built to tell those apart, not flag both the same way.

**Live:** [riscov.vercel.app](https://riscov.vercel.app) · **Docs:** [riscov.vercel.app/docs](https://riscov.vercel.app/docs)

Built for the X Layer hackathon.

---

## What's actually live (not a mockup)

| Piece | Status |
|---|---|
| `RiscovLedger` contract | Deployed on X Layer mainnet: [`0x2398E782d566E257A9e289248309Af98bbeC1300`](https://www.oklink.com/xlayer/address/0x2398E782d566E257A9e289248309Af98bbeC1300) |
| `DemoMarket` contract | Deployed on X Layer mainnet: [`0x44E0C7BAF11b8a405B87F7134D5b4fF9780F09f0`](https://www.oklink.com/xlayer/address/0x44E0C7BAF11b8a405B87F7134D5b4fF9780F09f0) — its leverage limit is derived live from the Ledger's current rating, no separate transaction |
| ERC-8004 agent identity | Registered on X Layer mainnet — **agentId `11057`**, pointing at [`riscov.vercel.app/agent.json`](https://riscov.vercel.app/agent.json) |
| MCP tool | `checkAssetRisk` — free, hosted at [`riscov.vercel.app/mcp`](https://riscov.vercel.app/mcp), no cloning required (stdio also available locally via `npm run mcp:server`) |
| Paid endpoint | `POST /check-risk`, x402-gated, `$0.01` per call |
| Asset coverage | 8 real X Layer mainnet assets with live on-chain evidence — see below |

Every evidence tool is a real read against real infrastructure (X Layer RPC, Chainlink feeds, Google News), never a mock. If an asset isn't fully registered, the tool honestly reports "not configured" instead of inventing a number — see `src/data/assets.json`.

## Asset coverage today

| Asset | What's live |
|---|---|
| `BTC` | Chainlink price reference |
| `OKB` | X Layer's native gas token — token + price |
| `ETH` | token + price |
| `USDC` | token + price |
| `USDT0` | token + price |
| `XBTC` | OKX Wrapped BTC — token + price + proof-of-reserve |
| `XETH` | OKX Wrapped ETH — token + price + proof-of-reserve |
| `XSOL` | OKX Wrapped SOL — token + price + proof-of-reserve |

Liquidity depth isn't live for any asset yet — X Layer's only real DEX deployed concentrated-liquidity (V3 Algebra) pools, not the classic Uniswap-V2-shaped pair `getLiquidity` currently reads. **This list is growing as we add more assets and evidence sources, and we're actively looking for ecosystem support** — real liquidity pools to read from, more Chainlink coverage, and connections to projects building on X Layer who want their asset covered.

## Architecture

```
tools (raw evidence)  ──►  the Watcher (LLM agent)  ──►  the Ledger (X Layer)  ──►  consumers
```

- **Tools** fetch raw facts only — on-chain reads, Chainlink feeds, audit registries, web search, past-incident patterns. No rating logic lives here.
- **The Watcher** decides which tools to call and in what order, reads each result, decides whether to dig further, and concludes with a rating + written reasoning. Nothing is `if liquidity < X then Red` — the agent is the only thing that decides what the facts mean, in context.
- **The Ledger** (`RiscovLedger.sol`) stores the current rating on-chain, readable by anyone.
- **Consumers** — a market, another agent, or an ASP call — read or pay for that rating. `DemoMarket.sol` is the proof: its leverage cap changes automatically the moment the Ledger updates, no human in the loop.

Full write-up: [`/docs/overview`](https://riscov.vercel.app/docs/overview), [`/docs/architecture`](https://riscov.vercel.app/docs/architecture).

## Running it locally

```bash
npm install
cp .env.example .env   # fill in OPENAI_API_KEY at minimum; see .env.example for the rest

npm run check -- XBTC         # rate a single asset once (CLI)
npm run watch                 # run the Watcher on a timer for all registered assets
npm run mcp:server            # expose checkAssetRisk over MCP (stdio, local)
npm run mcp:http-server       # expose checkAssetRisk over MCP (streamable HTTP, local)
npm run paid:server           # run POST /check-risk locally, gated by x402
```

Full script and environment-variable reference: [`/docs/reference`](https://riscov.vercel.app/docs/reference).

## Why this is genuinely an AI product, not AI-washing

The rating is the agent's own conclusion, produced by a real tool-calling reasoning loop (`src/agent/watcher.ts`) — not a feature bolted onto a rule engine. Feed it the same "liquidity dropped" signal in two different contexts and it reaches two different, correctly-reasoned conclusions (see the worked example in [`RISCOV_IDEA.md`](RISCOV_IDEA.md)). If a rating could be reproduced by an if-statement, it isn't shipping.

## More context

- [`RISCOV_IDEA.md`](RISCOV_IDEA.md) — the pitch, in one worked example
- [`RISCOV_BUILD_PLAN.md`](RISCOV_BUILD_PLAN.md) — the full phased build plan this was built against
