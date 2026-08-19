export function truncateHash(hash: string, lead = 6, tail = 4): string {
  if (hash.length <= lead + tail + 3) return hash;
  return `${hash.slice(0, lead)}…${hash.slice(-tail)}`;
}

export function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d
    .toISOString()
    .replace('T', ' ')
    .replace(/\.\d+Z$/, ' UTC');
}

export function relativeTime(iso: string, now = Date.now()): string {
  const diffMs = now - new Date(iso).getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  return `${diffDay}d ago`;
}
