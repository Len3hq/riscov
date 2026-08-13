import { ethers } from "ethers";
import { getAsset } from "../assetRegistry.ts";
import { getProvider, CHAINLINK_AGGREGATOR_ABI } from "../chain.ts";
import type { ToolDefinition } from "../agent/types.ts";

async function getMarketPrice(args: Record<string, unknown>): Promise<unknown> {
  const asset = String(args.asset ?? "");
  const cfg = getAsset(asset);

  if (!cfg.priceFeedAddress) {
    return {
      asset,
      status: "not_configured",
      note: "No Chainlink price feed registered for this asset in src/data/assets.json yet.",
    };
  }

  const provider = getProvider();
  const feed = new ethers.Contract(cfg.priceFeedAddress, CHAINLINK_AGGREGATOR_ABI, provider);

  const [roundData, decimals, description] = await Promise.all([
    feed.latestRoundData!(),
    feed.decimals!(),
    feed.description!(),
  ]);

  const price = Number(ethers.formatUnits(roundData.answer, decimals));
  const updatedAt = new Date(Number(roundData.updatedAt) * 1000).toISOString();

  return {
    asset,
    priceFeedAddress: cfg.priceFeedAddress,
    description,
    price,
    updatedAt,
  };
}

export const getMarketPriceTool: ToolDefinition = {
  spec: {
    type: "function",
    function: {
      name: "getMarketPrice",
      description:
        "Read the real-world reference price for an RWA/price-tracked asset from its Chainlink Data Streams / price feed on-chain. Real on-chain read, no interpretation applied.",
      parameters: {
        type: "object",
        properties: {
          asset: { type: "string", description: "Asset symbol, e.g. 'XAUT'" },
        },
        required: ["asset"],
      },
    },
  },
  handler: getMarketPrice,
};
