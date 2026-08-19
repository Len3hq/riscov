import styles from './CodeBlock.module.css';

interface CodeBlockProps {
  code: string;
  label?: string;
}

export function CodeBlock({ code, label }: CodeBlockProps) {
  return (
    <div className={styles.wrap}>
      {label && <span className={`text-label ${styles.label}`}>{label}</span>}
      <pre className={styles.pre}>
        <code>{code}</code>
      </pre>
    </div>
  );
}
