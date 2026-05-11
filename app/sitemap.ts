import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { siteUrl, urls } from "@/lib/routing";

export const revalidate = 3600; // 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const [channelsRes, episodesRes, seriesRes] = await Promise.all([
    supabase
      .from("channels")
      .select("slug, updated_at")
      .eq("is_published", true),
    supabase
      .from("episodes")
      .select(
        "slug, updated_at, channels:channel_id(slug)",
      )
      .eq("visibility", "public")
      .not("published_at", "is", null),
    supabase
      .from("series")
      .select(
        "slug, updated_at, channels:channel_id(slug)",
      )
      .not("channel_id", "is", null),
  ]);

  const now = new Date();

  const staticUrls: MetadataRoute.Sitemap = [
    { url: siteUrl(urls.home()), lastModified: now, priority: 1.0 },
    { url: siteUrl(urls.about()), lastModified: now, priority: 0.5 },
    { url: siteUrl(urls.manifesto()), lastModified: now, priority: 0.7 },
  ];

  const channelUrls: MetadataRoute.Sitemap = (channelsRes.data ?? []).map(
    (c) => ({
      url: siteUrl(urls.channel(c.slug)),
      lastModified: new Date(c.updated_at),
      priority: 0.8,
    }),
  );

  const episodeUrls: MetadataRoute.Sitemap = (episodesRes.data ?? []).map(
    (e: any) => ({
      url: siteUrl(urls.episode(e.channels.slug, e.slug)),
      lastModified: new Date(e.updated_at),
      priority: 0.9,
    }),
  );

  const seriesUrls: MetadataRoute.Sitemap = (seriesRes.data ?? [])
    .filter((s: any) => s.channels?.slug)
    .map((s: any) => ({
      url: siteUrl(urls.series(s.channels.slug, s.slug)),
      lastModified: new Date(s.updated_at),
      priority: 0.6,
    }));

  return [...staticUrls, ...channelUrls, ...episodeUrls, ...seriesUrls];
}
