/**
 * Seed a Supabase project from src/data/seed (the same data the JSON store uses).
 *
 * Prerequisites:
 *   1. Apply supabase/migrations/0001_init_flavor_os.sql to the project.
 *   2. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (e.g. in .env.local).
 *
 * Run:  npm run seed:supabase
 *
 * Idempotent: rows are upserted by id, so re-running refreshes master data.
 * Recipes / submissions / photo sessions start empty (created by users).
 */
import { createClient } from "@supabase/supabase-js";
import { buildSeedDatabase } from "../src/data/seed";

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_KEY;

if (!url || !key) {
  console.error(
    "Missing env. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (e.g. in .env.local).",
  );
  process.exit(1);
}

const db = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

type Row = { id: string; data: unknown } & Record<string, unknown>;

function rows(
  items: Array<{ id: string } & Record<string, unknown>>,
  extra: (o: Record<string, unknown>) => Record<string, unknown> = () => ({}),
): Row[] {
  return items.map((o) => ({ id: o.id, data: o, ...extra(o) }));
}

async function upsert(table: string, data: Row[]) {
  if (data.length === 0) {
    console.log(`· ${table}: nothing to seed`);
    return;
  }
  const { error } = await db.from(table).upsert(data, { onConflict: "id" });
  if (error) throw new Error(`${table}: ${error.message}`);
  console.log(`✓ ${table}: ${data.length}`);
}

async function main() {
  const seed = buildSeedDatabase();

  // Master data first (flavor_master references brands).
  await upsert("brands", rows(seed.brands));
  await upsert(
    "flavor_master",
    rows(seed.flavors, (f) => ({ brand_id: f.brandId ?? null })),
  );
  await upsert("taste_words", rows(seed.tasteWords));
  await upsert("synergy_rules", rows(seed.synergyRules));
  await upsert("heat_templates", rows(seed.heatTemplates));
  await upsert("troubleshooting_rules", rows(seed.troubleshootingRules));

  // Users + demo inventory.
  await upsert("user_profiles", rows(seed.users));
  await upsert(
    "user_inventory_items",
    rows(seed.inventory, (i) => ({ user_id: i.userId })),
  );

  console.log("\nSupabase seed complete.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
