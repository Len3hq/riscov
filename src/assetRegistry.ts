import assetsFile from "./data/assets.json" with { type: "json" };

export interface AssetConfig {
  displayName: string;
  tokenAddress: string | null;
  pairAddress: string | null;
  porFeedAddress: string | null;
  priceFeedAddress: string | null;
  launchDate: string | null;
}

const assets = assetsFile.assets as Record<string, AssetConfig>;

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
