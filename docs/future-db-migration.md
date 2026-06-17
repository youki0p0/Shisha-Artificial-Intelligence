# Future: migrating to Supabase / Postgres / Neon / Vercel Postgres

The whole app accesses data through the interfaces in
`src/repositories/types.ts`. The MVP implementation is the JSON store
(`jsonStore.ts` + `index.ts`). Migrating means writing **one new implementation**
of those interfaces — engines, services, server actions, and UI are unaffected.

## Step 1 — schema

Map the domain types to tables. Suggested Postgres tables (snake_case):

```
brands(id pk, name, aliases jsonb, country, notes, created_at, updated_at)
flavor_master(id pk, brand_id fk, name, display_name_ja, aliases jsonb,
              category jsonb, roles jsonb, tags jsonb, nicotine_level,
              aroma_strength, sweetness, sourness, cooling, bitterness, body,
              wetness, freshness, luxury, heaviness, aftertaste, structure,
              layer_affinity jsonb, heat_tolerance, beginner_friendly,
              solo_usability, description, notes, data_status, ...)
taste_words(...), synergy_rules(...), heat_templates(...), troubleshooting_rules(...)
user_profiles(id pk, display_name, handle, role, ...)
user_inventory_items(id pk, user_id fk, flavor_master_id fk null, custom_brand,
                     custom_name, amount_gram, status, purchase_url, memo,
                     source, confidence, ...)
recipes(id pk, user_id fk, title, concept, total_gram, items jsonb,
        layers jsonb, heat_management jsonb, flavor_timeline jsonb,
        troubleshooting jsonb, score, score_breakdown jsonb, tags jsonb,
        visibility, share_id unique, ...)
master_submissions(...), photo_import_sessions(...), photo_detected_items(...)
```

The taste-vector fields stay flat columns on `flavor_master` (so SQL can filter
on them); compound/array fields use `jsonb`.

## Step 2 — implement the repositories

```ts
// src/repositories/supabase.ts
import { createClient } from "@supabase/supabase-js";
import { Repositories } from "./types";

export function createSupabaseRepositories(): Repositories {
  const db = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);
  return {
    flavors: {
      list: async () => (await db.from("flavor_master").select("*")).data ?? [],
      getById: async (id) =>
        (await db.from("flavor_master").select("*").eq("id", id).single()).data ?? undefined,
      // ...implement the rest of FlavorRepository
    },
    // ...the other repositories
  };
}
```

Then switch the factory:

```ts
// src/repositories/index.ts
export function getRepositories(): Repositories {
  if (process.env.DB_DRIVER === "supabase") return createSupabaseRepositories();
  return repositories; // JSON store (default)
}
```

## Step 3 — multi-tenancy & auth

- Enforce `user_id` scoping in every user-private query.
- With Supabase, add **Row Level Security**: users read/write only their own
  rows in `user_inventory_items`, `recipes` (except `visibility != 'private'`),
  `master_submissions`, `photo_*`. Master tables are public-read, curator-write.
- Replace the mock `getCurrentUserId()` in `src/lib/auth.ts` with the real
  session lookup (Supabase Auth / Auth.js). Nothing else changes.

## Step 4 — data move

- Run `npm run seed` logic once against the new DB (insert the arrays from
  `src/data/seed`).
- Optionally import an existing `.data/db.json` with a small script.

## Notes

- Neon / Vercel Postgres: use `@vercel/postgres` or `drizzle-orm` /`prisma`
  instead of the Supabase client; the repository interface is identical.
- Add indexes on `flavor_master(brand_id)`, `user_inventory_items(user_id)`,
  `recipes(user_id)`, `recipes(share_id)`.
- The JSON store's serialized writes become real transactions — concurrency
  limitations of the MVP disappear.
