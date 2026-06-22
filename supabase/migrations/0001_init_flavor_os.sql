-- LISSO Flavor OS — initial schema.
--
-- The app accesses data only through the repository interfaces
-- (src/repositories/types.ts). This schema backs the Supabase implementation
-- (src/repositories/supabase.ts).
--
-- Design: each table stores the full domain object in a `data jsonb` column
-- (1:1 fidelity with the TypeScript types) plus a few extracted scalar columns
-- (id / foreign keys / ownership / share id) for indexing and scoping. IDs are
-- application-generated strings (see src/lib/ids.ts), so `id` is text, not uuid.

-- ─────────────────────────── Global master data ───────────────────────────
-- Shared, read-only for normal users; written by curators/admin (or the seed).

create table if not exists public.brands (
  id          text primary key,
  data        jsonb not null,
  created_at  timestamptz not null default now()
);

create table if not exists public.flavor_master (
  id          text primary key,
  brand_id    text references public.brands (id),
  data        jsonb not null,
  created_at  timestamptz not null default now()
);
create index if not exists flavor_master_brand_id_idx on public.flavor_master (brand_id);

create table if not exists public.taste_words (
  id          text primary key,
  data        jsonb not null
);

create table if not exists public.synergy_rules (
  id          text primary key,
  data        jsonb not null
);

create table if not exists public.heat_templates (
  id          text primary key,
  data        jsonb not null
);

create table if not exists public.troubleshooting_rules (
  id          text primary key,
  data        jsonb not null
);

create table if not exists public.user_profiles (
  id          text primary key,
  data        jsonb not null,
  created_at  timestamptz not null default now()
);

-- ─────────────────────────── User-private data ────────────────────────────
-- Separated by user_id; one user can never read another's private rows.

create table if not exists public.user_inventory_items (
  id          text primary key,
  user_id     text not null,
  data        jsonb not null,
  created_at  timestamptz not null default now()
);
create index if not exists user_inventory_items_user_id_idx on public.user_inventory_items (user_id);

create table if not exists public.recipes (
  id          text primary key,
  user_id     text not null,
  share_id    text unique,
  data        jsonb not null,
  created_at  timestamptz not null default now()
);
create index if not exists recipes_user_id_idx on public.recipes (user_id);
create index if not exists recipes_share_id_idx on public.recipes (share_id);

create table if not exists public.master_submissions (
  id          text primary key,
  user_id     text not null,
  data        jsonb not null,
  created_at  timestamptz not null default now()
);
create index if not exists master_submissions_user_id_idx on public.master_submissions (user_id);

create table if not exists public.photo_import_sessions (
  id          text primary key,
  user_id     text not null,
  data        jsonb not null,
  created_at  timestamptz not null default now()
);
create index if not exists photo_import_sessions_user_id_idx on public.photo_import_sessions (user_id);

create table if not exists public.photo_detected_items (
  id          text primary key,
  session_id  text not null references public.photo_import_sessions (id) on delete cascade,
  data        jsonb not null,
  created_at  timestamptz not null default now()
);
create index if not exists photo_detected_items_session_id_idx on public.photo_detected_items (session_id);

-- ───────────────────────────── Row Level Security ─────────────────────────
-- Enabled on every table. The server currently connects with the service-role
-- key (which bypasses RLS); user scoping is also enforced in the repository
-- queries. These policies make the schema correct for the day real Supabase
-- Auth replaces the mock user (src/lib/auth.ts):
--   • master tables  → public read (anon + authenticated)
--   • user tables    → owner-only, keyed on auth.uid()::text = user_id
--   • recipes        → owner, plus public/unlisted rows are world-readable
-- Writes to master tables and cross-user writes go through the service role.

alter table public.brands                enable row level security;
alter table public.flavor_master         enable row level security;
alter table public.taste_words           enable row level security;
alter table public.synergy_rules         enable row level security;
alter table public.heat_templates        enable row level security;
alter table public.troubleshooting_rules enable row level security;
alter table public.user_profiles         enable row level security;
alter table public.user_inventory_items  enable row level security;
alter table public.recipes               enable row level security;
alter table public.master_submissions    enable row level security;
alter table public.photo_import_sessions enable row level security;
alter table public.photo_detected_items  enable row level security;

-- Public read on master tables.
create policy "master read: brands"          on public.brands                for select using (true);
create policy "master read: flavor_master"   on public.flavor_master         for select using (true);
create policy "master read: taste_words"     on public.taste_words           for select using (true);
create policy "master read: synergy_rules"   on public.synergy_rules         for select using (true);
create policy "master read: heat_templates"  on public.heat_templates        for select using (true);
create policy "master read: troubleshooting" on public.troubleshooting_rules for select using (true);

-- User profiles: readable by all (public handles), self-writable.
create policy "profiles read"  on public.user_profiles for select using (true);
create policy "profiles write" on public.user_profiles for all
  using (auth.uid()::text = id) with check (auth.uid()::text = id);

-- Inventory: owner-only.
create policy "inventory owner" on public.user_inventory_items for all
  using (auth.uid()::text = user_id) with check (auth.uid()::text = user_id);

-- Recipes: owner full access; public/unlisted recipes are world-readable.
create policy "recipes owner" on public.recipes for all
  using (auth.uid()::text = user_id) with check (auth.uid()::text = user_id);
create policy "recipes public read" on public.recipes for select
  using ((data ->> 'visibility') in ('public', 'unlisted'));

-- Master submissions: owner-only (curators review via the service role).
create policy "submissions owner" on public.master_submissions for all
  using (auth.uid()::text = user_id) with check (auth.uid()::text = user_id);

-- Photo import: owner-only; detected items inherit via their session.
create policy "photo sessions owner" on public.photo_import_sessions for all
  using (auth.uid()::text = user_id) with check (auth.uid()::text = user_id);
create policy "photo items owner" on public.photo_detected_items for all
  using (
    exists (
      select 1 from public.photo_import_sessions s
      where s.id = session_id and s.user_id = auth.uid()::text
    )
  )
  with check (
    exists (
      select 1 from public.photo_import_sessions s
      where s.id = session_id and s.user_id = auth.uid()::text
    )
  );
