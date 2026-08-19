import { Section, SubSection, P, UL } from '../../components/DocProse';
import { CodeBlock } from '../../components/docs/CodeBlock';
import { Table, Th, Td, Tr } from '../../components/Table';
import { Callout } from '../../components/Callout';

export function PayPerCall() {
  return (
    <>
      <Section title="Pay-per-call via x402">
        <P>
          <code className="hash">POST /check-risk</code> is the paid, x402-gated HTTP equivalent of the
          MCP tool — the endpoint a real OKX Agent-to-MCP registration points at. It's live at{' '}
          <code className="hash">https://riscov.vercel.app/check-risk</code>, gated by OKX's Onchain OS
          x402 SDK on X Layer — no alternate chain, per project policy.
        </P>
        <CodeBlock
          label="request"
          code={`POST /check-risk
Content-Type: application/json

{ "asset": "FROG" }`}
        />
        <P>
          Called without a valid payment, it returns <code className="hash">402 Payment Required</code>{' '}
          with the accepted payment terms — that's the x402 handshake working, not an error. A
          correctly-paid call returns the same shape as the MCP tool's output.
        </P>
      </Section>

      <SubSection title="Terms">
        <Table>
          <thead>
            <tr>
              <Th>term</Th>
              <Th>value</Th>
            </tr>
          </thead>
          <tbody>
            <Tr>
              <Td>price</Td>
              <Td className="text-data">
                <code className="hash">X402_PRICE_USDC</code> (default $0.01)
              </Td>
            </Tr>
            <Tr>
              <Td>network</Td>
              <Td className="text-data">
                <code className="hash">X402_NETWORK</code> — CAIP-2 id, e.g.{' '}
                <code className="hash">eip155:196</code> (mainnet) / <code className="hash">eip155:1952</code>{' '}
                (testnet)
              </Td>
            </Tr>
            <Tr>
              <Td>pay to</Td>
              <Td className="text-data">
                <code className="hash">X402_PAY_TO_ADDRESS</code>
              </Td>
            </Tr>
            <Tr>
              <Td>facilitator</Td>
              <Td className="text-small text-muted">
                OKX's Onchain OS facilitator (<code className="hash">web3.okx.com</code> by default),
                signed via <code className="hash">OKXFacilitatorClient</code>
              </Td>
            </Tr>
          </tbody>
        </Table>
        <Callout tone="note">
          Signing (the OK-ACCESS-* HMAC headers OKX's facilitator REST API expects) is handled
          internally by <code className="hash">@okxweb3/x402-core</code> — nothing to hand-roll.
        </Callout>
      </SubSection>

      <SubSection title="Calling it as a paying agent">
        <P>
          <code className="hash">src/paidClient.ts</code> is a minimal reference client — any agent
          wrapping its own <code className="hash">fetch</code> with an x402 payment scheme works the
          same way:
        </P>
        <CodeBlock
          label="src/paidClient.ts (excerpt)"
          code={`import { wrapFetchWithPaymentFromConfig } from "@okxweb3/x402-fetch";
import { ExactEvmScheme } from "@okxweb3/x402-evm";
import { privateKeyToAccount } from "viem/accounts";

const account = privateKeyToAccount(TEST_AGENT_PRIVATE_KEY);
const fetchWithPayment = wrapFetchWithPaymentFromConfig(fetch, {
  schemes: [{ network: X402_NETWORK, client: new ExactEvmScheme(account) }],
});

const res = await fetchWithPayment("https://riscov.vercel.app/check-risk", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ asset: "FROG" }),
});
// res.headers.get("PAYMENT-RESPONSE") — settlement receipt`}
        />
        <UL>
          <li>
            Run the reference client directly: <code className="hash">npm run paid:client</code> (needs{' '}
            <code className="hash">TEST_AGENT_PRIVATE_KEY</code> funded on X Layer).
          </li>
          <li>
            Run the server locally instead of hitting production:{' '}
            <code className="hash">npm run paid:server</code>.
          </li>
        </UL>
      </SubSection>
    </>
  );
}
