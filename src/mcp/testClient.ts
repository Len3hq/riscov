/**
 * Stands in for "another agent" discovering and calling Riscov via MCP
 * (Phase 4 exit condition, first half — the free/direct path).
 *
 * Deliberately uses @modelcontextprotocol/sdk (the client) against a server
 * built with @modelcontextprotocol/server — different packages speaking the
 * same MCP wire protocol, the way an unrelated third-party agent actually
 * would.
 */
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function main() {
  const asset = process.argv[2] || "EXAMPLE";

  const transport = new StdioClientTransport({
    command: "npx",
    args: ["tsx", "src/mcp/server.ts"],
  });

  const client = new Client({ name: "riscov-test-agent", version: "0.1.0" });
  await client.connect(transport);

  console.log("Connected. Discovering tools via MCP...");
  const { tools } = await client.listTools();
  for (const tool of tools) {
    console.log(`  - ${tool.name}: ${tool.description}`);
  }

  console.log(`\nCalling checkAssetRisk({ asset: "${asset}" })...`);
  const result = await client.callTool({ name: "checkAssetRisk", arguments: { asset } });
  console.log("\nResult:");
  console.log(JSON.stringify(result, null, 2));

  await client.close();
}

main().catch((err) => {
  console.error("MCP test client failed:", err);
  process.exit(1);
});
