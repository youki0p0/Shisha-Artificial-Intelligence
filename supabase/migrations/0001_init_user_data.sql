-- ShishaOS — user data schema (Supabase Postgres).
--
-- Master data (brands, flavors, taste words, …) stays in the deterministic seed.
-- This migration persists PER-USER data with Row Level Security so that, once a
-- user logs in via Supabase Auth, their inventory / recipes / submissions are
-- private to them. Run this in your project's SQL editor (or `supabase db push`).
--
-- Pattern: each row carries the queryable keys as columns + the full domain
-- object as `data jsonb`, so the app repository is a thin (de)serializer and the
-- domain types in src/domain/types.ts remain the source of truth.

-- ---------------------------------------------------------------------------
-- profiles: 1:1 with auth.users
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'User',
  handle       text unique,
  role         text not null default 'user' check (role in ('user', 'curator', 'admin')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Staff check used by master-data review policies.
create or replace function public.is_staff()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('curator', 'admin')
  );
$$;

-- Auto-create a profile whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, handle)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    null
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- per-user tables (id is the app-generated string id; data holds the object)
-- ---------------------------------------------------------------------------
create table if not exists public.inventory (
  id               text primary key,
  user_id          uuid not null references auth.users (id) on delete cascade,
  flavor_master_id text,
  status           text,
  data             jsonb not null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table if not exists public.recipes (
  id         text primary key,
  user_id    uuid not null references auth.users (id) on delete cascade,
  share_id   text unique,
  visibility text not null default 'private',
  data       jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.master_submissions (
  id          text primary key,
  user_id     uuid not null references auth.users (id) on delete cascade,
  status      text not null default 'pending',
  data        jsonb not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.photo_sessions (
  id         text primary key,
  user_id    uuid not null references auth.users (id) on delete cascade,
  status     text,
  data       jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.photo_detected_items (
  id         text primary key,
  user_id    uuid not null references auth.users (id) on delete cascade,
  session_id text not null references public.photo_sessions (id) on delete cascade,
  data       jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists inventory_user_idx on public.inventory (user_id);
create index if not exists recipes_user_idx on public.recipes (user_id);
create index if not exists photo_items_session_idx on public.photo_detected_items (session_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles             enable row level security;
alter table public.inventory            enable row level security;
alter table public.recipes              enable row level security;
alter table public.master_submissions   enable row level security;
alter table public.photo_sessions       enable row level security;
alter table public.photo_detected_items enable row level security;

-- profiles: a user reads/updates only their own; staff can read all.
create policy profiles_self_select on public.profiles
  for select using (id = auth.uid() or public.is_staff());
create policy profiles_self_update on public.profiles
  for update using (id = auth.uid());

-- Generic "owner only" CRUD for the per-user tables.
create policy inventory_owner on public.inventory
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- recipes: owner full access; anyone can read a public/unlisted recipe (sharing).
create policy recipes_owner on public.recipes
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy recipes_public_read on public.recipes
  for select using (visibility in ('public', 'unlisted'));

-- submissions: owner CRUD; staff can read + moderate all.
create policy submissions_owner on public.master_submissions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy submissions_staff on public.master_submissions
  for all using (public.is_staff()) with check (public.is_staff());

create policy photo_sessions_owner on public.photo_sessions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy photo_items_owner on public.photo_detected_items
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Grants
--
-- RLS controls *rows*, but roles still need table-level privileges. Some
-- projects don't auto-grant new public tables to anon/authenticated, so set
-- them explicitly. RLS keeps each user to their own rows regardless.
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on
  public.profiles,
  public.inventory,
  public.recipes,
  public.master_submissions,
  public.photo_sessions,
  public.photo_detected_items
to authenticated;

-- Logged-out viewers can read public/unlisted shared recipes (RLS-gated).
grant select on public.recipes to anon;

-- Auto-grant any future public tables too.
alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;
