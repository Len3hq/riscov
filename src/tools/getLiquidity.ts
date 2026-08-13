import { ethers } from "ethers";
import { getAsset } from "../assetRegistry.ts";
import { getProvider, UNISWAP_V2_PAIR_ABI } from "../chain.ts";
import type { ToolDefinition } from "../agent/types.ts";

const BLOCKS_PER_DAY_ESTIMATE = 43200; // ~2s block time on X Layer (OP-Stack); adjust if wrong

async function getLiquidity(args: Record<string, unknown>): Promise<unknown> {
  const asset = String(args.asset ?? "");
  const cfg = getAsset(asset);

  if (!cfg.pairAddress) {
    return {
      asset,
      status: "not_configured",
      note: "No liquidity pair address registered for this asset in src/data/assets.json yet.",
    };
  }

  const provider = getProvider();
  const pair = new ethers.Contract(cfg.pairAddress, UNISWAP_V2_PAIR_ABI, provider);

  const [reserve0, reserve1] = await pair.getReserves!();
  const token0: string = await pair.token0!();
  const token1: string = await pair.token1!();

  const currentBlock = await provider.getBlockNumber();
  const lookbackBlock = Math.max(0, currentBlock - BLOCKS_PER_DAY_ESTIMATE);

  let trendPercent: number | null = null;
  try {
    const [prevReserve0] = await pair.getReserves!({ blockTag: lookbackBlock });
    const before = Number(ethers.formatUnits(prevReserve0, 0));
    const now = Number(ethers.formatUnits(reserve0, 0));
    if (before > 0) trendPercent = ((now - before) / before) * 100;
  } catch {
    // archive state may not be available on the RPC; trend stays null rather than fabricated
  }

  let tokenAgeDays: number | null = null;
  if (cfg.launchDate) {
    tokenAgeDays = Math.floor((Date.now() - new Date(cfg.launchDate).getTime()) / 86_400_000);
  }

  return {
    asset,
    pairAddress: cfg.pairAddress,
    token0,
    token1,
    reserve0: reserve0.toString(),
    reserve1: reserve1.toString(),
    trendPercentOverPast24hEstimate: trendPercent,
    tokenAgeDays,
    note:
      trendPercent === null
        ? "24h trend unavailable (RPC likely doesn't serve archive state at the lookback block) — reserves are current-block real values."
        : undefined,
  };
}

export const getLiquidityTool: ToolDefinition = {
  spec: {
    type: "function",
    function: {
      name: "getLiquidity",
      description:
        "Read current liquidity pool reserves for an asset on-chain (Uniswap V2-style pair), and an estimated 24h trend where archive RPC state is available. Real on-chain read, no thresholds applied.",
      parameters: {
        type: "object",
        properties: {
          asset: { type: "string", description: "Asset symbol, e.g. 'FROG'" },
        },
        required: ["asset"],
      },
    },
  },
  handler: getLiquidity,
};
