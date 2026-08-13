import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";
import "dotenv/config";

// Watcher's wallet — used both to deploy (becomes the immutable `watcher` address
// on RiscovLedger) and later to call submitRating(). Same key as WATCHER_PRIVATE_KEY
// used at runtime by src/chain/ledger.ts, kept as one wallet for v1 simplicity.
const PRIVATE_KEY = process.env.WATCHER_PRIVATE_KEY;
const accounts = PRIVATE_KEY ? [PRIVATE_KEY] : [];

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test-contracts",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  networks: {
    // testnet chain id 1952, mainnet chain id 196 — double-check before every deploy
    xlayerTestnet: {
      url: process.env.XLAYER_TESTNET_RPC || "https://testrpc.xlayer.tech",
      chainId: 1952,
      accounts,
    },
    xlayerMainnet: {
      url: process.env.XLAYER_MAINNET_RPC || "https://rpc.xlayer.tech",
      chainId: 196,
      accounts,
    },
  },
};

export default config;
