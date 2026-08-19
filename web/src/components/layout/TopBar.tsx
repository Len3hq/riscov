import styles from './TopBar.module.css';

export function TopBar() {
  return (
    <header className={styles.bar}>
      <img className={styles.lockup} src="/assets/riscov-lockup.svg" alt="riscov" height={24} />
    </header>
  );
}
