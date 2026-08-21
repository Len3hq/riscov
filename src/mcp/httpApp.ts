/**
 * Streamable-HTTP MCP transport — the "no cloning required" distribution
 * path. Any MCP client can point straight at POST/GET/DELETE /mcp instead of
 * spawning src/mcp/server.ts locally over stdio. Same tool definition
 * (src/mcp/tool.ts) backs both transports, so they can't drift apart.
 *
 * Exports the app unbound so it can be reused both by src/mcp/httpServer.ts
 * (app.listen(), for local/VPS hosting) and src/mcpVercelEntry.ts (Vercel
 * serverless entry point) — the same split src/paidApp.ts uses for the paid
 * endpoint.
 *
 * Free tool, no x402 gating: this mirrors the stdio transport's terms, not
 * the paid endpoint's.
 */
import express from "express";
import { createMcpHandler } from "@modelcontextprotocol/server";
import { toNodeHandler } from "@modelcontextprotocol/node";
import { createMcpServer } from "./tool.ts";

const handler = createMcpHandler(createMcpServer, {
  onerror: (err) => console.error("Riscov MCP HTTP error:", err),
});

export const app = express();

// No body-parser in front of this route: toNodeHandler reads the raw
// request stream itself. Mounting it via app.all (not .use) keeps Express
// from passing a `next` callback where the adapter expects a parsed body.
app.all("/mcp", toNodeHandler(handler));
