import { Section, SubSection, P, UL } from '../../components/docs/DocProse';
import { Table, Th, Td, Tr } from '../../components/Table';
import { Callout } from '../../components/docs/Callout';

const tools: { name: string; question: string }[] = [
  { name: 'getAuditStatus(asset)', question: 'Is the contract verified / audited, and when?' },
  { name: 'getLiquidity(asset)', question: 'Current liquidity depth and its recent trend.' },
  {
    name: 'getReserveStatus(asset)',
    question: 'For stablecoins: is the reserve actually backed? (Chainlink Proof of Reserve)',
  },
  {
    name: 'getMarketPrice(asset)',
    question: 'Real-world price / deviation for RWA-priced assets (Chainlink Data Streams).',
  },
  {
    name: 'searchRecentActivity(asset)',
    question: 'Open-ended: recent news, governance posts, team activity via web search.',
  },
  {
    name: 'getPastIncidentPatterns(keyword?)',
    question: 'A reference set of past rug-pulls / exploits to compare current behavior against.',
  },
];

export function Architecture() {
  return (
    <>
      <Section title="The Watcher's tools">
        <P>
          Each tool answers exactly one factual question and hands the raw answer back to the agent —
          none of them contain rating logic. Source: <code className="hash">src/tools/</code>.
        </P>
        <Table>
          <thead>
            <tr>
              <Th>tool</Th>
              <Th>answers</Th>
            </tr>
          </thead>
          <tbody>
            {tools.map((t) => (
              <Tr key={t.name}>
                <Td>
                  <code className="hash">{t.name}</code>
                </Td>
                <Td className="text-small text-muted">{t.question}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </Section>

      <Section title="The reasoning loop">
        <P>
          The agent is given the tools and one instruction: figure out how risky this asset is right
          now, decide which tools it needs, call them, and explain the conclusion. It calls a tool,
          reads the result, decides whether another call is warranted, and repeats — the same way a
          human analyst follows up on a red flag instead of stopping at the first number. A thin
          <code className="hash">getLiquidity</code> result can prompt a follow-up{' '}
          <code className="hash">searchRecentActivity</code> call before the agent concludes.
        </P>
        <P>Two things come back together, always:</P>
        <UL>
          <li>a rating — Green, Yellow, or Red</li>
          <li>a written judgment referencing the specific evidence it weighed</li>
        </UL>
      </Section>

      <SubSection title="Worked example: identical signal, different context">
        <P>
          The clearest proof the Watcher isn't a threshold in disguise: feed it the same thin-liquidity
          shape in two different contexts.
        </P>
        <Table>
          <thead>
            <tr>
              <Th>asset</Th>
              <Th numeric>liquidity 24h</Th>
              <Th numeric>token age</Th>
              <Th>rating</Th>
              <Th>why</Th>
            </tr>
          </thead>
          <tbody>
            <Tr>
              <Td>FROG-YOUNG</Td>
              <Td numeric className="text-data">
                -5%
              </Td>
              <Td numeric className="text-data">
                3d
              </Td>
              <Td className="text-data">Green</Td>
              <Td className="text-small text-muted">
                minor drop, typical for a token days old, nothing else flags
              </Td>
            </Tr>
            <Tr>
              <Td>FROG-ESTABLISHED</Td>
              <Td numeric className="text-data">
                -80%
              </Td>
              <Td numeric className="text-data">
                210d
              </Td>
              <Td className="text-data">Red</Td>
              <Td className="text-small text-muted">
                sudden reversal after months of stability, matches a known withdrawal pattern
              </Td>
            </Tr>
          </tbody>
        </Table>
        <P>
          Both runs call the same <code className="hash">getLiquidity</code> tool and see a negative
          trend — the agent weighs that trend against age and history and reaches opposite,
          independently-reasoned ratings. See both full reasoning strings side by side on the{' '}
          <a href="/">dashboard</a>.
        </P>
        <Callout tone="note">
          <code className="hash">getPastIncidentPatterns</code> is what lets the reasoning say "this
          matches the pattern of a coordinated liquidity withdrawal" instead of just restating a
          percentage.
        </Callout>
      </SubSection>
    </>
  );
}
