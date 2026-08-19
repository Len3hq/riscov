import type { Rating } from '../types';
import styles from './FindingItem.module.css';

interface FindingItemProps {
  signal: Rating;
  title: string;
  body?: string;
  meta?: string;
}

const signalClass: Record<Rating, string> = {
  Green: styles.green,
  Yellow: styles.yellow,
  Red: styles.red,
};

export function FindingItem({ signal, title, body, meta }: FindingItemProps) {
  return (
    <div className={`${styles.item} ${signalClass[signal]}`}>
      <p className={styles.title}>{title}</p>
      {body && <p className={`text-small text-muted ${styles.body}`}>{body}</p>}
      {meta && <p className={`text-label ${styles.meta}`}>{meta}</p>}
    </div>
  );
}
