import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateRss, type FeedItem } from "@/lib/rss";
import { siteUrl, urls } from "@/lib/routing";

export const revalidate = 600; // 10 minutes

/**
 * Studio-aggregate RSS feed: latest published episodes across all PunkFlow channels.
 */
export async function GET() {
  const supabase = await createClient();

  const { data: episodes, error } = await supabase
    .from("episodes")
    .select(
      `id, slug, title, description, thumbnail_url, duration_seconds, published_at,
       channels:channel_id ( slug, name )`,
    )
    .eq("visibility", "public")
    .not("published_at", "is", null)
    .order("published_at", { ascending: false })
    .limit(50);

  if (error) {
    return new NextResponse(`Feed error: ${error.message}`, { status: 500 });
  }

  const items: FeedItem[] = (episodes ?? []).map((e: any) => ({
    title: e.title,
    description: e.description ?? "",
    link: siteUrl(urls.episode(e.channels.slug, e.slug)),
    guid: e.id,
    pubDate: new Date(e.published_at).toUTCString(),
    thumbnailUrl: e.thumbnail_url ?? undefined,
    durationSeconds: e.duration_seconds ?? undefined,
    channelName: e.channels.name,
  }));

  const xml = generateRss({
    title: "PunkFlow",
    description:
      "Latest from PunkFlow studio: Child Aurum, Simone Pixel, OddTake.",
    link: siteUrl("/"),
    selfUrl: siteUrl(urls.rss()),
    items,
  });

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=600, s-maxage=600",
    },
  });
}
