/**
 * Cloudflare Stream REST API wrapper.
 *
 * Server-side only. Uses CLOUDFLARE_STREAM_API_TOKEN which must never reach
 * the browser. Public playback URLs can be constructed by helpers below
 * using the customer subdomain (which IS safe to expose).
 */

const STREAM_API_BASE = "https://api.cloudflare.com/client/v4";

function streamApiUrl(path: string): string {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  if (!accountId) {
    throw new Error("CLOUDFLARE_ACCOUNT_ID is not set");
  }
  return `${STREAM_API_BASE}/accounts/${accountId}/stream${path}`;
}

function authHeader(): Record<string, string> {
  const token = process.env.CLOUDFLARE_STREAM_API_TOKEN;
  if (!token) {
    throw new Error("CLOUDFLARE_STREAM_API_TOKEN is not set");
  }
  return { Authorization: `Bearer ${token}` };
}

export interface StreamVideo {
  uid: string;
  readyToStream: boolean;
  thumbnail: string;
  preview: string;
  duration: number;
  status: { state: string; pctComplete?: string };
  meta: Record<string, unknown>;
  input: { width: number; height: number };
  playback: { hls: string; dash: string };
  uploaded: string;
  size: number;
}

/**
 * Fetch metadata for a single video.
 */
export async function getVideo(uid: string): Promise<StreamVideo> {
  const res = await fetch(streamApiUrl(`/${uid}`), {
    headers: authHeader(),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(
      `Cloudflare Stream getVideo failed: ${res.status} ${res.statusText}`,
    );
  }
  const json = (await res.json()) as { result: StreamVideo };
  return json.result;
}

/**
 * List videos (paginated). Use `before`/`after` cursors for pagination.
 */
export async function listVideos(opts: {
  limit?: number;
  before?: string;
  after?: string;
} = {}): Promise<StreamVideo[]> {
  const params = new URLSearchParams();
  if (opts.limit) params.set("limit", String(opts.limit));
  if (opts.before) params.set("before", opts.before);
  if (opts.after) params.set("after", opts.after);
  const qs = params.toString();

  const res = await fetch(streamApiUrl(qs ? `?${qs}` : ""), {
    headers: authHeader(),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(
      `Cloudflare Stream listVideos failed: ${res.status} ${res.statusText}`,
    );
  }
  const json = (await res.json()) as { result: StreamVideo[] };
  return json.result;
}

/**
 * Create a one-time TUS upload URL for direct creator uploads.
 * Returns the URL the client should PUT/PATCH chunks to, plus the
 * eventual UID the video will have once uploaded.
 */
export async function createDirectUpload(opts: {
  maxDurationSeconds?: number;
  expirySeconds?: number;
  meta?: Record<string, string>;
}): Promise<{ uploadUrl: string; uid: string }> {
  const expiry = new Date(
    Date.now() + (opts.expirySeconds ?? 3600) * 1000,
  ).toISOString();

  const res = await fetch(streamApiUrl("/direct_upload"), {
    method: "POST",
    headers: { ...authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify({
      maxDurationSeconds: opts.maxDurationSeconds ?? 3600,
      expiry,
      meta: opts.meta ?? {},
    }),
  });

  if (!res.ok) {
    throw new Error(
      `Cloudflare Stream direct_upload failed: ${res.status} ${res.statusText}`,
    );
  }

  const json = (await res.json()) as {
    result: { uploadURL: string; uid: string };
  };
  return { uploadUrl: json.result.uploadURL, uid: json.result.uid };
}

/**
 * Construct the public HLS playback URL for a given video UID.
 * Use only for episodes whose access_model is 'free'. For paid content,
 * use a signed playback token (Phase 3+).
 */
export function publicHlsUrl(uid: string): string {
  const subdomain = process.env.CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN;
  if (!subdomain) {
    throw new Error("CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN is not set");
  }
  return `https://${subdomain}/${uid}/manifest/video.m3u8`;
}

/**
 * Construct a public thumbnail URL with optional time/size parameters.
 */
export function publicThumbnailUrl(
  uid: string,
  opts: { time?: string; height?: number; width?: number } = {},
): string {
  const subdomain = process.env.CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN;
  if (!subdomain) {
    throw new Error("CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN is not set");
  }
  const params = new URLSearchParams();
  if (opts.time) params.set("time", opts.time);
  if (opts.height) params.set("height", String(opts.height));
  if (opts.width) params.set("width", String(opts.width));
  const qs = params.toString();
  return `https://${subdomain}/${uid}/thumbnails/thumbnail.jpg${qs ? `?${qs}` : ""}`;
}
