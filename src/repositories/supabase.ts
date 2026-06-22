/**
 * Supabase-backed implementation of the repository interfaces.
 *
 * Each table stores the full domain object in a `data jsonb` column plus a few
 * extracted scalar columns (foreign keys / ownership / share id) for indexing
 * and scoping — see supabase/migrations/0001_init_flavor_os.sql. This keeps the
 * mapping thin and 1:1 with the domain types.
 *
 * Selected via DB_DRIVER=supabase (see ./index.ts). Engines, services, server
 * actions, and UI are unaffected — they only see the Repositories interface.
 */
import { normalizeText } from "@/lib/utils";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  Brand,
  FlavorMaster,
  HeatTemplate,
  MasterSubmission,
  PhotoDetectedItem,
  PhotoImportSession,
  Recipe,
  SynergyRule,
  TasteWord,
  TroubleshootingRule,
  UserInventoryItem,
  UserProfile,
} from "@/domain/types";
import { Repositories } from "./types";

const TABLE = {
  brands: "brands",
  flavors: "flavor_master",
  tasteWords: "taste_words",
  synergy: "synergy_rules",
  heat: "heat_templates",
  troubleshooting: "troubleshooting_rules",
  users: "user_profiles",
  inventory: "user_inventory_items",
  recipes: "recipes",
  submissions: "master_submissions",
  photoSessions: "photo_import_sessions",
  photoItems: "photo_detected_items",
} as const;

type AnyRecord = Record<string, unknown>;

function textHit(haystacks: string[], q: string): boolean {
  const nq = normalizeText(q);
  if (!nq) return true;
  return haystacks.some((h) => normalizeText(h).includes(nq));
}

/** Build the table row (extracted columns + the full object in `data`). */
function rowFor(table: string, obj: AnyRecord): AnyRecord {
  const row: AnyRecord = { id: obj.id, data: obj };
  switch (table) {
    case TABLE.flavors:
      row.brand_id = obj.brandId ?? null;
      break;
    case TABLE.inventory:
    case TABLE.submissions:
    case TABLE.photoSessions:
      row.user_id = obj.userId;
      break;
    case TABLE.recipes:
      row.user_id = obj.userId;
      row.share_id = obj.shareId ?? null;
      break;
    case TABLE.photoItems:
      row.session_id = obj.sessionId;
      break;
  }
  return row;
}

async function selectAll<T>(table: string): Promise<T[]> {
  const { data, error } = await getSupabaseAdmin().from(table).select("data");
  if (error) throw new Error(`${table}.list: ${error.message}`);
  return (data ?? []).map((r) => (r as { data: T }).data);
}

async function selectById<T>(table: string, id: string): Promise<T | undefined> {
  const { data, error } = await getSupabaseAdmin()
    .from(table)
    .select("data")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`${table}.getById: ${error.message}`);
  return data ? (data as { data: T }).data : undefined;
}

async function selectWhere<T>(
  table: string,
  column: string,
  value: string,
): Promise<T[]> {
  const { data, error } = await getSupabaseAdmin()
    .from(table)
    .select("data")
    .eq(column, value);
  if (error) throw new Error(`${table}.${column}: ${error.message}`);
  return (data ?? []).map((r) => (r as { data: T }).data);
}

async function insert<T extends AnyRecord>(table: string, obj: T): Promise<T> {
  const { error } = await getSupabaseAdmin().from(table).insert(rowFor(table, obj));
  if (error) throw new Error(`${table}.create: ${error.message}`);
  return obj;
}

/** Read-modify-write the `data` jsonb, stamping updatedAt like the JSON store. */
async function patch<T extends AnyRecord>(
  table: string,
  id: string,
  changes: Partial<T>,
): Promise<T | undefined> {
  const current = await selectById<T>(table, id);
  if (!current) return undefined;
  const merged = {
    ...current,
    ...changes,
    updatedAt: new Date().toISOString(),
  } as T;
  const { error } = await getSupabaseAdmin()
    .from(table)
    .update(rowFor(table, merged))
    .eq("id", id);
  if (error) throw new Error(`${table}.update: ${error.message}`);
  return merged;
}

export function createSupabaseRepositories(): Repositories {
  return {
    brands: {
      list: () => selectAll<Brand>(TABLE.brands),
      getById: (id) => selectById<Brand>(TABLE.brands, id),
      async search(query) {
        const brands = await selectAll<Brand>(TABLE.brands);
        return brands.filter((b) => textHit([b.name, ...b.aliases], query));
      },
    },

    flavors: {
      list: () => selectAll<FlavorMaster>(TABLE.flavors),
      getById: (id) => selectById<FlavorMaster>(TABLE.flavors, id),
      async getByIds(ids) {
        if (ids.length === 0) return [];
        const { data, error } = await getSupabaseAdmin()
          .from(TABLE.flavors)
          .select("data")
          .in("id", ids);
        if (error) throw new Error(`flavors.getByIds: ${error.message}`);
        return (data ?? []).map((r) => (r as { data: FlavorMaster }).data);
      },
      async search(query) {
        const [flavors, brands] = await Promise.all([
          selectAll<FlavorMaster>(TABLE.flavors),
          selectAll<Brand>(TABLE.brands),
        ]);
        const brandById = new Map(brands.map((b) => [b.id, b]));
        return flavors.filter((f) => {
          const brand = brandById.get(f.brandId);
          const fields = [
            f.name,
            f.displayNameJa ?? "",
            ...f.aliases,
            ...f.tags,
            ...f.category,
            brand?.name ?? "",
            ...(brand?.aliases ?? []),
          ];
          return textHit(fields, query);
        });
      },
      create: (flavor) => insert(TABLE.flavors, flavor),
    },

    tasteWords: { list: () => selectAll<TasteWord>(TABLE.tasteWords) },
    synergy: { list: () => selectAll<SynergyRule>(TABLE.synergy) },
    heatTemplates: { list: () => selectAll<HeatTemplate>(TABLE.heat) },
    troubleshooting: {
      list: () => selectAll<TroubleshootingRule>(TABLE.troubleshooting),
    },

    users: {
      getById: (id) => selectById<UserProfile>(TABLE.users, id),
      list: () => selectAll<UserProfile>(TABLE.users),
    },

    inventory: {
      listByUser: (userId) =>
        selectWhere<UserInventoryItem>(TABLE.inventory, "user_id", userId),
      getById: (id) => selectById<UserInventoryItem>(TABLE.inventory, id),
      create: (item) => insert(TABLE.inventory, item),
      update: (id, p) => patch<UserInventoryItem>(TABLE.inventory, id, p),
      async remove(id) {
        const { error } = await getSupabaseAdmin()
          .from(TABLE.inventory)
          .delete()
          .eq("id", id);
        if (error) throw new Error(`inventory.remove: ${error.message}`);
      },
    },

    recipes: {
      listByUser: (userId) =>
        selectWhere<Recipe>(TABLE.recipes, "user_id", userId),
      getById: (id) => selectById<Recipe>(TABLE.recipes, id),
      async getByShareId(shareId) {
        const { data, error } = await getSupabaseAdmin()
          .from(TABLE.recipes)
          .select("data")
          .eq("share_id", shareId)
          .maybeSingle();
        if (error) throw new Error(`recipes.getByShareId: ${error.message}`);
        return data ? (data as { data: Recipe }).data : undefined;
      },
      create: (recipe) => insert(TABLE.recipes, recipe),
    },

    masterSubmissions: {
      list: () => selectAll<MasterSubmission>(TABLE.submissions),
      listByUser: (userId) =>
        selectWhere<MasterSubmission>(TABLE.submissions, "user_id", userId),
      create: (submission) => insert(TABLE.submissions, submission),
      update: (id, p) => patch<MasterSubmission>(TABLE.submissions, id, p),
    },

    photoImport: {
      listSessionsByUser: (userId) =>
        selectWhere<PhotoImportSession>(TABLE.photoSessions, "user_id", userId),
      getSession: (id) =>
        selectById<PhotoImportSession>(TABLE.photoSessions, id),
      createSession: (session) => insert(TABLE.photoSessions, session),
      updateSession: (id, p) =>
        patch<PhotoImportSession>(TABLE.photoSessions, id, p),
      listItemsBySession: (sessionId) =>
        selectWhere<PhotoDetectedItem>(TABLE.photoItems, "session_id", sessionId),
      createItem: (item) => insert(TABLE.photoItems, item),
      updateItem: (id, p) => patch<PhotoDetectedItem>(TABLE.photoItems, id, p),
    },
  };
}
