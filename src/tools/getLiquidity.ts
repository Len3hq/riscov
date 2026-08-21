import { ethers } from "ethers";
import { getAsset } from "../assetRegistry.ts";
import { getProvider, ALGEBRA_POOL_ABI, ERC20_ABI } from "../chain.ts";
import type { ToolDefinition } from "../agent/types.ts";

const BLOCKS_PER_DAY_ESTIMATE = 43200; // ~2s block time on X Layer (OP-Stack); adjust if wrong

async function getLiquidity(args: Record<string, unknown>): Promise<unknown> {
  const asset = String(args.asset ?? "");
  const cfg = getAsset(asset);

  if (!cfg.pairAddress) {
    return {
      asset,
      status: "not_configured",
      note: "No liquidity pool address registered for this asset in src/data/assets.json yet — either not added, or no real QuickSwap pool exists for it against a major quote token.",
    };
  }

  const provider = getProvider();
  const pool = new ethers.Contract(cfg.pairAddress, ALGEBRA_POOL_ABI, provider);

  const [token0Address, token1Address, activeLiquidity]: [string, string, bigint] = await Promise.all([
    pool.token0!(),
    pool.token1!(),
    pool.liquidity!(),
  ]);
  const token0Contract = new ethers.Contract(token0Address, ERC20_ABI, provider);
  const token1Contract = new ethers.Contract(token1Address, ERC20_ABI, provider);
  const [reserve0Raw, reserve1Raw, decimals0, decimals1, symbol0, symbol1]: [
    bigint,
    bigint,
    bigint,
    bigint,
    string,
    string,
  ] = await Promise.all([
    token0Contract.balanceOf!(cfg.pairAddress),
    token1Contract.balanceOf!(cfg.pairAddress),
    token0Contract.decimals!(),
    token1Contract.decimals!(),
    token0Contract.symbol!(),
    token1Contract.symbol!(),
  ]);

  const currentBlock = await provider.getBlockNumber();
  const lookbackBlock = Math.max(0, currentBlock - BLOCKS_PER_DAY_ESTIMATE);

  let trendPercent: number | null = null;
  try {
    const prevReserve0Raw: bigint = await token0Contract.balanceOf!(cfg.pairAddress, {
      blockTag: lookbackBlock,
    });
    const before = Number(ethers.formatUnits(prevReserve0Raw, 0));
    const now = Number(ethers.formatUnits(reserve0Raw, 0));
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
    poolAddress: cfg.pairAddress,
    dex: "QuickSwap (Algebra V3, concentrated liquidity)",
    // Human-readable token amounts (decimal-adjusted), not raw base units —
    // each is that token's actual ERC20 balance held by the pool contract,
    // not a V2-style constant-product reserve (this pool has no single
    // reserve curve; it's concentrated liquidity).
    token0: { symbol: symbol0, address: token0Address, balance: ethers.formatUnits(reserve0Raw, decimals0) },
    token1: { symbol: symbol1, address: token1Address, balance: ethers.formatUnits(reserve1Raw, decimals1) },
    // Whether any liquidity is currently active at the pool's present
    // price — not a token amount or a dollar figure, so no magnitude is
    // reported (Algebra's raw liquidity() value is an internal sqrt-price
    // math unit, not comparable to a balance).
    hasActiveLiquidityInRange: activeLiquidity > 0n,
    // Pre-formatted with an explicit "%" so this can't be misread as a
    // fraction needing another ×100 (a real, observed misreading of the
    // previous raw-float field, e.g. -0.23 taken as -23%).
    trendOverPast24hEstimate: trendPercent === null ? null : `${trendPercent.toFixed(2)}%`,
    tokenAgeDays,
    note:
      trendPercent === null
        ? "24h trend unavailable (RPC likely doesn't serve archive state at the lookback block) — balances above are current-block real values."
        : undefined,
  };
}

export const getLiquidityTool: ToolDefinition = {
  spec: {
    type: "function",
    function: {
      name: "getLiquidity",
      description:
        "Read current liquidity pool state for an asset on-chain — token balances held by its QuickSwap Algebra V3 pool plus the pool's active in-range liquidity — and an estimated 24h trend where archive RPC state is available. Real on-chain read, no thresholds applied.",
      parameters: {
        type: "object",
        properties: {
          asset: { type: "string", description: "Asset symbol, e.g. 'DEMO'" },
        },
        required: ["asset"],
      },
    },
  },
  handler: getLiquidity,
};
