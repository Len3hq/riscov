/**
 * Shared mock evidence for the "same-looking thin-liquidity signal, two
 * contexts" scenario used by both the Phase 1 exit-condition test
 * (src/test/scenarios.ts) and the Phase 3 scripted demo (src/demo.ts).
 *
 * Mocked on purpose — this validates the agent's REASONING, independent of
 * whether real on-chain test assets exist yet (Phase 0). getPastIncidentPatterns
 * and concludeRating are left real/unmocked since they don't depend on any
 * external account setup.
 */
import {
  getAuditStatusTool,
  getLiquidityTool,
  getReserveStatusTool,
  getMarketPriceTool,
  searchRecentActivityTool,
  getPastIncidentPatternsTool,
  concludeRatingTool,
} from "../tools/index.ts";
import type { ToolDefinition } from "../agent/types.ts";

function mock(real: ToolDefinition, handler: ToolDefinition["handler"]): ToolDefinition {
  return { spec: real.spec, handler };
}

export const youngTokenScenarioTools: Record<string, ToolDefinition> = {
  getAuditStatus: mock(getAuditStatusTool, async () => ({
    status: "verified",
    verifiedAt: "3 days ago, same day as deploy",
    auditFirm: "none formally, but source is verified and matches a well-known clean template",
    findings: "no red flags in verified source",
  })),
  getLiquidity: mock(getLiquidityTool, async () => ({
    pairAddress: "0xMOCKyoung...",
    reserve0: "12000",
    reserve1: "11800",
    trendPercentOverPast24hEstimate: -5,
    tokenAgeDays: 3,
    note: "Liquidity is thin in absolute terms, consistent with a token days old.",
  })),
  getReserveStatus: mock(getReserveStatusTool, async () => ({ status: "not_applicable" })),
  getMarketPrice: mock(getMarketPriceTool, async () => ({ status: "not_applicable" })),
  searchRecentActivity: mock(searchRecentActivityTool, async () => ({
    resultCount: 3,
    items: [
      { title: "Team posts weekly progress update on Discord", pubDate: "1 day ago", source: "community" },
      { title: "No ownership/contract changes since deploy", pubDate: "today", source: "on-chain" },
      { title: "Small organic community growth, no promotional spam detected", pubDate: "2 days ago", source: "community" },
    ],
  })),
  getPastIncidentPatterns: getPastIncidentPatternsTool,
  concludeRating: concludeRatingTool,
};

export const establishedTokenScenarioTools: Record<string, ToolDefinition> = {
  getAuditStatus: mock(getAuditStatusTool, async () => ({
    status: "verified",
    verifiedAt: "210 days ago",
    auditFirm: "reputable third-party firm, audited at launch",
    findings: "no findings at time of audit",
  })),
  getLiquidity: mock(getLiquidityTool, async () => ({
    pairAddress: "0xMOCKold...",
    reserve0: "8000",
    reserve1: "7600",
    trendPercentOverPast24hEstimate: -80,
    tokenAgeDays: 210,
    note: "80% of pool liquidity removed within the last 24 hours after 7 months of stability.",
  })),
  getReserveStatus: mock(getReserveStatusTool, async () => ({ status: "not_applicable" })),
  getMarketPrice: mock(getMarketPriceTool, async () => ({ status: "not_applicable" })),
  searchRecentActivity: mock(searchRecentActivityTool, async () => ({
    resultCount: 1,
    items: [
      { title: "No official statement from the team in the last 48 hours", pubDate: "today", source: "community" },
    ],
  })),
  getPastIncidentPatterns: getPastIncidentPatternsTool,
  concludeRating: concludeRatingTool,
};
