import type { Rating } from '../types';
import styles from './RatingBadge.module.css';

interface RatingBadgeProps {
  rating: Rating;
  dot?: boolean;
}

const ratingClass: Record<Rating, string> = {
  Green: styles.green,
  Yellow: styles.yellow,
  Red: styles.red,
};

export function RatingBadge({ rating, dot = false }: RatingBadgeProps) {
  return (
    <span className={`${styles.badge} ${ratingClass[rating]}`}>
      {dot && <span className={styles.dot} aria-hidden="true" />}
      {rating}
    </span>
  );
}
