# PunkFlow web

The website for [PunkFlow](https://punkflow.com), a solo studio building
*Child Aurum*, *Simone Pixel*, and *OddTake* under the Punk Obscura aesthetic.

This repo is the canonical home for the punkflow.com site. It's also the
first production deployment of the
[`com.punkflow.video.*` AT Protocol Lexicons](https://github.com/punkflow/atproto-lexicons).

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Supabase (Postgres) |
| Video host | Cloudflare Stream |
| Identity | AT Protocol (per-channel DIDs) |
| Hosting | Vercel |
| Package manager | pnpm |

## Architecture in one paragraph

PunkFlow is a single studio with several channels (Child Aurum, Simone Pixel,
OddTake). The studio and each channel have their own AT Protocol DID and their
own audience graph. Episodes are uploaded to Cloudflare Stream and indexed in
Supabase; their canonical metadata records are published to the owning
channel's AT Protocol repo using the `com.punkflow.video.episode` Lexicon.
Other channels can co-publish via lightweight reference records. All AI use of
episode content is governed by per-episode permissions encoded in the data
model itself, not platform policy.

## Local development

```bash
# Install deps
pnpm install

# Run the dev server
pnpm dev

# Apply schema changes via Supabase CLI or MCP, then regenerate types:
pnpm dlx supabase gen types typescript --project-id <project-id> > lib/supabase/types.ts
```

Environment variables: copy `.env.example` to `.env.local` and fill in.

## Layout

- `app/` — App Router routes
  - `app/(site)/` — Public site routes
  - `app/api/` — Route handlers (RSS feeds, webhooks)
- `lib/` — Reusable utilities
  - `lib/supabase/` — Three Supabase clients (server, browser, service-role)
  - `lib/stream/` — Cloudflare Stream API + player config
  - `lib/atproto/` — AT Protocol client (stubbed; integration is Phase 2+)
  - `lib/routing.ts`, `lib/seo.ts`, `lib/rss.ts` — Site-level helpers
- `supabase/migrations/` — SQL migrations (applied via Supabase MCP or CLI)
- `styles/` — Tailwind globals + print stylesheet
- `REVISION_LOG.md` — Session-level change log

## Related repos

- [`punkflow/atproto-lexicons`](https://github.com/punkflow/atproto-lexicons)
  — AT Protocol Lexicons for the `com.punkflow.video.*` namespace.

## License

TBD. The atproto-lexicons repo is MIT-licensed; the site code license is
under consideration.
