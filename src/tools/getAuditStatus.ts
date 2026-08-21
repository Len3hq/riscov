import { createHmac } from "node:crypto";
import { getAsset } from "../assetRegistry.ts";
import { getProvider } from "../chain.ts";
import { config } from "../config.ts";
import type { ToolDefinition } from "../agent/types.ts";

interface OkxMarketApiEnvelope {
  code: string;
  msg: string;
  data: unknown;
}

/**
 * OKX's Onchain OS Market API (web3.okx.com) — the SAME Developer Portal
 * credentials already required for x402 (OKX_API_KEY/SECRET/PASSPHRASE)
 * work here too; confirmed by a real signed call. There's no separate
 * "OKLink" account needed — oklink.com's own Explorer API self-serve signup
 * has been unavailable (that product's API was suspended May 2025), which
 * is why registering for OKLINK_API_KEY dead-ended. This endpoint
 * (token/advanced-info) is also richer than a plain verified/unverified
 * flag: risk tags, holder concentration, dev/sniper/bundle holding
 * percentages — real evidence for the agent to weigh, confirmed against
 * live X Layer mainnet tokens (chainIndex "196" = X Layer's chain id).
 */
function signOkxRequest(
  timestamp: string,
  method: string,
  requestPath: string,
  body: string
): string {
  return createHmac("sha256", config.okx.secretKey)
    .update(timestamp + method + requestPath + body)
    .digest("base64");
}

async function fetchOkxAdvancedInfo(tokenAddress: string): Promise<unknown> {
  const method = "GET";
  const requestPath = `/api/v6/dex/market/token/advanced-info?chainIndex=${config.xlayer.chainId}&tokenContractAddress=${tokenAddress}`;
  const timestamp = new Date().toISOString();

  const res = await fetch(`https://web3.okx.com${requestPath}`, {
    method,
    headers: {
      "OK-ACCESS-KEY": config.okx.apiKey,
      "OK-ACCESS-SIGN": signOkxRequest(timestamp, method, requestPath, ""),
      "OK-ACCESS-TIMESTAMP": timestamp,
      "OK-ACCESS-PASSPHRASE": config.okx.passphrase,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    throw new Error(`OKX Market API error: ${res.status} ${res.statusText}`);
  }
  const envelope = (await res.json()) as OkxMarketApiEnvelope;
  if (envelope.code !== "0") {
    throw new Error(`OKX Market API error: ${envelope.code} ${envelope.msg}`);
  }
  return envelope.data;
}

async function getAuditStatus(args: Record<string, unknown>): Promise<unknown> {
  const asset = String(args.asset ?? "");
  const cfg = getAsset(asset);

  if (!cfg.tokenAddress) {
    return {
      asset,
      status: "not_configured",
      note: "No token address registered for this asset in src/data/assets.json yet.",
    };
  }

  const hasOkxCreds = config.okx.apiKey && config.okx.secretKey && config.okx.passphrase;
  if (hasOkxCreds) {
    try {
      const data = await fetchOkxAdvancedInfo(cfg.tokenAddress);
      return {
        asset,
        tokenAddress: cfg.tokenAddress,
        source: "okx_onchainos_market_api_advanced_info",
        data,
        note: "Real risk/holder metadata from OKX's Onchain OS Market API — tokenTags, riskControlLevel, top10HoldPercent, dev/sniper/bundle holding percentages, etc. Not a simple verified/unverified flag; weigh it as evidence like any other signal.",
      };
    } catch (err) {
      // fall through to on-chain fallback below
      return getAuditStatusFallback(asset, cfg.tokenAddress, String(err));
    }
  }

  return getAuditStatusFallback(asset, cfg.tokenAddress);
}

async function getAuditStatusFallback(
  asset: string,
  tokenAddress: string,
  apiError?: string
): Promise<unknown> {
  const provider = getProvider();
  const bytecode = await provider.getCode(tokenAddress);
  return {
    asset,
    tokenAddress,
    source: "onchain_bytecode_check",
    isContract: bytecode !== "0x",
    bytecodeSizeBytes: bytecode === "0x" ? 0 : (bytecode.length - 2) / 2,
    note:
      "Verification/risk status unavailable without OKX_API_KEY/OKX_SECRET_KEY/OKX_PASSPHRASE (OKX Onchain OS Developer Portal). This only confirms a contract exists at this address, not that it's audited or its source is verified.",
    ...(apiError ? { apiError } : {}),
  };
}

export const getAuditStatusTool: ToolDefinition = {
  spec: {
    type: "function",
    function: {
      name: "getAuditStatus",
      description:
        "Check an asset's contract risk/verification signals. Real data: uses OKX's Onchain OS Market API (token/advanced-info — risk tags, holder concentration, dev/sniper/bundle holding percentages) if OKX credentials are set; otherwise falls back to an honest on-chain bytecode-existence check and says verification status is unknown.",
      parameters: {
        type: "object",
        properties: {
          asset: { type: "string", description: "Asset symbol, e.g. 'DEMO'" },
        },
        required: ["asset"],
      },
    },
  },
  handler: getAuditStatus,
};
