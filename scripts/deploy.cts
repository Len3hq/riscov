import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  if (!deployer) {
    throw new Error(
      "No deployer account available — set WATCHER_PRIVATE_KEY in .env before deploying."
    );
  }

  console.log(`Deploying RiscovLedger — watcher wallet: ${deployer.address}`);

  const Ledger = await ethers.getContractFactory("RiscovLedger");
  const ledger = await Ledger.deploy(deployer.address);
  await ledger.waitForDeployment();

  const address = await ledger.getAddress();
  const network = await ethers.provider.getNetwork();

  console.log(`RiscovLedger deployed to: ${address}`);
  console.log(`Chain ID: ${network.chainId}`);
  console.log(`\nAdd this to .env:\nLEDGER_CONTRACT_ADDRESS=${address}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
