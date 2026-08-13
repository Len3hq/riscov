import type { ToolDefinition } from "../agent/types.ts";

interface NewsItem {
  title: string;
  pubDate: string;
  source: string;
}

function decodeXmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function parseRssItems(xml: string, limit: number): NewsItem[] {
  const items: NewsItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match: RegExpExecArray | null;
  while ((match = itemRegex.exec(xml)) && items.length < limit) {
    const block = match[1] ?? "";
    const title = /<title>([\s\S]*?)<\/title>/.exec(block)?.[1] ?? "";
    const pubDate = /<pubDate>([\s\S]*?)<\/pubDate>/.exec(block)?.[1] ?? "";
    const source = /<source[^>]*>([\s\S]*?)<\/source>/.exec(block)?.[1] ?? "";
    items.push({
      title: decodeXmlEntities(title.replace(/^<!\[CDATA\[|\]\]>$/g, "")),
      pubDate,
      source: decodeXmlEntities(source.replace(/^<!\[CDATA\[|\]\]>$/g, "")),
    });
  }
  return items;
}

async function searchRecentActivity(args: Record<string, unknown>): Promise<unknown> {
  const asset = String(args.asset ?? "");
  const query = args.query ? String(args.query) : asset;
  const limit = typeof args.limit === "number" ? Math.min(args.limit, 15) : 8;

  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(
    query
  )}&hl=en-US&gl=US&ceid=US:en`;

  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; RiscovWatcher/0.1)" },
  });
  if (!res.ok) {
    throw new Error(`News search failed: ${res.status} ${res.statusText}`);
  }
  const xml = await res.text();
  const items = parseRssItems(xml, limit);

  return {
    asset,
    query,
    source: "google_news_rss",
    resultCount: items.length,
    items,
    note:
      items.length === 0
        ? "No recent news/governance/team activity found for this query — could mean genuinely quiet, or the query needs refining (try a more specific project name)."
        : undefined,
  };
}

export const searchRecentActivityTool: ToolDefinition = {
  spec: {
    type: "function",
    function: {
      name: "searchRecentActivity",
      description:
        "Open-ended search for recent news, governance posts, or team activity related to an asset/project. Use this to find things no other tool explicitly checks for — team silence, exploit rumors, governance drama, partnership news, etc. Real live web search (Google News), not a fixed check.",
      parameters: {
        type: "object",
        properties: {
          asset: { type: "string", description: "Asset symbol, e.g. 'FROG'" },
          query: {
            type: "string",
            description:
              "Optional custom search query, e.g. the project's full name or 'FROG token rug pull' — defaults to the asset symbol if omitted.",
          },
          limit: { type: "number", description: "Max results to return (default 8, max 15)" },
        },
        required: ["asset"],
      },
    },
  },
  handler: searchRecentActivity,
};
