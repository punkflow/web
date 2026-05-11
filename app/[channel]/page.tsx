import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { channelMetadata } from "@/lib/seo";
import { urls, validateChannelSlug } from "@/lib/routing";

interface ChannelPageParams {
  channel: string;
}

const getChannel = cache(async (channelSlug: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("channels")
    .select(
      `
      id,
      slug,
      name,
      tagline,
      description,
      avatar_url,
      banner_url,
      accent_color,
      at_handle,
      episodes ( id, slug, title, description, thumbnail_url, duration_seconds, published_at )
    `,
    )
    .eq("slug", channelSlug)
    .eq("is_published", true)
    .eq("episodes.visibility", "public")
    .order("published_at", { foreignTable: "episodes", ascending: false })
    .maybeSingle();
  return data;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<ChannelPageParams>;
}): Promise<Metadata> {
  const { channel: channelSlug } = await params;
  if (!validateChannelSlug(channelSlug).ok) return {};
  const channel = await getChannel(channelSlug);
  if (!channel) return {};
  return channelMetadata({
    name: channel.name,
    description: channel.description ?? undefined,
    tagline: channel.tagline ?? undefined,
    bannerUrl: channel.banner_url ?? undefined,
    avatarUrl: channel.avatar_url ?? undefined,
    channelUrl: urls.channel(channelSlug),
    atHandle: channel.at_handle ?? undefined,
  });
}

export default async function ChannelPage({
  params,
}: {
  params: Promise<ChannelPageParams>;
}) {
  const { channel: channelSlug } = await params;
  if (!validateChannelSlug(channelSlug).ok) notFound();
  const channel = await getChannel(channelSlug);
  if (!channel) notFound();

  return (
    <main className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">{channel.name}</h1>
        {channel.tagline && (
          <p className="mt-1 text-base text-muted-foreground">
            {channel.tagline}
          </p>
        )}
        {channel.description && (
          <p className="mt-4 max-w-3xl text-base leading-relaxed">
            {channel.description}
          </p>
        )}
      </header>

      {channel.episodes.length > 0 ? (
        <section
          aria-label="Episodes"
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {channel.episodes.map((episode) => (
            <Link
              key={episode.id}
              href={urls.episode(channelSlug, episode.slug)}
              className="group block"
            >
              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
                {episode.thumbnail_url && (
                  <Image
                    src={episode.thumbnail_url}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                )}
              </div>
              <h2 className="mt-3 text-base font-medium group-hover:underline">
                {episode.title}
              </h2>
              {episode.description && (
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {episode.description}
                </p>
              )}
            </Link>
          ))}
        </section>
      ) : (
        <p className="text-muted-foreground">No episodes yet.</p>
      )}
    </main>
  );
}
