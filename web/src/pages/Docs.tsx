import { NavLink, useParams } from 'react-router-dom';
import { chapters, chapterBySlug, docGroups } from '../docs/chapters';
import styles from './Docs.module.css';

export function Docs() {
  const { slug } = useParams();
  const active = chapterBySlug(slug);
  const index = chapters.findIndex((c) => c.slug === active.slug);
  const prev = index > 0 ? chapters[index - 1] : undefined;
  const next = index < chapters.length - 1 ? chapters[index + 1] : undefined;

  return (
    <div className={styles.layout}>
      <nav className={styles.nav} aria-label="Docs chapters">
        {docGroups.map((group) => (
          <div key={group} className={styles.group}>
            <span className={`text-label ${styles.groupLabel}`}>{group}</span>
            {chapters
              .filter((c) => c.group === group)
              .map((c) => (
                <NavLink
                  key={c.slug}
                  to={`/docs/${c.slug}`}
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive || (c.slug === active.slug && !slug) ? styles.active : ''}`
                  }
                >
                  {c.title}
                </NavLink>
              ))}
          </div>
        ))}
      </nav>

      <article className={styles.content}>
        <div>
          <span className={`text-label ${styles.eyebrow}`}>riscov / docs</span>
          <h1 className={`text-h1 ${styles.title}`}>{active.title}</h1>
        </div>

        <active.Component />

        <div className={styles.footerNav}>
          {prev ? (
            <NavLink to={`/docs/${prev.slug}`} className={styles.footerLink}>
              <span className={`text-label ${styles.footerDir}`}>previous</span>
              <span>{prev.title}</span>
            </NavLink>
          ) : (
            <span />
          )}
          {next && (
            <NavLink to={`/docs/${next.slug}`} className={`${styles.footerLink} ${styles.next}`}>
              <span className={`text-label ${styles.footerDir}`}>next</span>
              <span>{next.title}</span>
            </NavLink>
          )}
        </div>
      </article>
    </div>
  );
}
