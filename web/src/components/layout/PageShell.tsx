import type { PropsWithChildren } from 'react';
import { TopBar } from './TopBar';
import { SideRail } from './SideRail';
import styles from './PageShell.module.css';

export function PageShell({ children }: PropsWithChildren) {
  return (
    <div className={styles.shell}>
      <TopBar />
      <div className={styles.body}>
        <SideRail />
        <main className={styles.content}>
          <div className={styles.inner}>{children}</div>
        </main>
      </div>
    </div>
  );
}
