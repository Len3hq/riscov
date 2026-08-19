import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { Card, CardBody } from '../components/Card';
import { RatingBadge } from '../components/RatingBadge';
import styles from './Landing.module.css';

const pieces = [
  {
    index: '01',
    title: 'The Watcher',
    body: 'An LLM agent, not a rule engine. It picks which tools to call for a given asset, reasons over what it finds, and concludes with a rating and a written judgment.',
  },
  {
    index: '02',
    title: 'The Ledger',
    body: 'A small contract on X Layer that stores the current rating for anything being watched — a public on-chain read, independent of trusting any single API.',
  },
  {
    index: '03',
    title: 'The Storefront',
    body: 'How other apps and agents discover and pay for a rating — over MCP for free, or pay-per-call over x402, listed as an ASP on OKX.',
  },
];

const ratings: { rating: 'Green' | 'Yellow' | 'Red'; body: string }[] = [
  { rating: 'Green', body: 'normal risk for what this asset is.' },
  { rating: 'Yellow', body: 'worth watching; nothing conclusive yet.' },
  { rating: 'Red', body: 'evidence points at real, current danger.' },
];

const uses = [
  {
    title: 'Connect via MCP',
    body: 'Call checkAssetRisk directly from any MCP-speaking agent — free, over stdio.',
    to: '/docs/mcp',
  },
  {
    title: 'Pay-per-call (x402)',
    body: 'POST /check-risk over HTTP, settled in USDC on X Layer. No account, no API key.',
    to: '/docs/x402',
  },
  {
    title: 'Discover it as an ASP',
    body: "Found and paid for through OKX's AI agent marketplace — no manual integration.",
    to: '/docs/asp',
  },
  {
    title: 'Read the Ledger',
    body: 'The current rating for any watched asset is a public on-chain read.',
    to: '/docs/ledger',
  },
];

export function Landing() {
  return (
    <>
      <div className={styles.hero}>
        <span className={`text-label ${styles.eyebrow}`}>riscov</span>
        <h1 className={`text-display ${styles.title}`}>
          risk ratings for on-chain assets, reasoned — not guessed.
        </h1>
        <p className={styles.lede}>
          riscov watches assets on X Layer and reasons about how risky they are right now. An LLM
          agent gathers evidence — audit status, liquidity, reserves, recent activity, past incident
          patterns — and reaches a Green, Yellow, or Red rating with a written judgment, not a
          threshold formula.
        </p>
        <div className={styles.heroActions}>
          <Link to="/docs">
            <Button variant="primary">read the docs</Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="secondary">see it running</Button>
          </Link>
        </div>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <span className="text-label text-dim">what it does</span>
          <h2 className="text-h2">three pieces, in this order</h2>
        </div>
        <div className={styles.grid3}>
          {pieces.map((p) => (
            <Card key={p.index}>
              <CardBody className={styles.pieceCard}>
                <span className={`text-label ${styles.pieceIndex}`}>{p.index}</span>
                <h3 className={`text-h3 ${styles.pieceTitle}`}>{p.title}</h3>
                <p className="text-small text-muted">{p.body}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <span className="text-label text-dim">every rating</span>
          <h2 className="text-h2">a judgment, not a threshold</h2>
          <p className="text-small text-muted">
            The tools only fetch raw facts. The agent is the only thing that decides what those facts
            mean, in context — the same liquidity drop reads differently on a 3-day-old token than on
            one that's been stable for months.{' '}
            <Link to="/docs/architecture">See the worked example.</Link>
          </p>
        </div>
        <div className={styles.ratingRow}>
          {ratings.map((r) => (
            <div key={r.rating} className={styles.ratingItem}>
              <RatingBadge rating={r.rating} />
              <p className="text-small text-muted">{r.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <span className="text-label text-dim">where it's used</span>
          <h2 className="text-h2">four ways to get a rating</h2>
        </div>
        <div className={styles.grid4}>
          {uses.map((u) => (
            <Link key={u.to} to={u.to} className={styles.useCard}>
              <Card>
                <CardBody className={styles.pieceCard}>
                  <h3 className={`text-h3 ${styles.useTitle}`}>{u.title}</h3>
                  <p className="text-small text-muted">{u.body}</p>
                  <span className={`text-small ${styles.useLink}`}>docs →</span>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.ctaRow}>
          <div className={styles.sectionHead}>
            <span className="text-label text-dim">see it for yourself</span>
            <h2 className="text-h2">watch it rate example assets</h2>
            <p className="text-small text-muted">
              The dashboard shows real Watcher runs against illustrative example tokens (FROG and
              friends) — not live production assets.
            </p>
          </div>
          <Link to="/dashboard">
            <Button variant="primary">open the dashboard</Button>
          </Link>
        </div>
      </section>
    </>
  );
}
