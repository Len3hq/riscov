import { Section, SubSection, P, UL } from '../../components/DocProse';
import { CodeBlock } from '../../components/docs/CodeBlock';
import { Callout } from '../../components/Callout';

export function ConnectMcp() {
  return (
    <>
      <Section title="Connect via MCP">
        <P>
          riscov exposes a single MCP tool, <code className="hash">checkAssetRisk</code>, free and
          direct — no payment involved. The paid HTTP equivalent is{' '}
          <a href="/docs/x402">/check-risk over x402</a>.
        </P>
        <P>
          It's served two ways from the same tool definition (<code className="hash">src/mcp/tool.ts</code>):
          a hosted streamable-HTTP endpoint anyone can call with no setup, and a stdio transport for
          local dev.
        </P>
        <CodeBlock label="hosted — no cloning, no install" code={`https://riscov.vercel.app/mcp`} />
        <CodeBlock label="local dev — stdio" code={`npm run mcp:server`} />
      </Section>

      <SubSection title="Tool contract">
        <CodeBlock
          label="checkAssetRisk"
          code={`input:  { "asset": string }        // a symbol registered in src/data/assets.json

output: {
  "asset": string,
  "rating": "Green" | "Yellow" | "Red",
  "reasoning": string,
  "evidenceCited": string[],
  "timestamp": string                // ISO 8601
}`}
        />
        <P>
          The description surfaced to the calling agent lists which asset symbols are currently
          registered, so a model deciding whether to call the tool can see valid inputs without a
          separate discovery step.
        </P>
      </SubSection>

      <SubSection title="Wiring it into an agent config">
        <P>
          Point any MCP client at the hosted URL — the same way you'd add a remote filesystem or
          browser MCP server, and the reason "any agent can call it" is actually true now: no clone,
          no install, no local process to spawn.
        </P>
        <CodeBlock
          label="mcpServers config — hosted"
          code={`{
  "mcpServers": {
    "riscov": {
      "url": "https://riscov.vercel.app/mcp"
    }
  }
}`}
        />
        <P>For local dev against a checkout instead, spawn it over stdio:</P>
        <CodeBlock
          label="mcpServers config — local stdio"
          code={`{
  "mcpServers": {
    "riscov": {
      "command": "npx",
      "args": ["tsx", "src/mcp/server.ts"],
      "cwd": "/path/to/riscov"
    }
  }
}`}
        />
        <UL>
          <li>
            The hosted endpoint needs no client-side credentials — <code className="hash">OPENAI_API_KEY</code>{' '}
            and everything else the Watcher's reasoning loop needs lives server-side on the deployment.
            Running your own copy (stdio or <code className="hash">npm run mcp:http-server</code>) does
            require it set locally.
          </li>
          <li>
            Every call is logged server-side the same way a scheduled watch is, under{' '}
            <code className="hash">logs/</code>.
          </li>
        </UL>
        <Callout tone="note">
          This is a live, uncached agent run per call — expect the response time of an LLM tool-use
          loop (multiple tool calls, several model turns), not an instant lookup.
        </Callout>
      </SubSection>
    </>
  );
}
