import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface AssetConfig {
  displayName: string;
  tokenAddress: string | null;
  pairAddress: string | null;
  porFeedAddress: string | null;
  priceFeedAddress: string | null;
  launchDate: string | null;
}

interface AssetsFile {
  assets: Record<string, AssetConfig>;
}

function loadAssets(): Record<string, AssetConfig> {
  const raw = readFileSync(path.join(__dirname, "data", "assets.json"), "utf-8");
  const parsed = JSON.parse(raw) as AssetsFile;
  return parsed.assets;
}

const assets = loadAssets();

export function getAsset(symbol: string): AssetConfig {
  const asset = assets[symbol.toUpperCase()];
  if (!asset) {
    throw new Error(
      `Unknown asset "${symbol}". Add it to src/data/assets.json first (Phase 0: find its real address on X Layer).`
    );
  }
  return asset;
}

export function listAssets(): string[] {
  return Object.keys(assets);
}
