/**
 * URL routing helpers, reserved word validation, and slug utilities.
 *
 * Channel slugs and episode slugs power our URL structure. Reserved
 * words exist to prevent slug collisions with top-level routes.
 */

export const RESERVED_CHANNEL_SLUGS = new Set<string>([
  // Current top-level routes
  "about",
  "manifesto",
  "api",
  "e",
  // Future top-level routes (reserved preemptively)
  "account",
  "admin",
  "auth",
  "dashboard",
  "embed",
  "login",
  "search",
  "settings",
  "studio",
  "studios",
  "support",
  // Infrastructure
  "_next",
  "sitemap.xml",
  "robots.txt",
  "feed.xml",
]);

/**
 * Reserved sub-slugs within a channel (cannot be used as episode slug).
 * Currently `series` collides with /[channel]/series/[series].
 */
export const RESERVED_EPISODE_SLUGS = new Set<string>(["series"]);

/**
 * Slug pattern: lowercase letters, digits, hyphens. Length 1-64.
 * Cannot start or end with a hyphen.
 */
const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/;

export function isValidSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug);
}

export function isReservedChannelSlug(slug: string): boolean {
  return RESERVED_CHANNEL_SLUGS.has(slug);
}

export function isReservedEpisodeSlug(slug: string): boolean {
  return RESERVED_EPISODE_SLUGS.has(slug);
}

export type SlugValidation = { ok: true } | { ok: false; reason: string };

export function validateChannelSlug(slug: string): SlugValidation {
  if (!isValidSlug(slug)) {
    return {
      ok: false,
      reason:
        "Slug must be lowercase letters, digits, and hyphens (1-64 chars, no leading/trailing hyphen).",
    };
  }
  if (isReservedChannelSlug(slug)) {
    return { ok: false, reason: `"${slug}" is reserved.` };
  }
  return { ok: true };
}

export function validateEpisodeSlug(slug: string): SlugValidation {
  if (!isValidSlug(slug)) {
    return {
      ok: false,
      reason:
        "Slug must be lowercase letters, digits, and hyphens (1-64 chars, no leading/trailing hyphen).",
    };
  }
  if (isReservedEpisodeSlug(slug)) {
    return { ok: false, reason: `"${slug}" is reserved within a channel.` };
  }
  return { ok: true };
}

/**
 * URL construction helpers. Always use these instead of building URLs
 * manually so URL convention changes only need to happen in one place.
 */
export const urls = {
  home: () => "/",
  about: () => "/about",
  manifesto: () => "/manifesto",
  channel: (channelSlug: string) => `/${channelSlug}`,
  episode: (channelSlug: string, episodeSlug: string) =>
    `/${channelSlug}/${episodeSlug}`,
  series: (channelSlug: string, seriesSlug: string) =>
    `/${channelSlug}/series/${seriesSlug}`,
  permanentEpisode: (uuid: string) => `/e/${uuid}`,
  rss: () => "/api/rss",
  channelRss: (channelSlug: string) => `/api/rss/${channelSlug}`,
};

/**
 * Builds an absolute URL using NEXT_PUBLIC_SITE_URL as the base.
 */
export function siteUrl(path: string = ""): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}
