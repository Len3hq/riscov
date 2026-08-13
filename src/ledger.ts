import { ethers } from "ethers";
import { getProvider } from "./chain.ts";
import { config } from "./config.ts";
import type { Rating, WatcherResult } from "./agent/types.ts";

const LEDGER_ABI = [
  "function submitRating(bytes32 assetId, uint8 rating, bytes32 reasonHash) external",
  "function getRating(bytes32 assetId) external view returns (uint8 rating, uint256 timestamp, bytes32 reasonHash)",
  "function hasRating(bytes32 assetId) external view returns (bool)",
  "event RatingUpdated(bytes32 indexed assetId, uint8 rating, bytes32 reasonHash, uint256 timestamp)",
];

const RATING_TO_UINT: Record<Rating, number> = { Green: 0, Yellow: 1, Red: 2 };
const UINT_TO_RATING: Rating[] = ["Green", "Yellow", "Red"];

export function assetIdFor(symbol: string): string {
  return ethers.id(symbol.toUpperCase());
}

function getSigner(): ethers.Wallet {
  if (!config.ledger.watcherPrivateKey) {
    throw new Error("Missing WATCHER_PRIVATE_KEY — needed to submit ratings on-chain.");
  }
  return new ethers.Wallet(config.ledger.watcherPrivateKey, getProvider());
}

function getLedgerContract(runner: ethers.ContractRunner = getProvider()): ethers.Contract {
  if (!config.ledger.contractAddress) {
    throw new Error(
      "Missing LEDGER_CONTRACT_ADDRESS — deploy RiscovLedger first: npm run deploy:testnet"
    );
  }
  return new ethers.Contract(config.ledger.contractAddress, LEDGER_ABI, runner);
}

export interface OnChainSubmission {
  txHash: string;
  assetId: string;
  reasonHash: string;
  blockNumber: number;
}

export async function submitRatingOnChain(result: WatcherResult): Promise<OnChainSubmission> {
  const signer = getSigner();
  const ledger = getLedgerContract(signer);
  const assetId = assetIdFor(result.asset);
  const reasonHash = ethers.id(result.reasoning);

  const tx = await ledger.submitRating!(assetId, RATING_TO_UINT[result.rating], reasonHash);
  const receipt = await tx.wait();

  return {
    txHash: receipt.hash,
    assetId,
    reasonHash,
    blockNumber: receipt.blockNumber,
  };
}

export interface OnChainRating {
  assetId: string;
  rating: Rating;
  timestamp: string;
  reasonHash: string;
}

export async function readRatingOnChain(assetSymbol: string): Promise<OnChainRating> {
  const ledger = getLedgerContract();
  const assetId = assetIdFor(assetSymbol);
  const [rating, timestamp, reasonHash] = await ledger.getRating!(assetId);
  return {
    assetId,
    rating: UINT_TO_RATING[Number(rating)] as Rating,
    timestamp: new Date(Number(timestamp) * 1000).toISOString(),
    reasonHash,
  };
}
