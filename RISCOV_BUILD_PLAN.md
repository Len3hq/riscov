# Riscov — Build Plan

## What we're building, in system terms

Three pieces, built in this order:

1. **The Watcher** — an LLM agent, not a rule engine. It has a set of tools (data lookups), decides for itself which ones to call and in what order for a given asset, and reasons over everything it finds to produce a Green/Yellow/Red rating with a written judgment. The rating is the agent's conclusion, not the output of a threshold formula.
2. **The Ledger** — a small smart contract on X Layer that stores the current rating for each thing being watched, and lets any other contract or app read it.
3. **The Storefront** — the way other apps and agents actually discover and pay for Riscov's ratings, built as an ASP (Agent Service Provider) inside OKX's AI agent marketplace.

```
Tools (raw evidence)          The Watcher (LLM agent, off-chain)              The Ledger (X Layer)       Consumers
─────────────────             ───────────────────────────────────            ──────────────────         ──────────
on-chain reads            ┐                                              ┌──  written rating +     ┌──  a market someone
price/RWA feeds (Chainlink)├──► agent picks which tools to call,         ├──  judgment stored,       ├──  built on X Layer
audit registries           │      in what order, based on what it finds   │      readable by anyone   │
web/doc search              │    ──► reasons over the combined evidence   │                            └──  another agent,
past-incident patterns     ┘    ──► writes rating + explanation          ┘                                  via ASP call
```

The important shift from a normal oracle: nothing here is `if liquidity < X then Red`. The tools just fetch raw facts. The agent is the only thing that decides what those facts mean, in context — and that judgment, not a formula, is the product.

---

## Phase 0 — Scope and setup (before writing any code)

- Pick the **first set of tools the agent can call** for the demo. These are raw-data fetchers only — don't build rating logic into any of them. Each tool answers one factual question and hands the answer to the agent; the agent decides what it means:
  - `getAuditStatus(asset)` — is the contract verified/audited, and when? (public audit registries, block explorer verification status)
  - `getLiquidity(asset)` — current liquidity depth and recent trend (on-chain read of the liquidity pool)
  - `getReserveStatus(asset)` — for stablecoins, is the reserve actually backed? (Chainlink Proof of Reserve — already live infrastructure, don't rebuild it)
  - `getMarketPrice(asset)` — real-world price/deviation for RWA-priced assets (Chainlink Data Streams, already live on X Layer)
  - `searchRecentActivity(asset)` — an open-ended tool the agent can call to pull recent news, governance posts, or team activity via web search/LLM read. This is what lets the agent go find things nobody explicitly coded a check for — the clearest "AI capability," not plumbing.
  - `getPastIncidentPatterns(asset)` — a small reference set of past rug-pulls/exploits the agent can compare current behavior against, so its reasoning can say "this looks like X" instead of just restating raw numbers.
- Set up X Layer accounts: get on the **testnet** first (chain ID 1952, RPC `testrpc.xlayer.tech`), claim testnet funds from the faucet, and only move to mainnet (chain ID 196, RPC `rpc.xlayer.tech`) once the demo works end-to-end.
- Open the **OKX Onchain OS developer portal** and register a project to get an API key — needed later for ASP registration and for pulling market/price data through OKX's own MCP tools instead of hand-rolling every data source.
- Create the dedicated X (Twitter) account for Riscov now — it's a hard requirement for the hackathon submission, and having it live early lets you post build progress, which hackathon judges do look at.

**Exit condition:** you can hit each evidence source manually (a script, a curl command, whatever) and get a real value back for at least one real X Layer asset.

---

## Phase 1 — The Watcher (the agent, not a rule engine)

This is the core of the whole project, and the part that makes or breaks the "AI hackathon" pitch — get it right before touching the chain.

- Implement each Phase 0 tool as a plain function the agent can call (standard LLM tool-use / function-calling — any modern agent framework or raw function-calling API works).
- Give the LLM the tools and a single instruction: figure out how risky this asset is right now, decide which tools you need to answer that, call them, and explain your conclusion. Do **not** write threshold logic that pre-decides the rating anywhere — the agent reads the raw tool outputs and reasons over them itself. If a rating can be reproduced by an if-statement, the agent isn't doing its job.
- Let the agent call tools in sequence based on what it finds — e.g., if `getLiquidity` comes back thin, that result should be able to prompt it to call `searchRecentActivity` before concluding, the same way a human analyst follows up on a red flag instead of stopping at the first number. This loop — call a tool, read the result, decide whether another call is warranted, conclude — is what makes it an agent instead of a script.
- The agent's output is always two things together: a rating (Green/Yellow/Red) and a written judgment explaining *why*, referencing the specific evidence it weighed — e.g. "liquidity is thin, but that's normal for a token this age, and the audit and team activity are clean, so this reads as early-stage risk, not danger," not a templated "liquidity: yellow, audit: green."
- Use `getPastIncidentPatterns` so the agent can explicitly compare current behavior to known bad patterns when relevant — this is what lets a rating change say "this matches the pattern of a coordinated liquidity withdrawal" instead of just "liquidity dropped."
- Run this on a timer (e.g. every few minutes) for whatever assets are registered, plus an on-demand "check now" trigger for the demo.
- Log every rating and its full reasoning locally before touching the chain at all — this is your test harness, and also your best demo material.

**Exit condition:** feed the agent the *same* thin-liquidity signal in two different contexts — a 3-day-old token, versus a token that's been stable for months and just lost 80% of its liquidity overnight — and confirm it reaches two different, correctly-reasoned conclusions (Yellow for the first, Red for the second). If it rates both the same way, it's still behaving like a threshold rule wearing an LLM costume, and Phase 1 isn't done.

---

## Phase 2 — The Ledger (on-chain contract)

- A minimal Solidity contract deployed on X Layer with:
  - `submitRating(assetId, rating, reasonHash)` — callable only by the Watcher's wallet address for v1.
  - `getRating(assetId)` — public read, returns current rating + timestamp + a pointer to the full reasoning text (store the full reasoning off-chain, e.g. on a simple hosted endpoint or IPFS, and put just a hash/link on-chain to keep gas low).
  - An event emitted on every rating change, so consumers can subscribe instead of polling.
- Deploy to testnet first using the standard X Layer deploy tooling (Hardhat/Foundry both work — X Layer is fully EVM-equivalent, no special opcodes needed). OKX also publishes a ready-made deploy script (`okx/Deploy` on GitHub) worth starting from instead of writing deployment scripts from scratch.
- Wire the Watcher to actually call `submitRating` after Phase 1's local testing passes.

**Exit condition:** a rating change produced by the Watcher shows up on-chain, on X Layer testnet, readable by any wallet or block explorer.

---

## Phase 3 — Prove it changes something (the consumer demo)

A rating nobody acts on is just a number, and a demo that only shows a number flipping doesn't prove AI did anything — a threshold could produce the same flip. Build the demo to show the **reasoning**, not just the rating.

- Simplest version: a tiny demo contract representing a market (doesn't need to be a real, liquid market) whose max-leverage or max-borrow value reads from the Ledger and changes automatically: Green → normal limits, Yellow → reduced limits, Red → paused/frozen.
- Run the Phase 1 exit-condition scenario live in the demo: show the agent rating the *same* thin-liquidity signal as Yellow for a young token, then re-rate a similar signal as Red for an established token because of the pattern match — with its written reasoning displayed both times. This is the moment judges see it's not a threshold: identical-looking data, different conclusion, explained in plain English.
- Show the consumer contract's limits change on-chain, live, immediately after the rating change — no manual transaction from you.
- This is the whole story in one screen: agent reasons → rating changes → consumer's numbers change → no human in the loop, and the reasoning text on screen is what proves it isn't just an if-statement.

**Exit condition:** a single scripted demo — run both signal scenarios, show the agent's differing reasoning for each, watch the rating update on-chain, watch the consumer's limits update in response — runnable end to end in under three minutes.

---

## Phase 4 — Become an ASP (distribution, not just a demo)

This phase is what turns Riscov from "a project that runs a contract" into "a service other agents can actually find and pay for" — and it's cheap to do.

- Register the Watcher as an **Agent Service Provider** on OKX.AI. Two registration modes exist: **Agent-to-MCP** (expose Riscov's rating-check as a callable tool other AI agents/LLM apps can invoke directly, pay-per-call) and **Agent-to-Agent** (other agents negotiate price/scope with Riscov directly, settled through escrow). Start with Agent-to-MCP — it's the simpler, more standardized path and fits a "call this function, get a rating back" product well.
- Paid calls go through **x402** (OKX's pay-per-call payment rail) — this is the billing system; you don't need to build one.
- Package Riscov's check as a **Skill** so any agent can add it with one command (`npx skills add <riscov-skill>`), mirroring how OKX's own DEX/market tools are distributed (`okx/onchainos-skills`) — makes Riscov trivially installable by any other builder's agent, not just something they have to hand-integrate.
- Register the Watcher's identity under **ERC-8004** (the on-chain agent identity/reputation standard, live since Jan 2026) so its track record — how often it's right, how fast it responds — is checkable by any consumer independently of trusting OKX's marketplace alone. This is a small amount of extra setup for a real trust signal.

**Exit condition:** another agent (even a throwaway test script acting as one) can discover Riscov via MCP, call it, pay for the call, and get a rating back — with no manual coordination from you.

---

## Phase 5 — Harden trust (post-hackathon, don't build for the demo)

- Right now, Phase 2's Ledger trusts the Watcher's wallet completely — fine for a demo, not fine for real money. Add a short **challenge window**: a submitted rating change doesn't finalize immediately, it sits for a defined period during which a staked party can dispute it with counter-evidence. This is the standard pattern other risk-oracle products already use in production — don't invent a new mechanism, borrow the propose-then-challenge shape.
- Add a second, independent evidence path per tool where possible, so one bad data source can't skew the agent's reasoning alone.

## Phase 6 — Grow coverage and consumers

- Expand the agent's tool set toward fuller coverage, prioritizing whichever evidence types real early consumers actually ask for — not a fixed roadmap decided in advance.
- Add a push/subscription tier (webhook on rating change) for consumers who don't want to poll.
- Look for a second and third real consumer beyond the demo market — the goal after the hackathon is paying, independent integrations, not a bigger demo.

---

## Practical notes specific to X Layer + timeline

- X Layer is fully EVM-equivalent (built on an enhanced OP Stack) — standard Solidity, standard Hardhat/Foundry tooling, no exotic opcodes to learn.
- Testnet chain ID **1952**, mainnet chain ID **196** — double-check this before every deploy, mixing them up is the most common dumb mistake in a rushed build.
- The OKX Onchain OS MCP servers already expose DEX/market data as callable tools — use those for evidence-gathering where they overlap with what Riscov needs (liquidity, price data) instead of writing custom on-chain read logic for things OKX already serves.
- Submission requires: AI genuinely built into the product — easily satisfied now, since the agent's tool-use-and-reasoning loop *is* the rating logic, not a feature layered on top of it — plus independent deployment on X Layer, a dedicated X account, and tagging @XLayerOfficial when submitting. All four are checked; don't skip the account/tag step at the end when rushed.
