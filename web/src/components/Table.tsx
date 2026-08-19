import type { PropsWithChildren, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import styles from './Table.module.css';

export function Table({ children }: PropsWithChildren) {
  return (
    <div className={styles.wrap}>
      <table className={styles.table}>{children}</table>
    </div>
  );
}

interface CellProps {
  numeric?: boolean;
}

export function Th({
  children,
  className,
  numeric,
  ...rest
}: PropsWithChildren<ThHTMLAttributes<HTMLTableCellElement> & CellProps>) {
  return (
    <th
      className={[styles.th, 'text-label', numeric && styles.numeric, className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  className,
  numeric,
  ...rest
}: PropsWithChildren<TdHTMLAttributes<HTMLTableCellElement> & CellProps>) {
  return (
    <td
      className={[styles.td, numeric && styles.numeric, className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </td>
  );
}

export function Tr({
  children,
  onClick,
  active,
}: PropsWithChildren<{ onClick?: () => void; active?: boolean }>) {
  const classes = [styles.tr, onClick && styles.clickable, active && styles.active]
    .filter(Boolean)
    .join(' ');
  return (
    <tr className={classes} onClick={onClick}>
      {children}
    </tr>
  );
}
