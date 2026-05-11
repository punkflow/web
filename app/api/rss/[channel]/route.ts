import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateRss, type FeedItem } from "@/lib/rss";
import { siteUrl, urls } from "@/lib/routing";

export const revalidate = 600;

/**
 * Per-channel RSS feed: latest published episodes for one channel.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ channel: string }> },
) {
  const { channel: channelSlug } = await params;
  const supabase = await createClient();

  const { data: channel } = await supabase
    .from("channels")
    .select("id, slug, name, description, banner_url, avatar_url")
    .eq("slug", channelSlug)
    .eq("is_published", true)
    .single();

  if (!channel) {
    return new NextResponse("Channel not found", { status: 404 });
  }

  const { data: episodes, error } = await supabase
    .from("episodes")
    .select(
      "id, slug, title, description, thumbnail_url, duration_seconds, published_at",
    )
    .eq("channel_id", channel.id)
    .eq("visibility", "public")
    .not("published_at", "is", null)
    .order("published_at", { ascending: false })
    .limit(50);

  if (error) {
    return new NextResponse(`Feed error: ${error.message}`, { status: 500 });
  }

  const items: FeedItem[] = (episodes ?? []).map((e) => ({
    title: e.title,
    description: e.description ?? "",
    link: siteUrl(urls.episode(channel.slug, e.slug)),
    guid: e.id,
    pubDate: new Date(e.published_at!).toUTCString(),
    thumbnailUrl: e.thumbnail_url ?? undefined,
    durationSeconds: e.duration_seconds ?? undefined,
    channelName: channel.name,
  }));

  const xml = generateRss({
    title: channel.name,
    description: channel.description ?? `${channel.name} on PunkFlow.`,
    link: siteUrl(urls.channel(channel.slug)),
    selfUrl: siteUrl(urls.channelRss(channel.slug)),
    imageUrl: channel.banner_url ?? channel.avatar_url ?? undefined,
    items,
  });

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=600, s-maxage=600",
    },
  });
}
