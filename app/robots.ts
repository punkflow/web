import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/routing";

/**
 * robots.txt
 *
 * Site-level default opts out of AI training crawlers. This is the site
 * floor; per-episode ai_permissions in the schema (and on AT Protocol
 * records) can be more permissive on a case-by-case basis if the creator
 * chooses to allow specific uses for specific episodes.
 *
 * If you ever want to flip the default to opt-in, change the rules below
 * and document the decision in the Latent Mind Cipher.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Normal crawlers: allow indexing, exclude internal API and permanent-ID URLs
      // (permanent-IDs are for citations, not primary indexing).
      { userAgent: "*", allow: "/", disallow: ["/api/", "/e/"] },

      // AI training crawlers: explicit opt-out at the site level.
      // Matches the creator-protective default of ai_training=false.
      { userAgent: "GPTBot", disallow: "/" },
      { userAgent: "ChatGPT-User", disallow: "/" },
      { userAgent: "OAI-SearchBot", disallow: "/" },
      { userAgent: "ClaudeBot", disallow: "/" },
      { userAgent: "anthropic-ai", disallow: "/" },
      { userAgent: "Google-Extended", disallow: "/" },
      { userAgent: "PerplexityBot", disallow: "/" },
      { userAgent: "Applebot-Extended", disallow: "/" },
      { userAgent: "CCBot", disallow: "/" },
      { userAgent: "Bytespider", disallow: "/" },
      { userAgent: "Amazonbot", disallow: "/" },
      { userAgent: "Meta-ExternalAgent", disallow: "/" },
      { userAgent: "FacebookBot", disallow: "/" },
      { userAgent: "Diffbot", disallow: "/" },
    ],
    sitemap: siteUrl("/sitemap.xml"),
    host: siteUrl("/"),
  };
}
