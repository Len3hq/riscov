import { Section, SubSection, P, UL } from '../../components/DocProse';
import { CodeBlock } from '../../components/docs/CodeBlock';
import { Table, Th, Td, Tr } from '../../components/Table';
import { Callout } from '../../components/Callout';

export function Ledger() {
  return (
    <>
      <Section title="RiscovLedger.sol">
        <P>
          A minimal contract on X Layer stores the current rating for each asset the Watcher tracks.
          The full reasoning text stays off-chain — only its hash goes on-chain, so any consumer can
          verify it wasn't altered without paying to store paragraphs of text in contract storage.
        </P>
        <CodeBlock
          label="contracts/RiscovLedger.sol — public interface"
          code={`function submitRating(bytes32 assetId, Rating rating, bytes32 reasonHash) external onlyWatcher
function getRating(bytes32 assetId) external view returns (Rating rating, uint256 timestamp, bytes32 reasonHash)
function hasRating(bytes32 assetId) external view returns (bool)

event RatingUpdated(bytes32 indexed assetId, Rating rating, bytes32 reasonHash, uint256 timestamp)`}
        />
        <UL>
          <li>
            <code className="hash">submitRating</code> is callable only by the Watcher's own wallet
            address (the immutable <code className="hash">watcher</code> set at deploy time) — v1 trusts
            that key completely.
          </li>
          <li>
            <code className="hash">assetId</code> is <code className="hash">keccak256(SYMBOL)</code> —
            the same value <code className="hash">ethers.id(symbol.toUpperCase())</code> produces.
          </li>
          <li>
            <code className="hash">reasonHash</code> is <code className="hash">keccak256(reasoning)</code>
            . Match it against the reasoning text returned by MCP or <code className="hash">/check-risk</code>{' '}
            to confirm the on-chain rating and the off-chain explanation are the same judgment.
          </li>
        </UL>
      </Section>

      <SubSection title="Reading a rating">
        <P>
          Anyone can call <code className="hash">getRating</code> directly — no API key, no payment, no
          dependency on riscov's own servers staying up.
        </P>
        <Table>
          <thead>
            <tr>
              <Th>network</Th>
              <Th numeric>chain id</Th>
              <Th>rpc</Th>
            </tr>
          </thead>
          <tbody>
            <Tr>
              <Td>X Layer testnet</Td>
              <Td numeric className="text-data">
                1952
              </Td>
              <Td>
                <code className="hash">testrpc.xlayer.tech</code>
              </Td>
            </Tr>
            <Tr>
              <Td>X Layer mainnet</Td>
              <Td numeric className="text-data">
                196
              </Td>
              <Td>
                <code className="hash">rpc.xlayer.tech</code>
              </Td>
            </Tr>
          </tbody>
        </Table>
        <Callout tone="warn">
          Double-check the chain id before every deploy or read — mixing up 1952 and 196 is the most
          common mistake when moving fast between testnet and mainnet.
        </Callout>
      </SubSection>

      <SubSection title="Deploying / submitting">
        <CodeBlock
          label="scripts"
          code={`npm run deploy:testnet          # deploy RiscovLedger to X Layer testnet
npm run deploy:mainnet          # deploy to X Layer mainnet
npm run read-ledger             # read a rating back from the deployed contract`}
        />
        <P>
          The deploying wallet becomes the contract's immutable <code className="hash">watcher</code>{' '}
          address, so it's the same key that later signs every{' '}
          <code className="hash">submitRating</code> call — set both from{' '}
          <code className="hash">WATCHER_PRIVATE_KEY</code> and paste the deployed address into{' '}
          <code className="hash">LEDGER_CONTRACT_ADDRESS</code>.
        </P>
      </SubSection>
    </>
  );
}
