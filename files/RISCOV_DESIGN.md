# Riscov — Design Spec (for implementation)

Machine-readable brand + UI spec. Drop this file at the repo root and point Claude Code at it:
`"Build the frontend following RISCOV_DESIGN.md exactly. Use the tokens verbatim; do not invent colors, radii, or fonts."`

Assets: `assets/riscov-mark.svg` (accent), `assets/riscov-mark-mono.svg` (currentColor), `assets/riscov-lockup.svg`.

---

## 1. Identity

**Mark:** three ledger blocks, corner-locked into an ascending chain. Reads as sequence + escalation; the leading block carries the current rating.

Geometry (100×100 viewBox, sharp corners, no gradients, no strokes):
- block 1: `x=10 y=62 w=28 h=28` — neutral
- block 2: `x=36 y=36 w=28 h=28` — neutral
- block 3: `x=62 y=10 w=28 h=28` — **accent = current rating color**

Rules:
- Clear space = one block width (28 units) on all sides.
- Min size 20px. Below 24px use the all-mono version.
- Only block 3 is ever colored. Never color blocks 1–2, never recolor per-block into a gradient.
- Rating variants: swap block 3 to Green / Yellow / Red. One mark, three states — not three logos.
- Never: rotate, round corners, outline, add a container shape, place on a busy photo.

**Wordmark:** `riscov`, lowercase, JetBrains Mono 700, letter-spacing `-0.02em`.
**Lockup:** mark + wordmark, gap = 22 units at mark scale, optically centered on the middle block.

---

## 2. Color tokens

```css
:root {
  /* surfaces — dark is the default and canonical theme */
  --bg:            #0B0C0C;
  --surface:       #121413;
  --surface-2:     #191C1A;
  --border:        #1F2321;
  --border-strong: #2E3431;

  /* text */
  --text:          #F2F1ED;
  --text-muted:    #9AA09D;
  --text-dim:      #6E7472;

  /* signal — the product's core semantic scale */
  --green:         #35E08B;
  --yellow:        #F2C838;
  --red:           #F2503C;

  /* signal tints for fills/backgrounds (on --bg) */
  --green-dim:     #35E08B1F;
  --yellow-dim:    #F2C8381F;
  --red-dim:       #F2503C1F;

  /* accent = green; used for links, focus, primary action */
  --accent:        #35E08B;
  --accent-ink:    #0B0C0C; /* text on accent fills */
}
```

Usage rules:
- Green/Yellow/Red are **semantic only** — rating, severity, status. Never decorative.
- Max one accent element per view group. If everything is green, nothing is.
- No gradients anywhere. No shadows except `--shadow-pop` below for overlays.
- Light theme is out of scope for v1.

---

## 3. Typography

Single family: **JetBrains Mono** (400 / 500 / 700). Crypto-native, terminal-adjacent, and correct for hashes and addresses.

```
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
--font: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
```

| Role | Size / line-height | Weight | Tracking |
|---|---|---|---|
| Display | 44 / 1.1 | 700 | -0.02em |
| H1 | 30 / 1.2 | 700 | -0.015em |
| H2 | 22 / 1.3 | 700 | -0.01em |
| H3 | 16 / 1.4 | 500 | 0 |
| Body | 14 / 1.65 | 400 | 0 |
| Small | 13 / 1.6 | 400 | 0 |
| Label / eyebrow | 11 / 1.4 | 500 | 0.18em, uppercase |
| Data / mono figure | 14 / 1.4 | 500 | 0, `tabular-nums` |

Rules: `text-wrap: pretty` on paragraphs; body copy max 68ch; truncate hashes as `0x1f4a…9c2b`, never wrap them.

---

## 4. Space, shape, motion

```css
--space: 4px scale → 4 8 12 16 24 32 48 64 96
--radius: 0;        /* everything is square. this is the brand. */
--radius-pill: 999px; /* ONLY for avatars and the rating dot */
--border-w: 1px;
--shadow-pop: 0 16px 48px #00000080; /* modals, popovers only */
--ease: cubic-bezier(0.2, 0, 0, 1);
--dur-fast: 120ms;
--dur: 200ms;
```
Motion: opacity + 4–8px translate only. No bounce, no scale-in, no parallax. Live-updating values may flash their signal tint for 400ms on change.

---

## 5. Components

**Layout shell** — fixed 56px top bar (`--surface`, 1px bottom border, lockup left at 24px mark height), optional 240px left rail, content max-width 1280px, 32px gutters.

**Button**
- Primary: `bg: --accent`, `color: --accent-ink`, 700, 12px 20px, radius 0. Hover: `#4BEA9A`. Active: `#28C978`.
- Secondary: transparent, 1px `--border-strong`, `color: --text`. Hover: `bg: --surface-2`.
- Ghost: `color: --text-muted`, no border. Hover: `color: --text`.
- Danger: 1px `--red`, `color: --red`. Hover: `bg: --red-dim`.
- Focus: `outline: 2px solid --accent; outline-offset: 2px`. Min height 40px (44px on mobile).

**Rating badge** (the product's signature element) — square, 1px border in the signal color, `bg` the matching `-dim` tint, `color` the signal color, label 11px/700/0.14em uppercase, 4px 8px. Optional 6px round dot at left.

**Card / panel** — `bg: --surface`, 1px `--border`, no radius, 20px padding. Header row: eyebrow label left, timestamp `--text-dim` right, 1px bottom border.

**Data table** — `--surface` rows, 1px `--border` dividers, no vertical rules. Header: label style, `--text-dim`. Numeric columns right-aligned, `tabular-nums`. Row hover `--surface-2`. Rating column uses the badge.

**Finding / alert item** — 1px left border in the signal color (4px wide), rest square; title 14/500, body 13 `--text-muted`, footer meta 11 `--text-dim`.

**Empty state** — mono mark at 32px in `--text-dim`, one line of copy, one secondary button. No illustrations.

**Code / hash** — `bg: --surface-2`, 1px `--border`, 13px, 2px 6px, `user-select: all`.

---

## 6. Voice (for UI copy)

Terse, factual, no hype. Lowercase product name in prose (`riscov`). State the finding, then the evidence, then the timestamp. Never say "amazing", "revolutionary", "AI-powered". Never use emoji in the UI.
