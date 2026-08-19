import { NavLink } from 'react-router-dom';
import styles from './SideRail.module.css';

const links = [{ label: 'Dashboard', to: '/' }, { label: 'Docs', to: '/docs' }];
const soon = ['Assets', 'Ledger'];

export function SideRail() {
  return (
    <nav className={styles.rail} aria-label="Primary">
      {links.map((item) => (
        <NavLink
          key={item.label}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) => `text-small ${styles.item} ${isActive ? styles.active : ''}`}
        >
          {item.label}
        </NavLink>
      ))}
      {soon.map((label) => (
        <button key={label} type="button" className={`text-small ${styles.item}`} disabled>
          {label}
          <span className={`text-label ${styles.soon}`}>soon</span>
        </button>
      ))}
    </nav>
  );
}
