import type { ToolDefinition } from "../agent/types.ts";

async function concludeRating(args: Record<string, unknown>): Promise<unknown> {
  // No logic here — this just captures the agent's own conclusion. The agent loop
  // (src/agent/watcher.ts) intercepts this call to end the loop; this handler
  // only runs if something calls it directly outside that loop.
  return { received: true, ...args };
}

export const concludeRatingTool: ToolDefinition = {
  spec: {
    type: "function",
    function: {
      name: "concludeRating",
      description:
        "Call this LAST, once you've gathered enough evidence, to record your final risk rating and reasoning. Do not call this before calling at least one evidence tool. The rating must follow from the reasoning you write, not from any fixed threshold.",
      parameters: {
        type: "object",
        properties: {
          rating: {
            type: "string",
            enum: ["Green", "Yellow", "Red"],
            description: "Your overall risk judgment for this asset right now.",
          },
          reasoning: {
            type: "string",
            description:
              "Plain-English explanation of WHY, referencing the specific evidence you weighed and how it fits together in context — not a templated per-signal restatement (e.g. not 'liquidity: yellow, audit: green').",
          },
          evidenceCited: {
            type: "array",
            items: { type: "string" },
            description:
              "Short list of the specific facts you relied on, e.g. 'liquidity down 80% in 24h', 'token is 3 days old', 'audit clean'.",
          },
        },
        required: ["rating", "reasoning", "evidenceCited"],
      },
    },
  },
  handler: concludeRating,
};
