/**
 * RSS feed generation for per-channel and studio-aggregate feeds.
 *
 * Output is RSS 2.0 with the media: and itunes: namespaces for thumbnails
 * and durations. Compatible with standard feed readers, podcast clients
 * that handle video, and AT Protocol feed bridges.
 */

export interface FeedItem {
  title: string;
  description: string;
  link: string;
  guid: string;
  pubDate: string; // RFC 822 format
  thumbnailUrl?: string;
  durationSeconds?: number;
  channelName: string;
  authorEmail?: string; // optional, for podcast-style readers
}

export interface FeedInput {
  title: string;
  description: string;
  link: string; // Channel or studio public URL
  selfUrl: string; // The feed URL itself (for atom:link rel=self)
  language?: string;
  imageUrl?: string;
  items: FeedItem[];
}

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function cdata(s: string): string {
  // CDATA blocks can't contain "]]>"; split if needed.
  return `<![CDATA[${s.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
}

export function generateRss(feed: FeedInput): string {
  const items = feed.items
    .map(
      (item) => `    <item>
      <title>${cdata(item.title)}</title>
      <description>${cdata(item.description)}</description>
      <link>${xmlEscape(item.link)}</link>
      <guid isPermaLink="false">${xmlEscape(item.guid)}</guid>
      <pubDate>${item.pubDate}</pubDate>
      <source url="${xmlEscape(feed.selfUrl)}">${xmlEscape(item.channelName)}</source>
${item.thumbnailUrl ? `      <media:thumbnail url="${xmlEscape(item.thumbnailUrl)}" />\n` : ""}${item.durationSeconds ? `      <itunes:duration>${item.durationSeconds}</itunes:duration>\n` : ""}    </item>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:media="http://search.yahoo.com/mrss/"
     xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <channel>
    <title>${cdata(feed.title)}</title>
    <description>${cdata(feed.description)}</description>
    <link>${xmlEscape(feed.link)}</link>
    <atom:link href="${xmlEscape(feed.selfUrl)}" rel="self" type="application/rss+xml" />
    <language>${feed.language ?? "en-us"}</language>
    <generator>PunkFlow</generator>${feed.imageUrl ? `\n    <image><url>${xmlEscape(feed.imageUrl)}</url><title>${cdata(feed.title)}</title><link>${xmlEscape(feed.link)}</link></image>` : ""}
${items}
  </channel>
</rss>
`;
}
