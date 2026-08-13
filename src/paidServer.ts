/**
 * Phase 4: the paid, x402-gated resource server — the piece a real OKX
 * Agent-to-MCP ASP registration would point at ("paid endpoints must
 * support x402"). Runs on Base Sepolia testnet by default so it's testable
 * with free faucet funds; flip X402_NETWORK/X402_PAY_TO_ADDRESS to go live
 * on Base mainnet once there's real revenue to collect.
 */
import express from "express";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { runWatcher } from "./agent/watcher.ts";
import { logResult } from "./logging/logger.ts";

const PORT = Number(process.env.PAID_SERVER_PORT || 4021);
const PAY_TO = process.env.X402_PAY_TO_ADDRESS;
const NETWORK = (process.env.X402_NETWORK || "eip155:84532") as `${string}:${string}`; // Base Sepolia testnet
const FACILITATOR_URL = process.env.X402_FACILITATOR_URL || "https://x402.org/facilitator";
const PRICE = process.env.X402_PRICE_USDC || "$0.01";

if (!PAY_TO) {
  throw new Error(
    "Missing X402_PAY_TO_ADDRESS — the wallet that receives payment for rating checks."
  );
}

const app = express();
app.use(express.json());

const facilitatorClient = new HTTPFacilitatorClient({ url: FACILITATOR_URL });
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
