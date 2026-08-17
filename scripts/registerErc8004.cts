import { ethers } from "hardhat";

/**
 * ERC-8004 (Trustless Agents) IdentityRegistry — deployed at the same
 * address across 30+ chains via deterministic deployment, including X Layer
 * MAINNET. Verified on-chain (eth_getCode) during Phase 4 research — this
 * address has real bytecode on X Layer mainnet (chain 196) and none on X
 * Layer testnet (chain 1952), so this script only makes sense against
 * xlayerMainnet.
 *
 * NOT executed automatically. Registering mints a real, permanent, public
 * on-chain identity from a real-money wallet. Review this script, fund
 * WATCHER_PRIVATE_KEY with a small amount of mainnet OKB for gas, set
 * RISCOV_AGENT_URI, and run deliberately:
 *   npx hardhat run scripts/registerErc8004.cts --network xlayerMainnet
 */
const IDENTITY_REGISTRY_ADDRESS = "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432";

const IDENTITY_REGISTRY_ABI = [
  "function register(string agentURI) external returns (uint256 agentId)",
  "function setAgentURI(uint256 agentId, string calldata newURI) external",
  "event Registered(uint256 indexed agentId, string agentURI, address indexed owner)",
];

async function main() {
  const agentUri = process.env.RISCOV_AGENT_URI;
  if (!agentUri) {
    throw new Error(
      "Missing RISCOV_AGENT_URI — a URI describing the Watcher agent (capabilities, " +
        "service endpoints — e.g. the MCP server / paid endpoint from Phase 4). Host it " +
        "somewhere reachable (even a GitHub raw JSON file) before running this script."
    );
  }

  const network = await ethers.provider.getNetwork();
  if (network.chainId !== 196n) {
    throw new Error(
      `ERC-8004 IdentityRegistry is not deployed on chain ${network.chainId}. ` +
        "Run this against --network xlayerMainnet (chain 196) — it is not on X Layer testnet."
    );
  }

  const [signer] = await ethers.getSigners();
  console.log(`Registering Riscov Watcher under ERC-8004 IdentityRegistry (${IDENTITY_REGISTRY_ADDRESS})`);
  console.log(`Signer/owner: ${signer?.address}`);
  console.log(`agentURI: ${agentUri}`);

  const registry = await ethers.getContractAt(IDENTITY_REGISTRY_ABI, IDENTITY_REGISTRY_ADDRESS, signer);

  const tx = await registry.register!(agentUri);
  const receipt = await tx.wait();

  console.log(`Tx: ${receipt.hash}`);

  const registeredLog = receipt.logs
    .map((log: any) => {
      try {
        return registry.interface.parseLog(log);
      } catch {
        return null;
      }
    })
    .find((parsed: any) => parsed?.name === "Registered");

  if (registeredLog) {
    console.log(`agentId: ${registeredLog.args.agentId}`);
  } else {
    console.log("Registered event not found in receipt logs — check the tx on a block explorer.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
