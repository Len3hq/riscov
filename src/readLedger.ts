import { readRatingOnChain } from "./ledger.ts";

async function main() {
  const asset = process.argv[2];
  if (!asset) {
    console.error("Usage: npm run read-ledger -- <ASSET_SYMBOL>");
    process.exit(1);
  }

  const onChain = await readRatingOnChain(asset);
  console.log(`On-chain rating for ${asset}:`);
  console.log(JSON.stringify(onChain, null, 2));
}

main().catch((err) => {
  console.error("Failed to read rating from RiscovLedger:", err);
  process.exit(1);
});
