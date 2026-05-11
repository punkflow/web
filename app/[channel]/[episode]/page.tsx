import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EpisodePlayer } from "@/components/episode/EpisodePlayer";
import { episodeMetadata } from "@/lib/seo";
import { urls } from "@/lib/routing";

interface EpisodePageParams {
  channel: string;
  episode: string;
}

const getEpisode = cache(async (channelSlug: string, episodeSlug: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("episodes")
    .select(
      `
      id,
      slug,
      title,
      description,
      provider_video_id,
      duration_seconds,
      thumbnail_url,
      published_at,
      channel:channels!inner ( slug, name, accent_color )
    `,
    )
    .eq("channel.slug", channelSlug)
    .eq("slug", episodeSlug)
    .eq("visibility", "public")
    .maybeSingle();
  return data;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<EpisodePageParams>;
}): Promise<Metadata> {
  const { channel: channelSlug, episode: episodeSlug } = await params;
  const episode = await getEpisode(channelSlug, episodeSlug);
  if (!episode) return {};
  return episodeMetadata({
    title: episode.title,
    description: episode.description ?? undefined,
    channelName: episode.channel.name,
    channelUrl: urls.channel(channelSlug),
    thumbnailUrl: episode.thumbnail_url ?? undefined,
    durationSeconds: episode.duration_seconds ?? undefined,
    publishedAt: episode.published_at ?? undefined,
    episodeUrl: urls.episode(channelSlug, episodeSlug),
  });
}

export default async function EpisodePage({
  params,
}: {
  params: Promise<EpisodePageParams>;
}) {
  const { channel: channelSlug, episode: episodeSlug } = await params;
  const episode = await getEpisode(channelSlug, episodeSlug);
  if (!episode) notFound();

  return (
    <main className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
      <EpisodePlayer
        videoUid={episode.provider_video_id}
        thumbnailUrl={episode.thumbnail_url ?? undefined}
        accentColor={episode.channel.accent_color ?? undefined}
      />
      <header className="mt-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          {episode.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {episode.channel.name}
        </p>
        {episode.description && (
          <p className="mt-4 text-base leading-relaxed">{episode.description}</p>
        )}
      </header>
    </main>
  );
}
