import "dotenv/config";

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

export const config = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY ?? "",
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
  },
  xlayer: {
    network: (process.env.XLAYER_NETWORK || "testnet") as "testnet" | "mainnet",
    rpcUrl:
      (process.env.XLAYER_NETWORK || "testnet") === "mainnet"
        ? process.env.XLAYER_MAINNET_RPC || "https://rpc.xlayer.tech"
        : process.env.XLAYER_TESTNET_RPC || "https://testrpc.xlayer.tech",
    chainId: (process.env.XLAYER_NETWORK || "testnet") === "mainnet" ? 196 : 1952,
  },
  okx: {
    apiKey: process.env.OKX_API_KEY ?? "",
    secretKey: process.env.OKX_SECRET_KEY ?? "",
    passphrase: process.env.OKX_PASSPHRASE ?? "",
  },
  watchIntervalMinutes: Number(process.env.WATCH_INTERVAL_MINUTES || 5),
  ledger: {
    contractAddress: process.env.LEDGER_CONTRACT_ADDRESS ?? "",
    watcherPrivateKey: process.env.WATCHER_PRIVATE_KEY ?? "",
  },
  demoMarket: {
    contractAddress: process.env.DEMO_MARKET_CONTRACT_ADDRESS ?? "",
    assetSymbol: process.env.DEMO_ASSET_SYMBOL || "DEMO",
  },
};

export { required };
