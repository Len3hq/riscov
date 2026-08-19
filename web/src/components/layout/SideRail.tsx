import styles from './SideRail.module.css';

const items = [
  { label: 'Dashboard', active: true },
  { label: 'Assets', active: false },
  { label: 'Ledger', active: false },
  { label: 'Docs', active: false },
];

export function SideRail() {
  return (
    <nav className={styles.rail} aria-label="Primary">
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          className={`text-small ${styles.item} ${item.active ? styles.active : ''}`}
          disabled={!item.active}
          aria-current={item.active ? 'page' : undefined}
        >
          {item.label}
          {!item.active && <span className={`text-label ${styles.soon}`}>soon</span>}
        </button>
      ))}
    </nav>
  );
}
