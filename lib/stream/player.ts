/**
 * Configuration helpers for the @cloudflare/stream-react player.
 */

export interface PlayerConfig {
  src: string;
  poster?: string;
  primaryColor?: string;
  autoplay?: boolean;
  muted?: boolean;
  controls?: boolean;
  defaultTextTrack?: string;
  startTime?: number;
  preload?: "auto" | "metadata" | "none";
}

export interface PlayerConfigInput {
  videoUid: string;
  accentColor?: string;
  thumbnailUrl?: string;
  autoplay?: boolean;
  defaultCaptionLanguage?: string;
  startAtSeconds?: number;
}

/**
 * Build a config object for the Stream React player from episode + channel data.
 * Falls back to sensible defaults for anything not provided.
 */
export function buildPlayerConfig(input: PlayerConfigInput): PlayerConfig {
  return {
    src: input.videoUid,
    poster: input.thumbnailUrl,
    primaryColor: input.accentColor ?? "#ffffff",
    autoplay: input.autoplay ?? false,
    muted: input.autoplay ?? false, // muted is required when autoplay is true
    controls: true,
    defaultTextTrack: input.defaultCaptionLanguage,
    startTime: input.startAtSeconds,
    preload: "metadata",
  };
}
