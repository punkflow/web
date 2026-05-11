import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { createServiceClient } from "@/lib/supabase/service";
import { getVideo, publicHlsUrl, publicThumbnailUrl } from "@/lib/stream/api";
import type { Json } from "@/lib/supabase/types";

/**
 * Cloudflare Stream webhook handler.
 *
 * Stream sends a POST when a video transitions to `ready_to_stream`.
 * We verify the signature via the Webhook-Signature header (HMAC-SHA256
 * over `time.body`), look up the episode by provider_video_id, and update
 * the cached playback metadata.
 *
 * Configure the webhook URL in the Cloudflare dashboard:
 *   https://punkflow.com/api/webhooks/cloudflare-stream
 *
 * And set CLOUDFLARE_STREAM_WEBHOOK_SECRET to the secret shown there.
 */

interface StreamWebhookPayload {
  uid: string;
  readyToStream: boolean;
  status: { state: string };
  meta?: Record<string, unknown>;
  duration?: number;
  input?: { width: number; height: number };
  uploaded?: string;
}

function verifySignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.CLOUDFLARE_STREAM_WEBHOOK_SECRET;
  if (!secret || !signatureHeader) return false;

  // Header format: "time=<unix>,sig1=<hex>"
  const parts = Object.fromEntries(
    signatureHeader.split(",").map((p) => p.split("=", 2) as [string, string]),
  );
  const time = parts.time;
  const sig = parts.sig1;
  if (!time || !sig) return false;

  // Reject signatures older than 5 minutes
  const ageSeconds = Math.floor(Date.now() / 1000) - Number(time);
  if (Math.abs(ageSeconds) > 300) return false;

  const expected = createHmac("sha256", secret)
    .update(`${time}.${rawBody}`)
    .digest("hex");

  const expectedBuf = Buffer.from(expected, "hex");
  const sigBuf = Buffer.from(sig, "hex");
  if (expectedBuf.length !== sigBuf.length) return false;
  return timingSafeEqual(expectedBuf, sigBuf);
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("Webhook-Signature");

  if (!verifySignature(rawBody, signature)) {
    return new NextResponse("Invalid signature", { status: 401 });
  }

  let payload: StreamWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new NextResponse("Invalid JSON", { status: 400 });
  }

  // Only act on ready-to-stream events
  if (!payload.readyToStream || payload.status.state !== "ready") {
    return new NextResponse("Ignored (not ready)", { status: 200 });
  }

  const supabase = createServiceClient();

  // Fetch full video metadata from Stream
  const video = await getVideo(payload.uid);

  const aspectRatio =
    video.input?.width && video.input?.height
      ? `${video.input.width}:${video.input.height}`
      : null;

  const { error } = await supabase
    .from("episodes")
    .update({
      provider_metadata: {
        uid: video.uid,
        ready_to_stream: video.readyToStream,
        uploaded_at: video.uploaded,
        input_size_bytes: video.size,
        input_width: video.input?.width,
        input_height: video.input?.height,
        meta: video.meta as Json,
      },
      playback_url: publicHlsUrl(video.uid),
      thumbnail_url: publicThumbnailUrl(video.uid),
      preview_url: video.preview,
      duration_seconds: Math.round(video.duration),
      aspect_ratio: aspectRatio,
    })
    .eq("video_provider", "cloudflare_stream")
    .eq("provider_video_id", payload.uid);

  if (error) {
    console.error("Failed to update episode from Stream webhook:", error);
    return new NextResponse(`DB error: ${error.message}`, { status: 500 });
  }

  return new NextResponse("OK", { status: 200 });
}
