/**
 * Bundling entry for the Vercel serverless function serving the hosted MCP
 * endpoint (see package.json's "vercel-build" script). Kept separate from
 * src/mcp/httpApp.ts for the same reason src/vercelEntry.ts is separate
 * from src/paidApp.ts — esbuild needs a single default export to produce a
 * valid Vercel Node function — api/mcp.mjs is the bundled output of *this*
 * file, not hand-edited.
 */
import { app } from "./mcp/httpApp.ts";

export default app;
