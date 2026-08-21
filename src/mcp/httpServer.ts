/**
 * Local/VPS entry point: binds the shared MCP HTTP app (src/mcp/httpApp.ts)
 * to a port. Not used on Vercel — src/mcpVercelEntry.ts imports the same
 * app and lets Vercel's serverless runtime handle the listening/routing
 * instead.
 */
import { app } from "./httpApp.ts";

const PORT = Number(process.env.MCP_SERVER_PORT || 4022);

app.listen(PORT, () => {
  console.log(`Riscov MCP server listening on :${PORT} — POST/GET/DELETE /mcp (streamable HTTP)`);
});
