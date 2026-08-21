import { ethers } from "ethers";
import { config } from "./config.ts";

let provider: ethers.JsonRpcProvider | null = null;

export function getProvider(): ethers.JsonRpcProvider {
  if (!provider) {
    provider = new ethers.JsonRpcProvider(config.xlayer.rpcUrl, config.xlayer.chainId);
  }
  return provider;
}

export const ERC20_ABI = [
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function symbol() view returns (string)",
  "function balanceOf(address account) view returns (uint256)",
];

// X Layer's only real DEX (QuickSwap) runs Algebra V3 concentrated-liquidity
// pools, not Uniswap-V2-shaped pairs — there's no getReserves()/constant
// product here. `liquidity()` is the pool's active in-range concentrated
// liquidity (informative on its own, but not a token amount); the actual
// token reserves a V2 pair would have reported are approximated honestly by
// each token's raw ERC20 balance held by the pool contract instead.
export const ALGEBRA_POOL_ABI = [
  "function liquidity() view returns (uint128)",
  "function token0() view returns (address)",
  "function token1() view returns (address)",
];

export const CHAINLINK_AGGREGATOR_ABI = [
  "function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)",
  "function decimals() view returns (uint8)",
  "function description() view returns (string)",
];
