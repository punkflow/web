# PunkFlow web revision log

Tracking meaningful changes to the punkflow.com codebase across sessions.

---

## 2026-05-10 — Initial scaffold

**Decisions:**
- Stack: Next.js App Router + TypeScript + Tailwind + shadcn/ui
- Package manager: pnpm
- DB: Supabase (project `punkflow-studio`, us-west-2)
- Video host: Cloudflare Stream
- AT Protocol: `@atproto/api` dependency (integration deferred to Phase 2+)
- URL convention: `/[channel]` with reserved-word list
- Repo: `github.com/punkflow/web` (sibling to `punkflow/atproto-lexicons`)
- Hosting: Vercel

**What now exists:**
- Project scaffolded via `pnpm create next-app@latest web`
- Custom code dropped into the tree: `lib/`, `app/api/`, `app/sitemap.ts`,
  `app/robots.ts`, `styles/print.css`, `.env.example`
- Migration applied: `supabase/migrations/0001_video_schema.sql`
- TypeScript types generated into `lib/supabase/types.ts`
- shadcn/ui initialized with primitives: button, card, dropdown-menu, sheet, separator
- Reserved channel slugs and validation helpers in `lib/routing.ts`
- RSS feeds wired (`/api/rss`, `/api/rss/[channel]`)
- Sitemap and robots configured with AI-training crawler opt-outs
- Cloudflare Stream webhook handler at `/api/webhooks/cloudflare-stream`

**Captured in Latent Mind:**
- Thought "PunkFlow Phase 1 schema design complete" (2026-05-10)

**Still pending in Phase 1:**
- Page components (studio landing, channel landing, episode detail, series, about, manifesto)
- Episode-specific components (player, metadata, transcript, credits, copublishers, production tools)
- First episode end-to-end test (upload to Stream + insert row + render page)
- Vercel deployment + DNS pointing for punkflow.com
- Phase 1 wishlist sweep against the live site

---

## 2026-05-11 — Scaffold executed; first green build

**What changed:**
- Ran `pnpm create next-app@latest web` (Next 16.2.6, React 19.2.4, Tailwind v4) with `--turbopack`
- Extracted `punkflow-web-additions.tar.gz` into `web/` (`--strip-components=1`)
- Installed runtime deps: `@supabase/supabase-js`, `@supabase/ssr`, `@cloudflare/stream-react`, `@atproto/api`, `lucide-react`
- Initialized shadcn/ui (template `next`, preset `base-nova`, base color `neutral`, Tailwind v4 autodetected)
- Added primitives: button, card, dropdown-menu, sheet, separator
- Merged `.gitignore-additions` into `.gitignore` (deleted the additions file)
- `pnpm build` passes: type check + static gen for `/`, `/_not-found`, `/robots.txt`; dynamic routes for `/api/rss`, `/api/rss/[channel]`, `/api/webhooks/cloudflare-stream`, `/sitemap.xml`

**Fixes applied to tarball code to make build green:**
- `app/api/webhooks/cloudflare-stream/route.ts`: cast `video.meta` to `Json` when writing to `provider_metadata` (jsonb). `Record<string, unknown>` doesn't subtype Supabase's recursive `Json`.
- `lib/seo.ts`: changed `publishedTime` → `releaseDate` in the `video.episode` OG block. `publishedTime` is for `OpenGraphArticle` only; `releaseDate` is the equivalent for `OpenGraphVideoEpisode`.

**Environment gotchas worth remembering:**
- pnpm 11 uses `allowBuilds:` (name→bool map) in `pnpm-workspace.yaml`, not the older `onlyBuiltDependencies` array. `create-next-app` pre-writes the file with `sharp` and `unrs-resolver` ignored — flip both to `true`. `msw` arrived as a transitive of base-ui or shadcn registry tooling; set to `false` (we don't need its dev service worker).
- `shadcn init -d` does NOT write `lib/utils.ts`. Even `shadcn add <primitive>` skipped it. Wrote it manually with the standard `cn()` helper.
- `lucide-react` is now on `1.x` (jumped from `0.x` series in 2025).

**Notes:**
- `.env.local` still not created — env values (`NEXT_PUBLIC_SUPABASE_URL`, anon key, service role, Cloudflare Stream) deferred until the first end-to-end episode test.
- GitHub repo `punkflow/web` not yet created.
- Default Next welcome page still rendering at `/` — first real page is the studio landing in SCAFFOLD.md's Phase 1 order.

---

## Template for future entries

```
## YYYY-MM-DD — Short title

**What changed:**
- Bullet list of meaningful changes

**Why:**
- Brief reasoning, especially for non-obvious choices

**Notes:**
- State of the project after this change, things to watch out for next session
```
