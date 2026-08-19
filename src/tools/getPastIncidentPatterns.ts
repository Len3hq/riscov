import incidentPatternsFile from "../data/incidentPatterns.json" with { type: "json" };
import type { ToolDefinition } from "../agent/types.ts";

interface IncidentPattern {
  id: string;
  name: string;
  description: string;
  typicalSignals: string[];
  historicalExamples: string[];
}

const patterns = incidentPatternsFile.patterns as IncidentPattern[];

async function getPastIncidentPatterns(args: Record<string, unknown>): Promise<unknown> {
  const keyword = args.keyword ? String(args.keyword).toLowerCase() : null;

  const matches = keyword
    ? patterns.filter(
        (p) =>
          p.name.toLowerCase().includes(keyword) ||
          p.description.toLowerCase().includes(keyword) ||
          p.typicalSignals.some((s) => s.toLowerCase().includes(keyword))
      )
    : patterns;

  return {
    keyword,
    resultCount: matches.length,
    patterns: matches,
    note: "Static reference set of known risk patterns. You decide whether current evidence matches any of these — this tool doesn't do the matching for you.",
  };
}

export const getPastIncidentPatternsTool: ToolDefinition = {
  spec: {
    type: "function",
    function: {
      name: "getPastIncidentPatterns",
      description:
        "Look up a small curated reference set of known past rug-pull/exploit patterns (e.g. coordinated liquidity withdrawal, mint abuse, fake ownership renounce, oracle manipulation, reserve shortfall, team activity cliff) so you can compare current evidence against known bad patterns. Optionally filter by keyword.",
      parameters: {
        type: "object",
        properties: {
          keyword: {
            type: "string",
            description:
              "Optional keyword to filter patterns, e.g. 'liquidity' or 'mint'. Omit to get the full reference set.",
          },
        },
      },
    },
  },
  handler: getPastIncidentPatterns,
};
