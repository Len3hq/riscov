import type { PropsWithChildren, ReactNode } from 'react';
import styles from './Card.module.css';

export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <section className={[styles.card, className].filter(Boolean).join(' ')}>{children}</section>;
}

interface CardHeaderProps {
  eyebrow: string;
  timestamp?: string;
  action?: ReactNode;
}

export function CardHeader({ eyebrow, timestamp, action }: CardHeaderProps) {
  return (
    <header className={styles.header}>
      <span className={`text-label ${styles.eyebrow}`}>{eyebrow}</span>
      <span className={styles.headerRight}>
        {timestamp && <span className={`text-small ${styles.timestamp}`}>{timestamp}</span>}
        {action}
      </span>
    </header>
  );
}

export function CardBody({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={[styles.body, className].filter(Boolean).join(' ')}>{children}</div>;
}
