import { Section, SubSection, P, UL } from '../../components/docs/DocProse';
import { CodeBlock } from '../../components/docs/CodeBlock';
import { Callout } from '../../components/docs/Callout';

export function Asp() {
  return (
    <>
      <Section title="Discoverable as an ASP">
        <P>
          Registering the Watcher as an <strong>Agent Service Provider</strong> on OKX.AI is what turns
          riscov from "a project that runs a contract" into a service other agents can find and pay
          for without any manual integration on either side.
        </P>
        <UL>
          <li>
            <strong>Agent-to-MCP</strong> — riscov's rating check is exposed as a callable tool other
            AI agents / LLM apps invoke directly, pay-per-call. This is the mode riscov targets first:
            simpler, more standardized, and a natural fit for "call this function, get a rating back."
          </li>
          <li>
            <strong>Agent-to-Agent</strong> — other agents negotiate price/scope with riscov directly,
            settled through escrow. Not the current integration path.
          </li>
        </UL>
        <P>
          Paid calls route through <a href="/docs/x402">x402</a> — that's the billing rail; nothing
          about payment collection needs to be built separately.
        </P>
      </Section>

      <SubSection title="Distribute as a Skill">
        <P>
          Packaging the check as a <strong>Skill</strong> lets any agent add it with one command,
          mirroring how OKX's own DEX/market tools distribute (<code className="hash">okx/onchainos-skills</code>
          ) — installable by any builder's agent, not just something they hand-integrate against.
        </P>
        <CodeBlock code={`npx skills add <riscov-skill>`} />
      </SubSection>

      <SubSection title="ERC-8004 identity">
        <P>
          The Watcher's identity is registered under <strong>ERC-8004</strong>, the on-chain agent
          identity/reputation standard — so its track record (how often it's right, how fast it
          responds) is checkable by any consumer independently of trusting OKX's marketplace alone.
        </P>
        <CodeBlock label="scripts/registerErc8004.cts" code={`npm run register:erc8004:mainnet`} />
        <Callout tone="warn">
          The IdentityRegistry is deployed at the same address across 30+ chains including X Layer
          mainnet — but <strong>not</strong> X Layer testnet. This step is mainnet-only, and{' '}
          <code className="hash">RISCOV_AGENT_URI</code> should point at a hosted description of the
          Watcher's capabilities and service endpoints before running it.
        </Callout>
      </SubSection>
    </>
  );
}
