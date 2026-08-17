/**
 * Phase 4: the paid, x402-gated resource server — the piece a real OKX
 * Agent-to-MCP ASP registration would point at ("paid endpoints must
 * support x402"). Runs on X Layer via OKX's Onchain OS facilitator — no
 * alternate chain, per project policy. Requires an OKX Developer Portal
 * account (Phase 0): register at the OKX Onchain OS developer portal to get
 * an API key, and set OKX_API_KEY / OKX_SECRET_KEY / OKX_PASSPHRASE plus
 * X402_NETWORK / X402_FACILITATOR_URL in .env before running this.
 */
import express from "express";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { runWatcher } from "./agent/watcher.ts";
import { logResult } from "./logging/logger.ts";

const PORT = Number(process.env.PAID_SERVER_PORT || 4021);
const PAY_TO = process.env.X402_PAY_TO_ADDRESS;
const NETWORK = process.env.X402_NETWORK as `${string}:${string}` | undefined;
const FACILITATOR_URL = process.env.X402_FACILITATOR_URL;
const PRICE = process.env.X402_PRICE_USDC || "$0.01";
const OKX_API_KEY = process.env.OKX_API_KEY;
const OKX_SECRET_KEY = process.env.OKX_SECRET_KEY;
const OKX_PASSPHRASE = process.env.OKX_PASSPHRASE;

if (!PAY_TO || !NETWORK || !FACILITATOR_URL || !OKX_API_KEY || !OKX_SECRET_KEY || !OKX_PASSPHRASE) {
  throw new Error(
    "Missing X Layer/OKX config. This project only pays through X Layer — no alternate chain fallback.\n" +
      "Register a project at the OKX Onchain OS developer portal, then set in .env:\n" +
      "  OKX_API_KEY, OKX_SECRET_KEY, OKX_PASSPHRASE (from the portal)\n" +
      "  X402_NETWORK        (X Layer CAIP-2 id, e.g. eip155:196 for mainnet or eip155:1952 for testnet)\n" +
      "  X402_FACILITATOR_URL (OKX's x402 facilitator endpoint)\n" +
      "  X402_PAY_TO_ADDRESS  (wallet that receives payment)"
  );
}

const app = express();
app.use(express.json());

// OKX's facilitator authenticates via API key/secret/passphrase headers,
// same credential trio used across OKX's Onchain OS APIs (mirrors OKLink).
const facilitatorClient = new HTTPFacilitatorClient({
  url: FACILITATOR_URL,
  createAuthHeaders: async () => {
    const headers = {
      "OK-ACCESS-KEY": OKX_API_KEY,
      "OK-ACCESS-PASSPHRASE": OKX_PASSPHRASE,
      // NOTE: OKX's signing scheme (timestamp + HMAC of method/path/body with
      // OKX_SECRET_KEY) needs to be filled in against their actual x402 auth
      // docs once the portal account exists — this is a placeholder shape.
    };
    return { verify: headers, settle: headers };
  },
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

app.listen(PORT, () => {
  console.log(
    `Riscov paid endpoint listening on :${PORT} — POST /check-risk, ${PRICE} per call (${NETWORK}, facilitator ${FACILITATOR_URL})`
  );
});
