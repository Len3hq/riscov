import { ethers } from "ethers";
import { getAsset } from "../assetRegistry.ts";
import { getProvider, CHAINLINK_AGGREGATOR_ABI } from "../chain.ts";
import type { ToolDefinition } from "../agent/types.ts";

async function getReserveStatus(args: Record<string, unknown>): Promise<unknown> {
  const asset = String(args.asset ?? "");
  const cfg = getAsset(asset);

  if (!cfg.porFeedAddress) {
    return {
      asset,
      status: "not_applicable",
      note: "No Chainlink Proof-of-Reserve feed registered for this asset — likely not a stablecoin/RWA-backed token, or the feed hasn't been added to src/data/assets.json yet.",
    };
  }

  const provider = getProvider();
  const feed = new ethers.Contract(cfg.porFeedAddress, CHAINLINK_AGGREGATOR_ABI, provider);

  const [roundData, decimals, description] = await Promise.all([
    feed.latestRoundData!(),
    feed.decimals!(),
    feed.description!(),
  ]);

  const reserveValue = Number(ethers.formatUnits(roundData.answer, decimals));
  const updatedAt = new Date(Number(roundData.updatedAt) * 1000).toISOString();
  const staleForHours = (Date.now() - Number(roundData.updatedAt) * 1000) / 3_600_000;

  return {
    asset,
    porFeedAddress: cfg.porFeedAddress,
    description,
    reserveValue,
    updatedAt,
    staleForHours: Number(staleForHours.toFixed(1)),
  };
}

export const getReserveStatusTool: ToolDefinition = {
  spec: {
    type: "function",
    function: {
      name: "getReserveStatus",
      description:
        "For stablecoins/RWA-backed assets, read the Chainlink Proof-of-Reserve feed on-chain to check whether reserves are attested and how fresh that attestation is. Real on-chain read; returns 'not_applicable' if no PoR feed exists for this asset.",
      parameters: {
        type: "object",
        properties: {
          asset: { type: "string", description: "Asset symbol, e.g. 'USDX'" },
        },
        required: ["asset"],
      },
    },
  },
  handler: getReserveStatus,
};
