import { ethers } from "hardhat";

async function main() {
  const ledgerAddress = process.env.LEDGER_CONTRACT_ADDRESS;
  if (!ledgerAddress) {
    throw new Error("Missing LEDGER_CONTRACT_ADDRESS in .env — deploy RiscovLedger first.");
  }

  const demoAssetSymbol = process.env.DEMO_ASSET_SYMBOL || "FROG";
  const assetId = ethers.id(demoAssetSymbol.toUpperCase());

  const [deployer] = await ethers.getSigners();
  console.log(`Deploying DemoMarket — ledger: ${ledgerAddress}, asset: ${demoAssetSymbol} (${assetId}), from: ${deployer?.address}`);

  const Market = await ethers.getContractFactory("DemoMarket");
  const market = await Market.deploy(ledgerAddress, assetId);
  await market.waitForDeployment();

  const address = await market.getAddress();
  console.log(`DemoMarket deployed to: ${address}`);
  console.log(`\nAdd this to .env:\nDEMO_MARKET_CONTRACT_ADDRESS=${address}\nDEMO_ASSET_SYMBOL=${demoAssetSymbol}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
