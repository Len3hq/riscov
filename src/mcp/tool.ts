/**
 * The `checkAssetRisk` tool definition, shared by every transport that
 * serves it — stdio (src/mcp/server.ts) and streamable HTTP
 * (src/mcp/httpApp.ts). One factory backs both so they can never drift
 * apart; each transport's serving entry calls this per connection/request.
 */
import { McpServer } from "@modelcontextprotocol/server";
import { runWatcher } from "../agent/watcher.ts";
import { logResult } from "../logging/logger.ts";
import { listAssets } from "../assetRegistry.ts";

/**
 * registerTool() requires a "Standard Schema with JSON" object — see
 * https://standardschema.dev/. Zod v4 produces one natively, but this
 * project's hoisted `zod` resolves to v3.25 (pinned by openai/@x402/*),
 * whose v3 schemas don't implement the `jsonSchema` half of that interface.
 * Rather than fight a cross-version zod install for one string field, this
 * hand-builds the (tiny) contract directly — no zod involved at all.
 */
const checkAssetRiskInputSchema = {
  "~standard": {
    version: 1,
    vendor: "riscov",
    validate(value: unknown) {
      if (
        typeof value === "object" &&
        value !== null &&
        typeof (value as Record<string, unknown>).asset === "string"
      ) {
        return { value: value as { asset: string } };
      }
      return {
        issues: [{ message: "Expected an object with a string 'asset' field", path: ["asset"] }],
      };
    },
    jsonSchema: {
      input: () => ({
        type: "object",
        properties: {
          asset: {
            type: "string",
            description: `Asset symbol to rate. Registered assets: ${
              listAssets().join(", ") || "(none yet — see src/data/assets.json)"
            }`,
          },
        },
        required: ["asset"],
        additionalProperties: false,
      }),
      output: () => ({
        type: "object",
        properties: { asset: { type: "string" } },
        required: ["asset"],
        additionalProperties: false,
      }),
    },
  },
};

export function createMcpServer(): McpServer {
  const server = new McpServer({ name: "riscov", version: "0.1.0" });

  server.registerTool(
    "checkAssetRisk",
    {
      title: "Check Asset Risk",
      description:
        "Get Riscov's current risk rating (Green/Yellow/Red) and written reasoning for an on-chain asset on X Layer. The Watcher agent gathers evidence itself (liquidity, audit status, recent activity, past incident patterns) and reasons about it in context — this is not a threshold lookup.",
      inputSchema: checkAssetRiskInputSchema as any,
    },
    async (args: any) => {
      const asset = String(args.asset);
      try {
        const result = await runWatcher({ asset });
        logResult(result);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  asset: result.asset,
                  rating: result.rating,
                  reasoning: result.reasoning,
                  evidenceCited: result.evidenceCited,
                  timestamp: result.timestamp,
                },
                null,
                2
              ),
            },
          ],
          isError: false,
        };
      } catch (err) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Failed to rate "${asset}": ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  return server;
}
