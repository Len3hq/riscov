import type { PropsWithChildren } from 'react';
import styles from './Callout.module.css';

interface CalloutProps {
  tone?: 'note' | 'warn';
}

export function Callout({ tone = 'note', children }: PropsWithChildren<CalloutProps>) {
  return <div className={`${styles.callout} ${styles[tone]} text-small text-muted`}>{children}</div>;
}
