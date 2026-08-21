/**
 * Phase 4: Riscov exposed as an MCP tool — the "Agent-to-MCP" distribution
 * path from RISCOV_BUILD_PLAN.md. This is the stdio transport, for local
 * dev and MCP clients that spawn a subprocess. Any MCP-speaking agent
 * framework can also skip cloning entirely and hit the streamable-HTTP
 * transport instead — see src/mcp/httpApp.ts.
 *
 * This is the free/direct integration path. The paid, x402-gated HTTP
 * equivalent lives in src/paidServer.ts — that's what a real OKX ASP
 * registration would point at.
 */
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { createMcpServer } from "./tool.ts";

void serveStdio(createMcpServer);
console.error("Riscov MCP server running on stdio");
