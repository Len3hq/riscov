import { getAsset } from "../assetRegistry.ts";
import { getProvider } from "../chain.ts";
import { config } from "../config.ts";
import type { ToolDefinition } from "../agent/types.ts";

async function fetchOklinkVerification(tokenAddress: string): Promise<unknown> {
  const url = `https://www.oklink.com/api/v5/explorer/contract/verify-source-code-list?chainShortName=xlayer&address=${tokenAddress}`;
  const res = await fetch(url, {
    headers: { "Ok-Access-Key": config.oklinkApiKey },
  });
  if (!res.ok) {
    throw new Error(`OKLink API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
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

  if (config.oklinkApiKey) {
    try {
      const data = await fetchOklinkVerification(cfg.tokenAddress);
      return { asset, tokenAddress: cfg.tokenAddress, source: "oklink_verification_api", data };
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
  oklinkError?: string
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
      "Verification/audit status unavailable without OKLINK_API_KEY (Phase 0: register on OKX Onchain OS developer portal). This only confirms a contract exists at this address, not that it's audited or its source is verified.",
    ...(oklinkError ? { oklinkError } : {}),
  };
}

export const getAuditStatusTool: ToolDefinition = {
  spec: {
    type: "function",
    function: {
      name: "getAuditStatus",
      description:
        "Check whether an asset's contract is verified/audited and when. Real data: uses OKLink's X Layer explorer API if OKLINK_API_KEY is set; otherwise falls back to an honest on-chain bytecode-existence check and says verification status is unknown.",
      parameters: {
        type: "object",
        properties: {
          asset: { type: "string", description: "Asset symbol, e.g. 'FROG'" },
        },
        required: ["asset"],
      },
    },
  },
  handler: getAuditStatus,
};
