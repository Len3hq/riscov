import { truncateHash } from '../lib/format';

export function Hash({ value }: { value: string }) {
  return (
    <code className="hash" title={value}>
      {truncateHash(value)}
    </code>
  );
}
