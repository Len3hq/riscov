import { Link } from 'react-router-dom';
import styles from './TopBar.module.css';

export function TopBar() {
  return (
    <header className={styles.bar}>
      <Link to="/" className={styles.brand}>
        <img className={styles.lockup} src="/assets/riscov-lockup.svg" alt="riscov" height={24} />
      </Link>
    </header>
  );
}
