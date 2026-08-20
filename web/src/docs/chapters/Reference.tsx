import { Section, SubSection, P } from '../../components/DocProse';
import { Table, Th, Td, Tr } from '../../components/Table';

const scripts: { cmd: string; does: string }[] = [
  { cmd: 'npm run check', does: 'Run the Watcher once against a single asset (CLI).' },
  { cmd: 'npm run watch', does: 'Run the Watcher on a timer for all registered assets.' },
  { cmd: 'npm run demo', does: "Scripted end-to-end demo: agent reasons, rating updates, consumer's limits update." },
  { cmd: 'npm run mcp:server', does: 'Start the MCP server (see Connect via MCP).' },
  { cmd: 'npm run paid:server', does: 'Run POST /check-risk locally, gated by x402.' },
  { cmd: 'npm run paid:client', does: 'Call the paid endpoint as a throwaway paying agent.' },
  { cmd: 'npm run deploy:testnet / :mainnet', does: 'Deploy RiscovLedger to X Layer.' },
  { cmd: 'npm run read-ledger', does: 'Read a rating back from the deployed Ledger contract.' },
  { cmd: 'npm run register:erc8004:mainnet', does: 'Register the Watcher under ERC-8004 (mainnet only).' },
];

const envGroups: { group: string; vars: { name: string; note: string }[] }[] = [
  {
    group: 'LLM',
    vars: [
      { name: 'OPENAI_API_KEY', note: 'required — the Watcher\'s reasoning loop' },
      { name: 'OPENAI_MODEL', note: 'default gpt-4o' },
    ],
  },
  {
    group: 'X Layer RPC',
    vars: [
      { name: 'XLAYER_NETWORK', note: 'testnet | mainnet — switches RPC, chain id, and every on-chain read/write' },
      { name: 'XLAYER_TESTNET_RPC', note: 'testrpc.xlayer.tech' },
      { name: 'XLAYER_MAINNET_RPC', note: 'rpc.xlayer.tech' },
      { name: 'OKLINK_API_KEY', note: 'optional — without it, getAuditStatus falls back to a raw bytecode-existence check instead of real verification data' },
    ],
  },
  {
    group: 'Watcher scheduler',
    vars: [{ name: 'WATCH_INTERVAL_MINUTES', note: 'how often the Watcher re-checks each registered asset' }],
  },
  {
    group: 'Ledger',
    vars: [
      { name: 'WATCHER_PRIVATE_KEY', note: 'deploys + signs submitRating — needs real OKB on mainnet' },
      { name: 'LEDGER_CONTRACT_ADDRESS', note: 'filled in after deploy:testnet/:mainnet' },
      { name: 'DEMO_MARKET_CONTRACT_ADDRESS', note: 'filled in after deploy:demo-market:testnet/:mainnet' },
      { name: 'DEMO_ASSET_SYMBOL', note: 'the assetId DemoMarket derives its leverage limit from' },
    ],
  },
  {
    group: 'x402 / MCP marketplace',
    vars: [
      { name: 'OKX_API_KEY / OKX_SECRET_KEY / OKX_PASSPHRASE', note: 'from the OKX Developer Portal' },
      { name: 'X402_PAY_TO_ADDRESS / X402_PAY_TO_PRIVATE_KEY', note: 'wallet that receives payment' },
      { name: 'X402_NETWORK', note: 'CAIP-2 id — eip155:196 mainnet or eip155:1952 testnet; independent of XLAYER_NETWORK, decide deliberately before it takes real payments' },
      { name: 'X402_FACILITATOR_URL', note: 'defaults to https://web3.okx.com if unset' },
      { name: 'X402_PRICE_USDC', note: 'default $0.01' },
      { name: 'PAID_SERVER_PORT / PAID_SERVER_URL', note: 'local paid:server binding, unused on Vercel' },
      { name: 'TEST_AGENT_PRIVATE_KEY', note: 'throwaway wallet used by paid:client to test-pay the endpoint' },
      { name: 'RISCOV_AGENT_URI', note: 'ERC-8004 identity — mainnet only; must point at a live, hosted agent description before registering' },
    ],
  },
];

export function Reference() {
  return (
    <>
      <Section title="Scripts">
        <Table>
          <thead>
            <tr>
              <Th>command</Th>
              <Th>what it does</Th>
            </tr>
          </thead>
          <tbody>
            {scripts.map((s) => (
              <Tr key={s.cmd}>
                <Td>
                  <code className="hash">{s.cmd}</code>
                </Td>
                <Td className="text-small text-muted">{s.does}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </Section>

      <Section title="Environment variables">
        <P>Full reference lives in .env.example at the repo root. Grouped by what they gate:</P>
        {envGroups.map((g) => (
          <SubSection key={g.group} title={g.group}>
            <Table>
              <thead>
                <tr>
                  <Th>variable</Th>
                  <Th>note</Th>
                </tr>
              </thead>
              <tbody>
                {g.vars.map((v) => (
                  <Tr key={v.name}>
                    <Td>
                      <code className="hash">{v.name}</code>
                    </Td>
                    <Td className="text-small text-muted">{v.note}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </SubSection>
        ))}
      </Section>
    </>
  );
}
