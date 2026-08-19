/**
 * Inline copy of assets/riscov-mark-mono.svg — inlined (rather than <img>)
 * so `fill="currentColor"` can pick up a CSS `color` from the wrapping
 * element, per RISCOV_DESIGN.md's below-24px / mono usage rule.
 */
export function MonoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <rect x="10" y="62" width="28" height="28" fill="currentColor" />
      <rect x="36" y="36" width="28" height="28" fill="currentColor" />
      <rect x="62" y="10" width="28" height="28" fill="currentColor" />
    </svg>
  );
}
