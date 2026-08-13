/**
 * Stands in for "another agent" discovering Riscov's paid endpoint and
 * actually paying for a call (Phase 4 exit condition, second half). Pays in
 * testnet USDC on Base Sepolia via the free community facilitator — no OKX
 * account needed to prove the mechanics work.
 */
import { wrapFetchWithPaymentFromConfig, decodePaymentResponseHeader } from "@x402/fetch";
import { ExactEvmScheme } from "@x402/evm";
import { privateKeyToAccount } from "viem/accounts";

async function main() {
  const asset = process.argv[2] || "EXAMPLE";
  const serverUrl = process.env.PAID_SERVER_URL || "http://localhost:4021/check-risk";
  const network = (process.env.X402_NETWORK || "eip155:84532") as `${string}:${string}`;
  const privateKey = process.env.TEST_AGENT_PRIVATE_KEY;

  if (!privateKey) {
    throw new Error("Missing TEST_AGENT_PRIVATE_KEY — the throwaway agent's paying wallet.");
  }

  const account = privateKeyToAccount(privateKey as `0x${string}`);
  const fetchWithPayment = wrapFetchWithPaymentFromConfig(fetch, {
    schemes: [{ network, client: new ExactEvmScheme(account) }],
  });

  console.log(`Throwaway test agent (${account.address}) calling paid endpoint for "${asset}"...`);
  const response = await fetchWithPayment(serverUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ asset }),
  });

  if (!response.ok) {
    console.error(`Request failed: ${response.status} ${response.statusText}`);
    console.error(await response.text());
    process.exit(1);
  }

  const data = await response.json();
  console.log("\nRating received:");
  console.log(JSON.stringify(data, null, 2));

  const paymentResponseHeader = response.headers.get("PAYMENT-RESPONSE");
  if (paymentResponseHeader) {
    console.log("\nPayment settled:");
    console.log(JSON.stringify(decodePaymentResponseHeader(paymentResponseHeader), null, 2));
  }
}

main().catch((err) => {
  console.error("Paid client run failed:", err);
  process.exit(1);
});
