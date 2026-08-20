import type { PropsWithChildren, ReactNode } from 'react';
import styles from './DocProse.module.css';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function Section({ title, children }: PropsWithChildren<{ title: string }>) {
  const id = slugify(title);
  return (
    <section className={styles.section}>
      <h2 id={id} className={`text-h2 ${styles.heading}`}>
        {title}
      </h2>
      {children}
    </section>
  );
}

export function SubSection({ title, children }: PropsWithChildren<{ title: string }>) {
  const id = slugify(title);
  return (
    <div className={styles.section}>
      <h3 id={id} className={`text-h3 ${styles.heading}`}>
        {title}
      </h3>
      {children}
    </div>
  );
}

export function P({ children }: PropsWithChildren) {
  return <p>{children}</p>;
}

export function UL({ children }: { children: ReactNode }) {
  return <ul className={styles.list}>{children}</ul>;
}

export function OL({ children }: { children: ReactNode }) {
  return <ol className={styles.list}>{children}</ol>;
}
