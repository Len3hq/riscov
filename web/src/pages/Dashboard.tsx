import { useState } from 'react';
import { demoRatings } from '../data/demoRatings';
import { Button } from '../components/Button';
import { RatingBadge } from '../components/RatingBadge';
import { Card, CardBody, CardHeader } from '../components/Card';
import { Table, Th, Td, Tr } from '../components/Table';
import { FindingItem } from '../components/FindingItem';
import { ToolTrace } from '../components/ToolTrace';
import { Hash } from '../components/Hash';
import { EmptyState } from '../components/EmptyState';
import { Callout } from '../components/Callout';
import { formatTimestamp, relativeTime } from '../lib/format';
import styles from './Dashboard.module.css';

export function Dashboard() {
  const [selected, setSelected] = useState(demoRatings[0].asset);
  const active = demoRatings.find((r) => r.asset === selected) ?? demoRatings[0];

  const young = demoRatings.find((r) => r.asset === 'FROG-YOUNG');
  const established = demoRatings.find((r) => r.asset === 'FROG-ESTABLISHED');

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <span className="text-label text-muted">riscov / watcher</span>
          <h1 className="text-h1" style={{ marginTop: 'var(--space-2)' }}>
            watched assets
          </h1>
        </div>
        <div className={styles.headerActions}>
          <Button variant="primary" disabled title="check-risk is a paid x402 endpoint — not wired in this demo">
            check now
          </Button>
        </div>
      </div>

      <Callout tone="note">
        Example data. The rows below are real Watcher runs against illustrative tokens (FROG and
        friends) from the project's test scenarios — not live production assets. See{' '}
        <a href="/docs/reference">Scripts &amp; Environment</a> for how to register real ones.
      </Callout>

      <Table>
        <thead>
          <tr>
            <Th>asset</Th>
            <Th>rating</Th>
            <Th numeric>liquidity 24h</Th>
            <Th numeric>age</Th>
            <Th>last checked</Th>
          </tr>
        </thead>
        <tbody>
          {demoRatings.map((r) => (
            <Tr key={r.asset} onClick={() => setSelected(r.asset)} active={r.asset === selected}>
              <Td>
                <span className="text-data">{r.displayName}</span>
              </Td>
              <Td>
                <RatingBadge rating={r.rating} dot />
              </Td>
              <Td numeric className="text-data">
                {r.liquidityTrendPct === null ? (
                  <span className="text-dim">—</span>
                ) : (
                  `${r.liquidityTrendPct > 0 ? '+' : ''}${r.liquidityTrendPct}%`
                )}
              </Td>
              <Td numeric className="text-data">
                {r.tokenAgeDays === null ? <span className="text-dim">—</span> : `${r.tokenAgeDays}d`}
              </Td>
              <Td>
                <span className="text-small text-dim">{relativeTime(r.timestamp)}</span>
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>

      <Card>
        <CardHeader
          eyebrow={active.displayName}
          timestamp={formatTimestamp(active.timestamp)}
          action={<RatingBadge rating={active.rating} />}
        />
        <CardBody className={styles.detailBody}>
          <p>{active.reasoning}</p>

          <div className={styles.section}>
            <span className="text-label text-dim">evidence cited</span>
            <div className={styles.findings}>
              {active.evidenceCited.map((e, i) => (
                <FindingItem key={i} signal={active.rating} title={e} />
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <span className="text-label text-dim">tool call trace · {active.modelTurns} turns</span>
            <ToolTrace calls={active.toolCalls} />
          </div>

          <div className={styles.section}>
            <span className="text-label text-dim">reason hash</span>
            <Hash value={active.reasonHash} />
          </div>
        </CardBody>
      </Card>

      {young && established && (
        <div>
          <span className="text-label text-dim">same signal, different context</span>
          <p className="text-small text-muted" style={{ marginTop: 'var(--space-2)' }}>
            Both assets show a liquidity trend from a getLiquidity call — but the Watcher weighs it
            against token age and reaches opposite ratings, not a shared threshold.
          </p>
          <div className={styles.compareGrid}>
            {[young, established].map((r) => (
              <Card key={r.asset}>
                <CardHeader eyebrow={r.displayName} action={<RatingBadge rating={r.rating} />} />
                <CardBody>
                  <p className="text-small">{r.reasoning}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className={styles.emptyDemo}>
        <span className="text-label text-dim">unwatched asset</span>
        <Card>
          <EmptyState copy="no rating yet for this asset." actionLabel="add to watchlist" />
        </Card>
      </div>
    </>
  );
}
