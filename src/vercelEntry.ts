/**
 * Bundling entry for the Vercel serverless function (see package.json's
 * "vercel-build" script). Kept separate from src/paidApp.ts because esbuild
 * needs a single default export to produce a valid Vercel Node function —
 * api/index.mjs is the bundled output of *this* file, not hand-edited.
 */
import { app } from "./paidApp.ts";

export default app;
