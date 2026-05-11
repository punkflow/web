"use client";

import { Stream } from "@cloudflare/stream-react";
import { buildPlayerConfig } from "@/lib/stream/player";

interface EpisodePlayerProps {
  videoUid: string;
  accentColor?: string;
  thumbnailUrl?: string;
}

export function EpisodePlayer({
  videoUid,
  accentColor,
  thumbnailUrl,
}: EpisodePlayerProps) {
  const config = buildPlayerConfig({
    videoUid,
    accentColor,
    thumbnailUrl,
  });

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
      <Stream
        src={config.src}
        poster={config.poster}
        primaryColor={config.primaryColor}
        controls={config.controls}
        autoplay={config.autoplay}
        muted={config.muted}
        preload={config.preload}
        startTime={config.startTime}
        defaultTextTrack={config.defaultTextTrack}
      />
    </div>
  );
}
