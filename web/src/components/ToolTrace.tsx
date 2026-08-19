import type { ToolCallRecord } from '../data/demoRatings';
import styles from './ToolTrace.module.css';

export function ToolTrace({ calls }: { calls: ToolCallRecord[] }) {
  return (
    <ul className={styles.list}>
      {calls.map((call, i) => (
        <li key={`${call.tool}-${i}`} className={styles.row}>
          <code className={`hash ${styles.call}`}>
            {call.tool}({JSON.stringify(call.args)})
          </code>
          <span className={`text-label ${styles.ms}`}>{call.tookMs}ms</span>
        </li>
      ))}
    </ul>
  );
}
