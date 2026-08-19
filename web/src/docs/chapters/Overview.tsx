import { Section, P, UL } from '../../components/DocProse';
import { RatingBadge } from '../../components/RatingBadge';
import { Callout } from '../../components/Callout';
import { CodeBlock } from '../../components/docs/CodeBlock';

export function Overview() {
  return (
    <>
      <Section title="What riscov is">
        <P>
          riscov watches on-chain assets on X Layer and reasons about how risky they are right now.
          It is built as three pieces, in this order: the <strong>Watcher</strong> (an LLM agent that
          gathers evidence and forms a judgment), the <strong>Ledger</strong> (a small contract on X
          Layer that stores the current rating for anything being watched), and the{' '}
          <strong>Storefront</strong> (how other apps and agents discover and pay for a rating, via MCP
          and x402).
        </P>
        <CodeBlock
          code={`tools  ──►  the Watcher  ──►  the Ledger  ──►  consumers
           (LLM agent)        (X Layer)`}
        />
        <UL>
          <li>
            <strong>tools</strong> — fetch raw facts only: on-chain reads, audit registries,
            liquidity / PoR feeds, web search, past-incident patterns.
          </li>
          <li>
            <strong>the Watcher</strong> — picks which tools to call, reads each result, decides
            whether another call is warranted, concludes with a rating + written reasoning.
          </li>
          <li>
            <strong>the Ledger</strong> — the rating and a hash of the reasoning, stored on-chain,
            readable by anyone.
          </li>
          <li>
            <strong>consumers</strong> — a market, another agent, or an ASP call reading or paying for
            that rating.
          </li>
        </UL>
      </Section>

      <Section title="The rating is a judgment, not a threshold">
        <P>
          Every check returns one of three ratings, and each is <em>semantic</em>, never decorative —
          the same three colors used everywhere else in this product mean exactly this and nothing
          else:
        </P>
        <UL>
          <li>
            <RatingBadge rating="Green" /> — normal risk for what this asset is.
          </li>
          <li>
            <RatingBadge rating="Yellow" /> — worth watching; nothing conclusive yet.
          </li>
          <li>
            <RatingBadge rating="Red" /> — evidence points at real, current danger.
          </li>
        </UL>
        <P>
          Nothing in the Watcher is <code className="hash">if liquidity &lt; X then Red</code>. The
          tools it calls only fetch raw facts — audit status, liquidity depth, reserve backing,
          recent activity, past incident patterns. The agent is the only thing that decides what those
          facts mean, in context. The same liquidity drop reads differently on a 3-day-old token than
          on one that's been stable for months — see{' '}
          <a href="/docs/architecture">how the Watcher reasons</a> for the worked example.
        </P>
        <Callout tone="note">
          Every rating ships with a written reasoning string and a list of the specific evidence it
          weighed — not a templated "liquidity: yellow, audit: green." If a rating can be reproduced by
          an if-statement, the Watcher isn't doing its job.
        </Callout>
      </Section>

      <Section title="Ways to use it">
        <UL>
          <li>
            <a href="/docs/mcp">Connect via MCP</a> — call <code className="hash">checkAssetRisk</code>{' '}
            directly from any MCP-speaking agent, free, over stdio.
          </li>
          <li>
            <a href="/docs/x402">Pay-per-call via x402</a> — hit{' '}
            <code className="hash">POST /check-risk</code> over HTTP, settled in USDC on X Layer.
          </li>
          <li>
            <a href="/docs/asp">Discover it as an ASP</a> — found and paid for through OKX's AI agent
            marketplace, no manual integration.
          </li>
          <li>
            <a href="/docs/ledger">Read the Ledger directly</a> — the current rating for any watched
            asset is a public on-chain read, independent of trusting any single API.
          </li>
        </UL>
      </Section>
    </>
  );
}
