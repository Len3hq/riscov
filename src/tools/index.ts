import { getAuditStatusTool } from "./getAuditStatus.ts";
import { getLiquidityTool } from "./getLiquidity.ts";
import { getReserveStatusTool } from "./getReserveStatus.ts";
import { getMarketPriceTool } from "./getMarketPrice.ts";
import { searchRecentActivityTool } from "./searchRecentActivity.ts";
import { getPastIncidentPatternsTool } from "./getPastIncidentPatterns.ts";
import { concludeRatingTool } from "./concludeRating.ts";
import type { ToolDefinition } from "../agent/types.ts";

export const evidenceTools: Record<string, ToolDefinition> = {
  getAuditStatus: getAuditStatusTool,
  getLiquidity: getLiquidityTool,
  getReserveStatus: getReserveStatusTool,
  getMarketPrice: getMarketPriceTool,
  searchRecentActivity: searchRecentActivityTool,
  getPastIncidentPatterns: getPastIncidentPatternsTool,
};

export const allTools: Record<string, ToolDefinition> = {
  ...evidenceTools,
  concludeRating: concludeRatingTool,
};

export {
  getAuditStatusTool,
  getLiquidityTool,
  getReserveStatusTool,
  getMarketPriceTool,
  searchRecentActivityTool,
  getPastIncidentPatternsTool,
  concludeRatingTool,
};
