import { ethers } from "ethers";
import { getProvider } from "./chain.ts";
import { config } from "./config.ts";
import type { Rating } from "./agent/types.ts";

const DEMO_MARKET_ABI = [
  "function maxLeverage() external view returns (uint256)",
  "function isPaused() external view returns (bool)",
  "function currentRating() external view returns (uint8 rating, uint256 timestamp, bool exists)",
];

const UINT_TO_RATING: Rating[] = ["Green", "Yellow", "Red"];

export interface DemoMarketStatus {
  maxLeverage: number;
  isPaused: boolean;
  rating: Rating | null;
  ratingExists: boolean;
}

export async function readDemoMarketStatus(): Promise<DemoMarketStatus> {
  if (!config.demoMarket.contractAddress) {
    throw new Error(
      "Missing DEMO_MARKET_CONTRACT_ADDRESS — deploy it first: npm run deploy:demo-market:testnet"
    );
  }
  const market = new ethers.Contract(config.demoMarket.contractAddress, DEMO_MARKET_ABI, getProvider());

  const [maxLeverage, paused, ratingData] = await Promise.all([
    market.maxLeverage!(),
    market.isPaused!(),
    market.currentRating!(),
  ]);

  const exists = Boolean(ratingData[2]);
  return {
    maxLeverage: Number(maxLeverage),
    isPaused: Boolean(paused),
    rating: exists ? (UINT_TO_RATING[Number(ratingData[0])] as Rating) : null,
    ratingExists: exists,
  };
}
