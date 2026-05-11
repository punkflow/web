/**
 * SEO helpers: OpenGraph metadata and JSON-LD structured data.
 *
 * Page components call episodeMetadata() / channelMetadata() / studioMetadata()
 * to get a Next.js Metadata object for their generateMetadata() exports, and
 * embed the JSON-LD output as a <script type="application/ld+json"> tag.
 */

import type { Metadata } from "next";
import { siteUrl } from "./routing";

// ============================================================
// Episode
// ============================================================

export interface EpisodeSeoInput {
  title: string;
  description?: string;
  channelName: string;
  channelUrl: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
  publishedAt?: string;
  uploadedAt?: string;
  language?: string;
  playbackUrl?: string;
  episodeUrl: string;
}

export function episodeMetadata(input: EpisodeSeoInput): Metadata {
  const url = siteUrl(input.episodeUrl);
  const description =
    input.description ?? `${input.title} on ${input.channelName}. PunkFlow.`;

  return {
    title: `${input.title} — ${input.channelName}`,
    description,
    openGraph: {
      type: "video.episode",
      title: input.title,
      description,
      url,
      siteName: "PunkFlow",
      images: input.thumbnailUrl ? [{ url: input.thumbnailUrl }] : undefined,
      videos: input.playbackUrl
        ? [{ url: input.playbackUrl, type: "application/x-mpegURL" }]
        : undefined,
      locale: input.language ?? "en_US",
      releaseDate: input.publishedAt,
    },
    twitter: {
      card: "player",
      title: input.title,
      description,
      images: input.thumbnailUrl ? [input.thumbnailUrl] : undefined,
    },
    alternates: { canonical: url },
  };
}

/**
 * Build a schema.org VideoObject for an episode page.
 * Embed in the page as:
 *   <script type="application/ld+json"
 *     dangerouslySetInnerHTML={{ __html: JSON.stringify(episodeJsonLd(input)) }} />
 */
export function episodeJsonLd(input: EpisodeSeoInput): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: input.title,
    description: input.description,
    thumbnailUrl: input.thumbnailUrl,
    uploadDate: input.uploadedAt ?? input.publishedAt,
    duration: input.durationSeconds
      ? `PT${input.durationSeconds}S`
      : undefined,
    contentUrl: input.playbackUrl,
    embedUrl: siteUrl(input.episodeUrl),
    inLanguage: input.language ?? "en",
    publisher: {
      "@type": "Organization",
      name: "PunkFlow",
      url: siteUrl("/"),
    },
    isPartOf: {
      "@type": "CreativeWorkSeries",
      name: input.channelName,
      url: siteUrl(input.channelUrl),
    },
  };
}

// ============================================================
// Channel
// ============================================================

export interface ChannelSeoInput {
  name: string;
  description?: string;
  tagline?: string;
  bannerUrl?: string;
  avatarUrl?: string;
  channelUrl: string;
  atHandle?: string;
}

export function channelMetadata(input: ChannelSeoInput): Metadata {
  const url = siteUrl(input.channelUrl);
  const description =
    input.description ?? input.tagline ?? `${input.name} on PunkFlow.`;

  return {
    title: `${input.name} — PunkFlow`,
    description,
    openGraph: {
      type: "profile",
      title: input.name,
      description,
      url,
      siteName: "PunkFlow",
      images: input.bannerUrl
        ? [{ url: input.bannerUrl }]
        : input.avatarUrl
          ? [{ url: input.avatarUrl }]
          : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: input.name,
      description,
      images: input.bannerUrl ? [input.bannerUrl] : undefined,
    },
    alternates: { canonical: url },
  };
}

export function channelJsonLd(input: ChannelSeoInput): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWorkSeries",
    name: input.name,
    description: input.description ?? input.tagline,
    url: siteUrl(input.channelUrl),
    image: input.bannerUrl ?? input.avatarUrl,
    sameAs: input.atHandle ? [`https://bsky.app/profile/${input.atHandle}`] : undefined,
    publisher: {
      "@type": "Organization",
      name: "PunkFlow",
      url: siteUrl("/"),
    },
  };
}

// ============================================================
// Studio (PunkFlow itself)
// ============================================================

export interface StudioSeoInput {
  name: string;
  description?: string;
  tagline?: string;
  bannerUrl?: string;
  avatarUrl?: string;
  atHandle?: string;
}

export function studioMetadata(input: StudioSeoInput): Metadata {
  const url = siteUrl("/");
  const description =
    input.description ?? input.tagline ?? `${input.name}. Punk Obscura.`;

  return {
    title: input.name,
    description,
    openGraph: {
      type: "website",
      title: input.name,
      description,
      url,
      siteName: input.name,
      images: input.bannerUrl
        ? [{ url: input.bannerUrl }]
        : input.avatarUrl
          ? [{ url: input.avatarUrl }]
          : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: input.name,
      description,
      images: input.bannerUrl ? [input.bannerUrl] : undefined,
    },
    alternates: { canonical: url },
  };
}

export function studioJsonLd(input: StudioSeoInput): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: input.name,
    description: input.description ?? input.tagline,
    url: siteUrl("/"),
    logo: input.avatarUrl,
    image: input.bannerUrl ?? input.avatarUrl,
    sameAs: input.atHandle ? [`https://bsky.app/profile/${input.atHandle}`] : undefined,
  };
}
