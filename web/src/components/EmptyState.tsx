import type { ReactNode } from 'react';
import { MonoMark } from './brand/MonoMark';
import { Button } from './Button';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  copy: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ copy, actionLabel, onAction }: EmptyStateProps): ReactNode {
  return (
    <div className={styles.wrap}>
      <div className={styles.mark}>
        <MonoMark size={32} />
      </div>
      <p className={`text-small text-dim ${styles.copy}`}>{copy}</p>
      {actionLabel && (
        <Button variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
