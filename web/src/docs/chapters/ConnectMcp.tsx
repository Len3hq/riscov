import { Section, SubSection, P, UL } from '../../components/DocProse';
import { CodeBlock } from '../../components/docs/CodeBlock';
import { Callout } from '../../components/Callout';

export function ConnectMcp() {
  return (
    <>
      <Section title="Connect via MCP">
        <P>
          <code className="hash">src/mcp/server.ts</code> exposes riscov as a single MCP tool,{' '}
          <code className="hash">checkAssetRisk</code>, served over stdio. This is the free, direct
          integration path — any MCP-speaking agent framework can spawn it and call the tool with no
          payment involved. The paid HTTP equivalent is <a href="/docs/x402">/check-risk over x402</a>.
        </P>
        <CodeBlock label="run it" code={`npm run mcp:server`} />
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
          Point any MCP client at the server over stdio, the same way you'd add a filesystem or
          browser MCP server:
        </P>
        <CodeBlock
          label="mcpServers config"
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
            Requires <code className="hash">OPENAI_API_KEY</code> set — the Watcher's reasoning loop
            runs on every call, not a cached lookup.
          </li>
          <li>
            Every call is logged locally the same way a scheduled watch is, under{' '}
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
