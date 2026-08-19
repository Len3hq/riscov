import type { Rating } from '../../types';

/**
 * Inline copy of assets/riscov-mark.svg. Block 3 (the leading block) carries
 * the current rating color; blocks 1-2 stay neutral. Per RISCOV_DESIGN.md
 * §1: never color blocks 1-2, never recolor per-block into a gradient.
 */
const ratingVar: Record<Rating, string> = {
  Green: 'var(--green)',
  Yellow: 'var(--yellow)',
  Red: 'var(--red)',
};

export function Mark({ size = 24, rating }: { size?: number; rating?: Rating }) {
  const accent = rating ? ratingVar[rating] : 'var(--accent)';
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <rect x="10" y="62" width="28" height="28" fill="var(--text)" />
      <rect x="36" y="36" width="28" height="28" fill="var(--text)" />
      <rect x="62" y="10" width="28" height="28" fill={accent} />
    </svg>
  );
}
