/**
 * Phase 4: the paid, x402-gated resource server — the piece a real OKX
 * Agent-to-MCP ASP registration would point at ("paid endpoints must
 * support x402"). Runs on X Layer via OKX's own Onchain OS x402 SDK
 * (@okxweb3/x402-*, not the generic x402 packages — OKXFacilitatorClient
 * signs facilitator calls per OKX's HMAC-SHA256 REST auth spec internally)
 * — no alternate chain, per project policy. Requires an OKX Developer
 * Portal account (Phase 0): register at the OKX Onchain OS developer portal
 * to get an API key, and set OKX_API_KEY / OKX_SECRET_KEY / OKX_PASSPHRASE
 * plus X402_NETWORK in .env before running this.
 *
 * This module exports the configured Express app without binding a port, so
 * it can be reused both by src/paidServer.ts (app.listen(), for local/VPS
 * hosting) and api/index.ts (Vercel serverless entry point).
 */
import express from "express";
import { paymentMiddleware } from "@okxweb3/x402-express";
import { x402ResourceServer } from "@okxweb3/x402-core/server";
import { OKXFacilitatorClient } from "@okxweb3/x402-core";
import { ExactEvmScheme } from "@okxweb3/x402-evm/exact/server";
import { runWatcher } from "./agent/watcher.ts";
import { logResult } from "./logging/logger.ts";

export const PAY_TO = process.env.X402_PAY_TO_ADDRESS;
export const NETWORK = process.env.X402_NETWORK as `${string}:${string}` | undefined;
export const FACILITATOR_URL = process.env.X402_FACILITATOR_URL;
export const PRICE = process.env.X402_PRICE_USDC || "$0.01";
const OKX_API_KEY = process.env.OKX_API_KEY;
const OKX_SECRET_KEY = process.env.OKX_SECRET_KEY;
const OKX_PASSPHRASE = process.env.OKX_PASSPHRASE;

if (!PAY_TO || !NETWORK || !OKX_API_KEY || !OKX_SECRET_KEY || !OKX_PASSPHRASE) {
  throw new Error(
    "Missing X Layer/OKX config. This project only pays through X Layer — no alternate chain fallback.\n" +
      "Register a project at the OKX Onchain OS developer portal, then set in .env (or your host's\n" +
      "environment variables):\n" +
      "  OKX_API_KEY, OKX_SECRET_KEY, OKX_PASSPHRASE (from the portal)\n" +
      "  X402_NETWORK        (X Layer CAIP-2 id, e.g. eip155:196 for mainnet or eip155:1952 for testnet)\n" +
      "  X402_PAY_TO_ADDRESS  (wallet that receives payment)"
  );
}

export const app = express();
app.use(express.json());

// OKXFacilitatorClient signs verify/settle calls with OKX's HMAC-SHA256 REST
// auth (OK-ACCESS-KEY/SIGN/TIMESTAMP/PASSPHRASE headers) internally — no
// manual header-building needed. Defaults baseUrl to https://web3.okx.com
// (OKX's Onchain OS facilitator) unless X402_FACILITATOR_URL overrides it.
const facilitatorClient = new OKXFacilitatorClient({
  apiKey: OKX_API_KEY,
  secretKey: OKX_SECRET_KEY,
  passphrase: OKX_PASSPHRASE,
  ...(FACILITATOR_URL ? { baseUrl: FACILITATOR_URL } : {}),
});
const resourceServer = new x402ResourceServer(facilitatorClient).register(
  NETWORK,
  new ExactEvmScheme()
);

app.use(
  paymentMiddleware(
    {
      "POST /check-risk": {
        accepts: {
          scheme: "exact",
          price: PRICE,
          network: NETWORK,
          payTo: PAY_TO,
        },
        description: "Riscov risk rating + reasoning for one asset",
        mimeType: "application/json",
      },
    },
    resourceServer
  )
);

app.post("/check-risk", async (req, res) => {
  const asset = req.body?.asset;
  if (!asset || typeof asset !== "string") {
    res.status(400).json({ error: "Missing 'asset' string in request body" });
    return;
  }
  try {
    const result = await runWatcher({ asset });
    logResult(result);
    res.json({
      asset: result.asset,
      rating: result.rating,
      reasoning: result.reasoning,
      evidenceCited: result.evidenceCited,
      timestamp: result.timestamp,
    });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});
