import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { studioMetadata } from "@/lib/seo";
import { urls } from "@/lib/routing";

const STUDIO_SLUG = "punkflow";

const getStudio = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("studios")
    .select(
      `
      id,
      slug,
      name,
      tagline,
      description,
      avatar_url,
      banner_url,
      at_handle,
      channels ( id, slug, name, tagline, description, avatar_url )
    `,
    )
    .eq("slug", STUDIO_SLUG)
    .eq("channels.is_published", true)
    .order("name", { foreignTable: "channels", ascending: true })
    .maybeSingle();
  return data;
});

export async function generateMetadata(): Promise<Metadata> {
  const studio = await getStudio();
  if (!studio) return {};
  return studioMetadata({
    name: studio.name,
    description: studio.description ?? undefined,
    tagline: studio.tagline ?? undefined,
    bannerUrl: studio.banner_url ?? undefined,
    avatarUrl: studio.avatar_url ?? undefined,
    atHandle: studio.at_handle ?? undefined,
  });
}

export default async function StudioLanding() {
  const studio = await getStudio();
  if (!studio) notFound();

  return (
    <main className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
      <header className="mb-12 mt-4">
        <h1 className="text-4xl font-semibold tracking-tight">{studio.name}</h1>
        {studio.tagline && (
          <p className="mt-3 max-w-3xl text-lg text-foreground/70">
            {studio.tagline}
          </p>
        )}
        {studio.description && (
          <p className="mt-4 max-w-3xl text-base leading-relaxed">
            {studio.description}
          </p>
        )}
      </header>

      {studio.channels.length > 0 ? (
        <section
          aria-label="Channels"
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {studio.channels.map((channel) => (
            <Link
              key={channel.id}
              href={urls.channel(channel.slug)}
              className="group block rounded-lg border border-foreground/10 p-6 transition-colors hover:border-foreground/30 hover:bg-foreground/[0.02]"
            >
              <h2 className="text-xl font-semibold tracking-tight group-hover:underline">
                {channel.name}
              </h2>
              {channel.tagline && (
                <p className="mt-2 text-sm text-foreground/70">
                  {channel.tagline}
                </p>
              )}
              {channel.description && (
                <p className="mt-3 text-sm leading-relaxed line-clamp-3">
                  {channel.description}
                </p>
              )}
            </Link>
          ))}
        </section>
      ) : (
        <p className="text-foreground/60">No channels published yet.</p>
      )}
    </main>
  );
}
