-- ============================================================
-- PunkFlow video infrastructure schema
-- Phase 1 migration v3: studios, channels, series, episodes,
-- collaboration, production attribution, supporting metadata
-- Mirrors com.punkflow.video.* AT Protocol Lexicons
-- ============================================================
--
-- Publishing model:
--   - Each STUDIO has its own AT Protocol DID. Studio-level records
--     (manifesto, about, channel index) are written to the studio's repo.
--   - Each CHANNEL has its own AT Protocol DID. Episode, series, and
--     playlist records for that channel are written to the channel's repo.
--   - EPISODES have one canonical channel (episodes.channel_id) plus an
--     optional set of co-publishers (episode_copublishers). The canonical
--     channel's repo holds the source-of-truth record; co-publishers write
--     reference records to their own repos.
--   - SERIES are usually channel-scoped but can be studio-scoped for
--     cross-channel anthologies (series.channel_id nullable; studio_id
--     always required).
--
-- Phase 1 ships with one studio (PunkFlow) and three channels
-- (Child Aurum, Simone Pixel, OddTake), each getting its own DID as
-- the per-channel Bluesky accounts come online.
--
-- v3 wishlist additions:
--   - Series-spanning-channel support (nullable channel_id on series)
--   - Production tools attribution (episode_production_tools)
--   - N-channel and cross-platform co-publishing (episode_copublishers)
--
-- File: 0001_video_schema.sql
-- Target location: /Users/jason/Documents/punkflow/web/supabase/migrations/
-- ============================================================


-- ============================================================
-- Enums
-- ============================================================

create type video_provider as enum (
  'cloudflare_stream',
  'mux',
  'self_hosted',
  'external'
);

create type visibility as enum (
  'public',
  'unlisted',
  'private',
  'scheduled'
);

create type access_model as enum (
  'free',
  'tip_supported',
  'paid',
  'patron_tier',
  'rental',
  'subscription'
);

create type canon_status as enum (
  'canon',
  'non_canon',
  'side_story',
  'alternate',
  'draft',
  'pilot',
  'behind_scenes',
  'restoration',
  'directors_cut'
);

create type age_restriction as enum (
  'none',
  'mild',
  'teen',
  'mature'
);


-- ============================================================
-- Studios
-- ============================================================
-- Top-level creative entities. PunkFlow is the only row in Phase 1.
-- Studio identity is first-class on AT Protocol: each studio has its
-- own DID and publishes studio-level records (manifesto, channel index,
-- values statement, cross-channel announcements).

create table studios (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  tagline text,
  description text,
  manifesto_url text,
  values_statement text,

  banner_url text,
  avatar_url text,
  accent_color text,

  -- AT Protocol identity (studio-level DID + handle)
  at_did text unique,                                   -- e.g., did:plc:xxxxxxxxxxxx
  at_handle text unique,                                -- e.g., "punkflow.com"
  at_handle_verified boolean not null default false,    -- DNS-pinned vs .bsky.social fallback

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ============================================================
-- Channels
-- ============================================================
-- Sibling brands under a studio. Each channel has its own DID and its
-- own follower graph. Episode records publish to the channel's repo.

create table channels (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references studios(id) on delete restrict,
  slug text not null unique,
  name text not null,
  tagline text,
  description text,

  banner_url text,
  avatar_url text,
  accent_color text,

  -- AT Protocol identity (per-channel DID + handle)
  at_did text unique,
  at_handle text unique,
  at_handle_verified boolean not null default false,

  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on channels (studio_id);


-- ============================================================
-- Series
-- ============================================================
-- Usually channel-scoped (channel_id set), occasionally studio-scoped
-- for cross-channel anthologies (channel_id null, studio_id required).
--
-- App-level invariant: when channel_id is set, the channel's studio_id
-- must equal series.studio_id. Enforced at the application layer;
-- promote to a trigger if this becomes a frequent source of bugs.

create table series (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references studios(id) on delete restrict,
  channel_id uuid references channels(id) on delete cascade,  -- nullable: null = studio-level
  slug text not null,
  name text not null,
  description text,
  poster_url text,

  at_uri text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Partial unique indexes: slug uniqueness scoped to channel when set,
-- otherwise to studio (anthologies).
create unique index series_channel_slug_unique
  on series (channel_id, slug)
  where channel_id is not null;

create unique index series_studio_slug_unique
  on series (studio_id, slug)
  where channel_id is null;

create index on series (studio_id);
create index on series (channel_id) where channel_id is not null;


-- ============================================================
-- Episodes
-- ============================================================
-- episodes.channel_id is the CANONICAL owner channel. Episodes can also
-- appear in other channels via episode_copublishers below.

create table episodes (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references channels(id) on delete restrict,
  series_id uuid references series(id) on delete set null,
  series_index int,
  season int,

  slug text not null,
  title text not null,
  description text,
  language text not null default 'en',

  -- Video provider abstraction (Cloudflare Stream for Phase 1).
  -- provider_metadata for cloudflare_stream typically contains:
  --   { "uid": "abc123",
  --     "ready_to_stream": true,
  --     "uploaded_at": "...",
  --     "input_size_bytes": 12345,
  --     "thumbnail_timestamp_pct": 0.1 }
  video_provider video_provider not null,
  provider_video_id text not null,
  provider_metadata jsonb not null default '{}'::jsonb,

  -- Cached playback URLs (refreshed from provider on demand)
  playback_url text,
  thumbnail_url text,
  preview_url text,

  duration_seconds int,
  aspect_ratio text,

  category text,

  -- AI permissions (creator-protective defaults).
  -- Indexing and embedding allowed for discovery; everything else denied.
  ai_search_indexing    boolean not null default true,
  ai_semantic_embedding boolean not null default true,
  ai_summarization      boolean not null default false,
  ai_training           boolean not null default false,
  ai_generation         boolean not null default false,
  ai_excerpting         boolean not null default false,

  visibility       visibility      not null default 'private',
  access_model     access_model    not null default 'free',
  age_restriction  age_restriction not null default 'none',
  license          text,
  canon_status     canon_status    not null default 'draft',

  -- Version chain (director's cuts, restorations, replacements)
  replaces uuid references episodes(id) on delete set null,
  replacement_reason text,

  scheduled_for timestamptz,
  published_at timestamptz,

  -- Set when this episode has been published to AT Protocol
  at_uri text unique,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (channel_id, slug)
);

create index on episodes (channel_id, visibility, published_at desc);
create index on episodes (series_id, series_index);
create index on episodes (video_provider, provider_video_id);

-- Full-text search on title + description
alter table episodes add column search_vector tsvector
  generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B')
  ) stored;
create index on episodes using gin (search_vector);


-- ============================================================
-- Episode co-publishers
-- ============================================================
-- Additional channels (internal) or external AT Protocol identities that
-- co-publish an episode. The canonical channel is NOT a row here; it's
-- just episodes.channel_id. This table holds the partners only.
--
-- Internal co-publisher: set channel_id.
-- External co-publisher: set external_at_did (or at minimum
-- external_display_name) plus optional handle/avatar/profile_url for
-- display when references can't be dereferenced live.
--
-- reference_at_uri captures the URI of the partner's reference record
-- once it's been written to their repo (for sync auditing).

create table episode_copublishers (
  episode_id uuid not null references episodes(id) on delete cascade,
  ordinal int not null,

  channel_id uuid references channels(id) on delete cascade,

  external_at_did text,
  external_at_handle text,
  external_display_name text,
  external_avatar_url text,
  external_profile_url text,

  reference_at_uri text unique,

  primary key (episode_id, ordinal),
  check (
    channel_id is not null
    or external_at_did is not null
    or external_display_name is not null
  )
);

create index on episode_copublishers (channel_id) where channel_id is not null;
create index on episode_copublishers (external_at_did) where external_at_did is not null;


-- ============================================================
-- Episode production tools
-- ============================================================
-- Structural transparency about how an episode was made. Different from
-- ai_permissions (which is about downstream AI use of the episode);
-- this declares the upstream tools and services used in production.
-- Examples: Unreal Engine 5 (rendering), MetaHuman (character),
-- ElevenLabs (voice), Kling 3.0 Pro (AI reference), DaVinci Resolve (edit).

create table episode_production_tools (
  id uuid primary key default gen_random_uuid(),
  episode_id uuid not null references episodes(id) on delete cascade,
  tool_name text not null,                             -- "Unreal Engine 5"
  tool_role text,                                      -- "rendering", "voice", "reference", "edit"
  tool_version text,
  url text,
  ordinal int not null
);

create index on episode_production_tools (episode_id, ordinal);
create index on episode_production_tools (tool_name);


-- ============================================================
-- Chapters
-- ============================================================

create table chapters (
  id uuid primary key default gen_random_uuid(),
  episode_id uuid not null references episodes(id) on delete cascade,
  start_seconds numeric not null,
  title text not null,
  ordinal int not null,

  unique (episode_id, ordinal)
);
create index on chapters (episode_id, start_seconds);


-- ============================================================
-- Captions
-- ============================================================

create table captions (
  id uuid primary key default gen_random_uuid(),
  episode_id uuid not null references episodes(id) on delete cascade,
  language text not null,                              -- BCP-47, e.g., "en", "es-MX"
  label text,                                          -- e.g., "English (auto-generated)"
  format text not null default 'vtt',                  -- 'vtt' | 'srt'
  url text not null,
  is_auto_generated boolean not null default false,

  unique (episode_id, language)
);


-- ============================================================
-- Transcript segments
-- ============================================================

create table transcript_segments (
  id uuid primary key default gen_random_uuid(),
  episode_id uuid not null references episodes(id) on delete cascade,
  start_seconds numeric not null,
  duration_seconds numeric not null,
  text text not null,
  speaker text,
  ordinal int not null,

  unique (episode_id, ordinal)
);
create index on transcript_segments (episode_id, start_seconds);
create index on transcript_segments using gin (to_tsvector('english', text));


-- ============================================================
-- Credits
-- ============================================================
-- Per-episode credits (director, voice actor, animator, etc.).
-- Distinct from co-publishers: credits attribute creative roles,
-- co-publishers represent joint publication.

create table credits (
  id uuid primary key default gen_random_uuid(),
  episode_id uuid not null references episodes(id) on delete cascade,
  role text not null,                                  -- "Director", "Voice (Simone)", etc.
  at_did text,                                         -- AT Protocol DID if on network
  name text,                                           -- otherwise plain name
  url text,                                            -- optional external link
  ordinal int not null,

  check (at_did is not null or name is not null)
);
create index on credits (episode_id, ordinal);


-- ============================================================
-- Tags
-- ============================================================

create table tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  kind text not null default 'topic'                   -- 'topic' | 'aesthetic'
);

create table episode_tags (
  episode_id uuid not null references episodes(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  primary key (episode_id, tag_id)
);


-- ============================================================
-- Content warnings
-- ============================================================

create table episode_content_warnings (
  episode_id uuid not null references episodes(id) on delete cascade,
  warning text not null,                               -- controlled vocab, validated app-side
  primary key (episode_id, warning)
);


-- ============================================================
-- Sponsor disclosures (FTC-compliant)
-- ============================================================

create table sponsor_disclosures (
  id uuid primary key default gen_random_uuid(),
  episode_id uuid not null references episodes(id) on delete cascade,
  sponsor_name text not null,
  disclosure_type text not null,                       -- 'paid_promotion' | 'free_product' | 'affiliate' | 'partnership'
  url text,
  ordinal int not null
);


-- ============================================================
-- updated_at trigger
-- ============================================================

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger studios_updated_at  before update on studios  for each row execute function set_updated_at();
create trigger channels_updated_at before update on channels for each row execute function set_updated_at();
create trigger series_updated_at   before update on series   for each row execute function set_updated_at();
create trigger episodes_updated_at before update on episodes for each row execute function set_updated_at();


-- ============================================================
-- Row Level Security (Phase 1 basics)
-- ============================================================
-- Phase 1 strategy:
--   - Top-level access control on studios, channels, episodes.
--   - Supporting tables (chapters, captions, transcripts, credits,
--     copublishers, production tools, tags, etc.) are publicly readable;
--     they're keyed by episode_id and not meaningfully queryable without
--     it (UUIDs aren't enumerable).
--   - Write policies will gate on a punkflow_admin role; deferring
--     until auth is wired.

alter table studios                  enable row level security;
alter table channels                 enable row level security;
alter table series                   enable row level security;
alter table episodes                 enable row level security;
alter table episode_copublishers     enable row level security;
alter table episode_production_tools enable row level security;
alter table chapters                 enable row level security;
alter table captions                 enable row level security;
alter table transcript_segments      enable row level security;
alter table credits                  enable row level security;
alter table tags                     enable row level security;
alter table episode_tags             enable row level security;
alter table episode_content_warnings enable row level security;
alter table sponsor_disclosures      enable row level security;

create policy "public_read_studios"   on studios   for select using (true);
create policy "public_read_channels"  on channels  for select using (is_published = true);
create policy "public_read_series"    on series    for select using (true);
create policy "public_read_tags"      on tags      for select using (true);

create policy "public_read_published_episodes" on episodes
  for select using (visibility = 'public' and published_at is not null);

create policy "public_read_copublishers"      on episode_copublishers     for select using (true);
create policy "public_read_production_tools"  on episode_production_tools for select using (true);
create policy "public_read_chapters"          on chapters                 for select using (true);
create policy "public_read_captions"          on captions                 for select using (true);
create policy "public_read_transcripts"       on transcript_segments      for select using (true);
create policy "public_read_credits"           on credits                  for select using (true);
create policy "public_read_episode_tags"      on episode_tags             for select using (true);
create policy "public_read_warnings"          on episode_content_warnings for select using (true);
create policy "public_read_sponsors"          on sponsor_disclosures      for select using (true);


-- ============================================================
-- Phase 1 seed data
-- ============================================================
-- PunkFlow studio uses the existing @punkflow.com DID.
-- at_did is left null here and should be populated once DID resolution
-- is wired up. The handle is DNS-verified.

insert into studios (slug, name, tagline, at_handle, at_handle_verified)
values (
  'punkflow',
  'PunkFlow',
  'Solo studio building Child Aurum, Simone Pixel, and OddTake under the Punk Obscura aesthetic.',
  'punkflow.com',
  true
);

-- Channels are inserted as their Bluesky accounts and DIDs come online.
-- Template for adding a channel:
--
-- insert into channels (studio_id, slug, name, at_handle, at_handle_verified, is_published)
-- values (
--   (select id from studios where slug = 'punkflow'),
--   'simone-pixel',
--   'Simone Pixel',
--   'simonepixel.com',   -- DNS-verified, or 'simonepixel.bsky.social' for fallback
--   true,
--   false                 -- flip to true once the channel page is ready
-- );
