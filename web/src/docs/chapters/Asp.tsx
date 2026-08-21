import { Section, SubSection, P, UL, OL } from '../../components/DocProse';
import { CodeBlock } from '../../components/docs/CodeBlock';
import { Callout } from '../../components/Callout';

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
            <strong>Agent-to-MCP (A2MCP)</strong> — riscov's rating check is exposed as a callable
            tool other AI agents / LLM apps invoke directly, pay-per-call, fully automatic (no
            negotiation, no evaluation step). This is riscov's integration mode.
          </li>
          <li>
            <strong>Agent-to-Agent (A2A)</strong> — other agents negotiate price/scope with riscov
            directly, settled through escrow with a user sign-off step. Not the current integration
            path.
          </li>
        </UL>
        <P>
          Paid calls route through <a href="/docs/x402">x402</a> — that's the billing rail; nothing
          about payment collection needs to be built separately.
        </P>
      </Section>

      <SubSection title="ERC-8004 identity — done">
        <P>
          The Watcher's identity is registered under <strong>ERC-8004</strong>, the on-chain agent
          identity/reputation standard — so its track record is checkable by any consumer
          independently of trusting OKX's marketplace alone.
        </P>
        <CodeBlock label="scripts/registerErc8004.cts" code={`npm run register:erc8004:mainnet`} />
        <Callout tone="note">
          Registered on X Layer mainnet: <strong>agentId 11057</strong>, pointing at{' '}
          <code className="hash">RISCOV_AGENT_URI = https://riscov.vercel.app/agent.json</code> — a
          hosted description of the Watcher's capabilities and service endpoints (the MCP tool and
          the paid HTTP endpoint), served as a static file from this site.
        </Callout>
        <Callout tone="warn">
          The IdentityRegistry is deployed at the same address across 30+ chains including X Layer
          mainnet — but <strong>not</strong> X Layer testnet. This step only works against mainnet.
        </Callout>
      </SubSection>

      <SubSection title="Listing on OKX.AI — done">
        <Callout tone="note">
          Registered as an <strong>A2MCP ASP</strong> on OKX.AI: <strong>agentId 11120</strong>,
          offering the "Asset Risk Check" service ($0.01 USDT/call) against{' '}
          <code className="hash">POST /check-risk</code>. Submitted for marketplace review — result
          arrives by email within 24h, but the service is already callable directly by Agent ID
          regardless of approval status.
        </Callout>
        <P>
          This is OKX.AI's actual documented onboarding flow (<code className="hash">okx.ai/tutorial/asp</code>),
          not a summary — each step is a prompt you hand to an agent CLI (Claude Code, OpenClaw,
          Hermes, or Codex), which then drives the registration interactively:
        </P>
        <OL>
          <li>
            <strong>Have an agent CLI installed.</strong> Claude Code, OpenClaw, Hermes, or Codex —
            or a cloud-hosted agent from a third party.
          </li>
          <li>
            <strong>Install Onchain OS.</strong> Run the prompt below in your agent CLI, then open a
            new session once it finishes.
            <CodeBlock code={`npx skills add okx/onchainos-skills --yes -g`} />
            <Callout tone="warn">
              This is a <strong>global</strong> skill install (not scoped to this project) — it adds
              a third-party (OKX) skill package to your CLI's global skill set. Do this deliberately,
              not as a side effect of another task.
            </Callout>
          </li>
          <li>
            <strong>Log in to the Agentic Wallet.</strong> Have your email ready, then send:
            <CodeBlock code={`Log in to Agentic Wallet on Onchain OS with my email`} />
          </li>
          <li>
            <strong>Register as an A2MCP ASP</strong>, using the ERC-8004 identity already
            registered above:
            <CodeBlock
              code={`Help me register an A2MCP ASP on OKX.AI using OKX Agent Identity from Onchain OS`}
            />
            <P>
              For A2MCP, the service endpoint must be either free (returns the result directly) or
              x402-based — riscov's <code className="hash">POST /check-risk</code> is the latter.
            </P>
          </li>
          <li>
            <strong>List the ASP:</strong>
            <CodeBlock code={`Help me list my ASP on OKX.AI using Onchain OS`} />
            <P>
              Review takes up to 24 hours; the result is emailed to the address on the Agentic
              Wallet and posted back into the agent conversation. Even before approval (or if review
              doesn't pass), the service is still reachable directly by its Agent ID.
            </P>
          </li>
          <li>
            <strong>Take orders — fully automatic for A2MCP.</strong> Once listed, calls from other
            agents' MCP clients are billed and settled in real time via x402; free calls just return
            the result. No evaluation/rating step applies to A2MCP (that's an A2A-only mechanic).
          </li>
        </OL>
        <Callout tone="note">
          Steps 3–5 need a human in the loop (your email, the wallet login) — they can't be
          completed unattended by the agent alone.
        </Callout>
      </SubSection>
    </>
  );
}
