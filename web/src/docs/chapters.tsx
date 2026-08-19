import type { ComponentType } from 'react';
import { Overview } from './chapters/Overview';
import { Architecture } from './chapters/Architecture';
import { Ledger } from './chapters/Ledger';
import { ConnectMcp } from './chapters/ConnectMcp';
import { PayPerCall } from './chapters/PayPerCall';
import { Asp } from './chapters/Asp';
import { Reference } from './chapters/Reference';

export interface DocChapter {
  slug: string;
  title: string;
  group: string;
  Component: ComponentType;
}

export const docGroups = ['Product', 'Integrate', 'Reference'] as const;

export const chapters: DocChapter[] = [
  { slug: 'overview', title: 'Overview', group: 'Product', Component: Overview },
  { slug: 'architecture', title: 'Architecture', group: 'Product', Component: Architecture },
  { slug: 'ledger', title: 'The Ledger', group: 'Product', Component: Ledger },
  { slug: 'mcp', title: 'Connect via MCP', group: 'Integrate', Component: ConnectMcp },
  { slug: 'x402', title: 'Pay-per-call (x402)', group: 'Integrate', Component: PayPerCall },
  { slug: 'asp', title: 'Become an ASP', group: 'Integrate', Component: Asp },
  { slug: 'reference', title: 'Scripts & Environment', group: 'Reference', Component: Reference },
];

export function chapterBySlug(slug: string | undefined): DocChapter {
  return chapters.find((c) => c.slug === slug) ?? chapters[0];
}
