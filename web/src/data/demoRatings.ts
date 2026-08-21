import type { Rating } from '../types';

export interface ToolCallRecord {
  tool: string;
  args: Record<string, unknown>;
  tookMs: number;
}

export interface AssetRating {
  asset: string;
  displayName: string;
  rating: Rating;
  reasoning: string;
  evidenceCited: string[];
  toolCalls: ToolCallRecord[];
  modelTurns: number;
  timestamp: string;
  reasonHash: string;
  liquidityTrendPct: number | null;
  tokenAgeDays: number | null;
}

/**
 * Seed content pulled from real Watcher runs in /logs — used here to drive
 * the UI while the paid check-risk endpoint isn't wired into this app yet.
 * Chosen specifically to show the Watcher's core claim: identical-shaped
 * liquidity signals (a young token vs. an established one) get different,
 * reasoned ratings instead of the same threshold output.
 */
export const demoRatings: AssetRating[] = [
  {
    asset: 'DEMO-ESTABLISHED',
    displayName: 'Demo token (example · established)',
    rating: 'Red',
    reasoning:
      'The rapid 80% decrease in liquidity after a stable period raises significant concerns about coordinated withdrawals, which match the pattern of known bad behavior in the crypto space. The absence of recent communication from the project team exacerbates this risk, leaving holders and potential investors with little assurance about the continuity or integrity of the project.',
    evidenceCited: [
      '80% of pool liquidity removed within the last 24 hours after 7 months of stability.',
      'Verified contract status without recent issues at the time of the audit.',
      'No official statement from the team in the last 48 hours.',
      "Evidence aligns with the 'Coordinated liquidity withdrawal' pattern.",
    ],
    toolCalls: [
      { tool: 'getLiquidity', args: { asset: 'DEMO-ESTABLISHED' }, tookMs: 1 },
      { tool: 'getAuditStatus', args: { asset: 'DEMO-ESTABLISHED' }, tookMs: 0 },
      { tool: 'searchRecentActivity', args: { asset: 'DEMO-ESTABLISHED' }, tookMs: 0 },
      { tool: 'getPastIncidentPatterns', args: { keyword: 'liquidity' }, tookMs: 0 },
    ],
    modelTurns: 5,
    timestamp: '2026-08-12T22:34:01.808Z',
    reasonHash: '0x79ca51a3bb3a753de22d96f271c73c0b2bf8f772125449dfba996184e8227de5',
    liquidityTrendPct: -80,
    tokenAgeDays: 210,
  },
  {
    asset: 'DEMO',
    displayName: 'Demo token (example)',
    rating: 'Yellow',
    reasoning:
      "While DEMO exhibits thin liquidity consistent with its age of 3 days and shows a small 5% drop, the contract is verified without any indicators of malicious behavior. The team's active communication and community engagement further mitigate risks. However, ongoing monitoring of liquidity is needed due to the initial volatility. There are no alarming past incident patterns identified.",
    evidenceCited: [
      'Liquidity at 12,000 with a 5% decrease in the last 24 hours',
      'Verified contract with no red flags',
      'Active community engagement and updates',
      'No concerning incident patterns detected',
    ],
    toolCalls: [
      { tool: 'getLiquidity', args: { asset: 'DEMO' }, tookMs: 0 },
      { tool: 'getAuditStatus', args: { asset: 'DEMO' }, tookMs: 0 },
      { tool: 'searchRecentActivity', args: { asset: 'DEMO' }, tookMs: 0 },
      { tool: 'getPastIncidentPatterns', args: { keyword: 'liquidity' }, tookMs: 1 },
    ],
    modelTurns: 5,
    timestamp: '2026-08-17T11:43:14.758Z',
    reasonHash: '0x501dc694df1c4f618e0674b099db1226a286d0f43347bf15c7af280ff255e4bb',
    liquidityTrendPct: -5,
    tokenAgeDays: 3,
  },
  {
    asset: 'DEMO-YOUNG',
    displayName: 'Demo token (example · young)',
    rating: 'Green',
    reasoning:
      'The asset "DEMO-YOUNG" exhibits a stable risk profile based on several factors. The contract is verified, indicating the code is legitimate and has no known issues. Although liquidity has decreased by 5% within the last 24 hours, this is a minor change typical of a newly launched token just 3 days old, and overall liquidity remains within acceptable levels. Positive team engagement is evident with regular updates and no changes in ownership since deployment, suggesting stability and transparency. Additionally, there are no indicators of risk according to historical patterns related to liquidity or governance issues. Therefore, the asset appears to be low risk at this time.',
    evidenceCited: [
      'Verified contract status',
      'Liquidity down 5% in 24 hours, typical for new token',
      'Active team communication with no changes in ownership',
      'Organic community growth',
      'No matches to past incident patterns',
    ],
    toolCalls: [
      { tool: 'getLiquidity', args: { asset: 'DEMO-YOUNG' }, tookMs: 0 },
      { tool: 'getAuditStatus', args: { asset: 'DEMO-YOUNG' }, tookMs: 0 },
      { tool: 'searchRecentActivity', args: { asset: 'DEMO-YOUNG' }, tookMs: 0 },
      { tool: 'getPastIncidentPatterns', args: { keyword: 'liquidity' }, tookMs: 1 },
    ],
    modelTurns: 8,
    timestamp: '2026-08-12T22:33:48.357Z',
    reasonHash: '0xb4caaa9b63d0dae223f4218d3d634f5698950e82c8d177ced66b6660b75f4f87',
    liquidityTrendPct: -5,
    tokenAgeDays: 3,
  },
  {
    asset: 'EXAMPLE',
    displayName: 'Example Token (unconfigured)',
    rating: 'Red',
    reasoning:
      "The asset 'EXAMPLE' exhibits several critical risks: it has no liquidity pair registered, indicating a lack of market activity; its audit status cannot be determined due to the absence of a token address, which raises concerns about the security of its smart contract; and there is a complete lack of relevant recent activity or engagement from the development team, suggesting potential abandonment. Collectively, these factors create a high-risk scenario for investors.",
    evidenceCited: [
      'No liquidity pair registered',
      'Unverified contract status',
      'Lack of relevant recent activity',
    ],
    toolCalls: [
      { tool: 'getLiquidity', args: { asset: 'EXAMPLE' }, tookMs: 0 },
      { tool: 'getAuditStatus', args: { asset: 'EXAMPLE' }, tookMs: 0 },
      { tool: 'searchRecentActivity', args: { asset: 'EXAMPLE', limit: 5 }, tookMs: 1126 },
      { tool: 'getPastIncidentPatterns', args: {}, tookMs: 0 },
    ],
    modelTurns: 8,
    timestamp: '2026-08-17T11:49:56.917Z',
    reasonHash: '0xbe77e60081ab1aa2f7180e7ee6b6661a2de9d32b4ed100556bce4b94821e4e58',
    liquidityTrendPct: null,
    tokenAgeDays: null,
  },
];
