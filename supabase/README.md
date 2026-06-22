# Supabase setup — Flavor OS

The app defaults to the JSON-file store. Set `DB_DRIVER=supabase` to use
Supabase Postgres instead. Engines, services, server actions, and UI are
unchanged — only the repository implementation differs
(`src/repositories/supabase.ts`).

## 1. Apply the schema

Run `migrations/0001_init_flavor_os.sql` against your project, either via the
**Supabase Dashboard → SQL Editor** (paste & run), or the CLI:

```bash
supabase link --project-ref <your-ref>
supabase db push      # applies supabase/migrations/*
```

This creates the tables (each is `id` + extracted scope columns + a `data`
jsonb holding the full domain object), indexes, and Row Level Security policies.

## 2. Configure env

In `.env.local` (and your Vercel project settings):

```
DB_DRIVER=supabase
SUPABASE_URL=https://<your-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

Find the keys in **Dashboard → Project Settings → API**. The service-role key
is secret — it is used only server-side and bypasses RLS.

## 3. Seed data

```bash
npm run seed:supabase
```

Upserts the curated master data (brands, flavors, taste words, synergy, heat,
troubleshooting) and the demo users + inventory from `src/data/seed`. Idempotent.

## 4. Run

```bash
npm run dev
```

## Notes

- **RLS & auth.** The server connects with the service-role key (bypasses RLS),
  and user scoping is enforced in the repository queries — the same model the
  JSON store used. The RLS policies in the migration become active protection
  once real Supabase Auth replaces the mock user in `src/lib/auth.ts`
  (`getCurrentUserId`). Master tables are public-read; user tables are
  owner-only; public/unlisted recipes are world-readable.
- **Data shape.** Domain objects are stored whole in `data jsonb`, so the
  schema tracks the TypeScript types with no per-field migrations. Taste-vector
  columns can be promoted to flat columns later if SQL-side filtering is needed.
