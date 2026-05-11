# PunkFlow web Phase 1 scaffold

Setup guide for the initial scaffold of `punkflow.com`. Read top-to-bottom on
first pass; use as reference thereafter.

---

## Stack lock

| Layer | Choice |
|-------|--------|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Component primitives | shadcn/ui |
| Database client | `@supabase/ssr` + `@supabase/supabase-js` |
| Video host | Cloudflare Stream via `@cloudflare/stream-react` |
| AT Protocol | `@atproto/api` (dependency only Phase 1; integration later) |
| Package manager | pnpm |
| Hosting | Vercel |
| Repo | `github.com/punkflow/web` (sibling to `punkflow/atproto-lexicons`) |
| Local path | `/Users/jason/Documents/punkflow/web/` |
| URL convention | `/[channel]` with reserved-word list (e.g. `/simone-pixel/journal-001`) |

---

## Initial setup commands

Run in order from `/Users/jason/Documents/punkflow/`.

```bash
# 1. Create the Next.js project
pnpm create next-app@latest web \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*" \
  --use-pnpm \
  --eslint

cd web

# 2. Add core dependencies
pnpm add @supabase/supabase-js @supabase/ssr
pnpm add @cloudflare/stream-react
pnpm add @atproto/api
pnpm add lucide-react

# 3. shadcn/ui init + a few primitives we'll need early
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button card dropdown-menu sheet separator

# 4. Create the GitHub repo and push
gh repo create punkflow/web \
  --public \
  --description "PunkFlow video infrastructure: Next.js + Supabase + Cloudflare Stream on AT Protocol"

git init
git add .
git commit -m "Initial scaffold"
git branch -M main
git remote add origin git@github.com:punkflow/web.git
git push -u origin main
```

---

## Directory structure

```
/Users/jason/Documents/punkflow/web/
├── app/
│   ├── (site)/                     # Route group for public-facing pages
│   │   ├── page.tsx                # /                       → studio landing
│   │   ├── about/page.tsx          # /about                  → about PunkFlow
│   │   ├── manifesto/page.tsx      # /manifesto              → Punk Obscura manifesto
│   │   ├── [channel]/
│   │   │   ├── page.tsx            # /[channel]              → channel landing
│   │   │   ├── [episode]/page.tsx  # /[channel]/[episode]    → episode page
│   │   │   └── series/[series]/page.tsx  # /[channel]/series/[series]
│   │   └── e/[uuid]/page.tsx       # /e/<uuid>               → permanent-id fallback
│   ├── api/
│   │   ├── rss/
│   │   │   ├── route.ts            # /api/rss                → studio aggregate feed
│   │   │   └── [channel]/route.ts  # /api/rss/[channel]      → per-channel feed
│   │   └── webhooks/
│   │       └── cloudflare-stream/route.ts
│   ├── sitemap.ts                  # /sitemap.xml
│   ├── robots.ts                   # /robots.txt
│   ├── layout.tsx                  # Root layout
│   └── globals.css
├── components/
│   ├── ui/                         # shadcn/ui primitives
│   ├── episode/
│   │   ├── EpisodePlayer.tsx       # Cloudflare Stream player wrapper
│   │   ├── EpisodeMetadata.tsx     # Title, channel, date, credits header
│   │   ├── EpisodeTranscript.tsx   # Scrollable click-to-seek transcript
│   │   ├── EpisodeCredits.tsx      # Full credits block
│   │   ├── EpisodeCopublishers.tsx # Two-channel byline
│   │   └── EpisodeProductionTools.tsx
│   ├── channel/
│   │   ├── ChannelHeader.tsx
│   │   └── ChannelEpisodeList.tsx
│   ├── studio/
│   │   └── StudioChannelGrid.tsx
│   └── shared/
│       ├── SiteHeader.tsx
│       └── SiteFooter.tsx
├── lib/
│   ├── supabase/
│   │   ├── server.ts               # Server-side client (anon, with cookies)
│   │   ├── client.ts               # Browser client (anon)
│   │   ├── service.ts              # Service-role client (server-only, bypasses RLS)
│   │   └── types.ts                # Generated via `supabase gen types`
│   ├── stream/
│   │   ├── api.ts                  # Cloudflare Stream REST wrapper
│   │   └── player.ts               # Player config helpers
│   ├── atproto/
│   │   └── client.ts               # Stubbed; real implementation later
│   ├── routing.ts                  # Reserved words, slug validation, URL helpers
│   ├── seo.ts                      # OpenGraph + JSON-LD helpers
│   └── rss.ts                      # RSS feed generation
├── public/
│   ├── favicon.ico
│   └── og-default.png
├── supabase/
│   └── migrations/
│       └── 0001_video_schema.sql   # ← schema file from previous step
├── styles/
│   └── print.css                   # Print stylesheet (transcripts, credits, manifesto)
├── REVISION_LOG.md                 # Per user preferences
├── .env.local                      # Local secrets (gitignored)
├── .env.example                    # Template (committed)
├── .gitignore                      # Includes .claude/ per user preferences
├── next.config.ts
├── tsconfig.json
└── package.json
```

Notes:
- `(site)` is a route group: pages live inside it but it doesn't appear in URLs.
  Used to scope shared layouts (header, footer) to the public site only.
- Tailwind v4 may not generate a `tailwind.config.ts`; configure via CSS variables
  in `globals.css` if so. Whatever `create-next-app` produces is fine.

---

## Route plan

| URL | File | Description |
|-----|------|-------------|
| `/` | `app/(site)/page.tsx` | Studio landing (PunkFlow) |
| `/about` | `app/(site)/about/page.tsx` | About PunkFlow |
| `/manifesto` | `app/(site)/manifesto/page.tsx` | Punk Obscura manifesto |
| `/[channel]` | `app/(site)/[channel]/page.tsx` | Channel landing |
| `/[channel]/[episode]` | `app/(site)/[channel]/[episode]/page.tsx` | Episode detail page |
| `/[channel]/series/[series]` | `app/(site)/[channel]/series/[series]/page.tsx` | Series page |
| `/e/[uuid]` | `app/(site)/e/[uuid]/page.tsx` | Permanent-ID fallback (citation-friendly) |
| `/api/rss` | `app/api/rss/route.ts` | Studio aggregate RSS |
| `/api/rss/[channel]` | `app/api/rss/[channel]/route.ts` | Per-channel RSS |
| `/api/webhooks/cloudflare-stream` | `app/api/webhooks/cloudflare-stream/route.ts` | Stream upload-complete webhook |
| `/sitemap.xml` | `app/sitemap.ts` | Auto-generated sitemap |
| `/robots.txt` | `app/robots.ts` | Robots policy |

### Reserved words

These cannot be used as channel slugs (would collide with top-level routes).
Hardcode the list in `lib/routing.ts` and validate against it before creating
a channel row.

```ts
export const RESERVED_CHANNEL_SLUGS = new Set([
  // current routes
  "about", "manifesto", "api", "e",
  // future routes (reserved now to avoid future conflicts)
  "account", "admin", "dashboard", "embed", "login",
  "search", "settings", "studio", "support",
  // infrastructure
  "_next", "sitemap.xml", "robots.txt", "feed.xml",
]);
```

Per-channel, the slug `series` is reserved on episodes (collides with the
series sub-route). Enforce in episode slug validation.

---

## Supabase wiring approach

Three clients, each for a specific context per the `@supabase/ssr` pattern:

**`lib/supabase/server.ts`** — Server Component / Route Handler reads
```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component context; setting cookies not allowed here.
          }
        },
      },
    }
  );
}
```

**`lib/supabase/client.ts`** — Client Component reads (rare in Phase 1 since
most rendering is server-side)
```ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**`lib/supabase/service.ts`** — Server-only writes that bypass RLS (admin
operations, webhook handlers)
```ts
import { createClient as createServiceClient } from "@supabase/supabase-js";

export function createClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
```

### Type generation

After applying the migration to Supabase, generate TypeScript types:

```bash
pnpm dlx supabase gen types typescript \
  --project-id <your-project-id> \
  > lib/supabase/types.ts
```

Re-run after every schema migration. Consider a CI step later.

---

## Cloudflare Stream wiring approach

Two layers:

**`lib/stream/api.ts`** — REST API wrapper for server-side operations
- Generate one-time upload URLs (TUS-resumable) for the eventual upload UI
- Fetch video metadata after upload completes
- Generate signed playback URLs when paid content lands (Phase 3)

**`components/episode/EpisodePlayer.tsx`** — Player wrapper
- Wraps `@cloudflare/stream-react`
- Reads channel `accent_color` for theming
- Reads chapter timestamps from the episodes table to render chapter markers
- Reads caption tracks from the captions table

### Webhook flow

Cloudflare Stream sends a webhook when a video is `ready_to_stream`. The
handler at `/api/webhooks/cloudflare-stream`:
1. Verifies the webhook signature (using `CLOUDFLARE_STREAM_WEBHOOK_SECRET`)
2. Looks up the episode by `provider_video_id`
3. Updates `episodes.provider_metadata`, `playback_url`, `thumbnail_url`,
   `preview_url`, `duration_seconds`, `aspect_ratio`

Signed URLs are deferred. Phase 1 uses public Stream IDs only.

---

## Environment variables

### `.env.example` (committed)

```bash
# Site
NEXT_PUBLIC_SITE_URL=https://punkflow.com

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Cloudflare Stream
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_STREAM_API_TOKEN=
CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN=
CLOUDFLARE_STREAM_WEBHOOK_SECRET=
```

### `.env.local` (gitignored)

Same keys, real values. Vercel project settings get the same set for
production.

---

## .gitignore essentials

Add to whatever `create-next-app` generates:

```
# Local env
.env*.local

# OS
.DS_Store

# Claude Code working files (per user preferences)
.claude/

# Build artifacts
*.tsbuildinfo
```

---

## REVISION_LOG.md template

Create at project root per your preferences:

```markdown
# PunkFlow web revision log

## 2026-05-10 — Initial scaffold
- Created Next.js project with App Router + TS + Tailwind
- Stack: pnpm, @supabase/ssr, @cloudflare/stream-react, shadcn/ui
- Repo created at github.com/punkflow/web
- Applied initial migration: supabase/migrations/0001_video_schema.sql
- Decisions captured in Latent Mind thought "PunkFlow Phase 1 schema
  design complete" (2026-05-10)
```

Update this after each meaningful session per your Claude Code rules.

---

## Phase 1 buildout order

Each step is small enough to be one focused session.

1. Run the scaffold commands above and verify it builds
2. Place `0001_video_schema.sql` at `supabase/migrations/` and apply via
   Supabase MCP or Supabase Studio
3. Generate TS types into `lib/supabase/types.ts`
4. Build `EpisodePlayer` end-to-end with one test episode
   (upload a test video to Stream, insert the row, render the page)
5. Build `/[channel]/[episode]` (episode detail page) with all metadata
   sections (player, metadata, transcript, credits, copublishers, tools)
6. Build `/[channel]` (channel landing)
7. Build `/` (studio landing)
8. Build `/about` and `/manifesto`
9. Add RSS feeds (`/api/rss`, `/api/rss/[channel]`)
10. Add `sitemap.ts`, `robots.ts`, and SEO helpers
11. Polish print stylesheet (`styles/print.css`)
12. Deploy to Vercel, point `punkflow.com` DNS

After step 12, run the next wishlist sweep against the live site.
