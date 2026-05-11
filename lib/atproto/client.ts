/**
 * AT Protocol client stub.
 *
 * Real implementation lands when the publishing pipeline is built (Phase 2+).
 * This file claims the module path and verifies the @atproto/api dependency
 * is installed.
 */

import { AtpAgent } from "@atproto/api";

/**
 * Create an authenticated AT Protocol agent for a given service.
 * Default: bsky.social (the main Bluesky PDS).
 *
 * For PunkFlow channels with their own DIDs, use that DID's PDS endpoint.
 */
export function createAgent(service: string = "https://bsky.social"): AtpAgent {
  return new AtpAgent({ service });
}

// TODO: Add publishing helpers when ready:
//   - publishStudioRecord(studio): write com.punkflow.video.studio to studio repo
//   - publishChannelRecord(channel): write com.punkflow.video.channel to channel repo
//   - publishSeriesRecord(series): write com.punkflow.video.series
//   - publishEpisodeRecord(episode): write com.punkflow.video.episode (canonical)
//   - publishEpisodeReference(channel, canonicalUri): write reference record
//   - resolveHandle(handle): handle -> DID resolution
