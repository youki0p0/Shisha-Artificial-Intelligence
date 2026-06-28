/**
 * Supabase-backed repositories.
 *
 * Per-user data (profiles, inventory, recipes, submissions, photo imports) is
 * persisted in Postgres with Row Level Security (see
 * supabase/migrations/0001_init_user_data.sql). Master data (brands, flavors,
 * taste words, …) is deterministic and still served from the seed, so we
 * delegate those repos to the JSON implementation.
 *
 * Each per-user row stores the full domain object in a `data jsonb` column plus
 * a few queryable key columns, so (de)serialization is trivial and the domain
 * types in src/domain/types.ts remain the single source of truth.
 */
import {
  CurationNote,
  MasterSubmission,
  PhotoDetectedItem,
  PhotoImportSession,
  Recipe,
  UserInventoryItem,
  UserProfile,
} from "@/domain/types";
import { getServerSupabase } from "@/lib/supabase/server";
import { jsonRepositories } from "./index";
import { Repositories } from "./types";

const now = () => new Date().toISOString();

// Master data is identical in both modes — delegate lazily to avoid a circular
// init (jsonRepositories is referenced at call-time, not module-eval time).
const master = {
  brands: {
    list: () => jsonRepositories.brands.list(),
    getById: (id: string) => jsonRepositories.brands.getById(id),
    search: (q: string) => jsonRepositories.brands.search(q),
  },
  flavors: {
    list: () => jsonRepositories.flavors.list(),
    getById: (id: string) => jsonRepositories.flavors.getById(id),
    getByIds: (ids: string[]) => jsonRepositories.flavors.getByIds(ids),
    search: (q: string) => jsonRepositories.flavors.search(q),
    create: (f: Parameters<Repositories["flavors"]["create"]>[0]) =>
      jsonRepositories.flavors.create(f),
  },
  tasteWords: { list: () => jsonRepositories.tasteWords.list() },
  synergy: { list: () => jsonRepositories.synergy.list() },
  heatTemplates: { list: () => jsonRepositories.heatTemplates.list() },
  troubleshooting: { list: () => jsonRepositories.troubleshooting.list() },
};

export const supabaseRepositories: Repositories = {
  ...master,

  users: {
    async getById(id) {
      const sb = await getServerSupabase();
      const { data } = await sb.from("profiles").select("*").eq("id", id).maybeSingle();
      return data ? rowToProfile(data) : undefined;
    },
    async list() {
      const sb = await getServerSupabase();
      const { data } = await sb.from("profiles").select("*");
      return (data ?? []).map(rowToProfile);
    },
    async update(id, patch) {
      const sb = await getServerSupabase();
      const existing = await this.getById(id);
      if (!existing) return undefined;
      const updated: UserProfile = { ...existing, ...patch, updatedAt: now() };
      const row: Record<string, unknown> = { updated_at: updated.updatedAt };
      if (patch.displayName !== undefined) row.display_name = updated.displayName;
      if (patch.handle !== undefined) row.handle = updated.handle ?? null;
      if (patch.role !== undefined) row.role = updated.role;
      if (patch.wages !== undefined) row.wages = updated.wages ?? [];
      await sb.from("profiles").update(row).eq("id", id);
      return updated;
    },
  },

  inventory: {
    async listByUser(userId) {
      const sb = await getServerSupabase();
      const { data } = await sb.from("inventory").select("data").eq("user_id", userId);
      return (data ?? []).map((r) => r.data as UserInventoryItem);
    },
    async getById(id) {
      const sb = await getServerSupabase();
      const { data } = await sb.from("inventory").select("data").eq("id", id).maybeSingle();
      return data ? (data.data as UserInventoryItem) : undefined;
    },
    async create(item) {
      const sb = await getServerSupabase();
      await sb.from("inventory").insert({
        id: item.id,
        user_id: item.userId,
        flavor_master_id: item.flavorMasterId ?? null,
        status: item.status,
        data: item,
      });
      return item;
    },
    async update(id, patch) {
      const sb = await getServerSupabase();
      const existing = await this.getById(id);
      if (!existing) return undefined;
      const updated: UserInventoryItem = { ...existing, ...patch, updatedAt: now() };
      await sb
        .from("inventory")
        .update({
          flavor_master_id: updated.flavorMasterId ?? null,
          status: updated.status,
          data: updated,
          updated_at: updated.updatedAt,
        })
        .eq("id", id);
      return updated;
    },
    async remove(id) {
      const sb = await getServerSupabase();
      await sb.from("inventory").delete().eq("id", id);
    },
  },

  recipes: {
    async listByUser(userId) {
      const sb = await getServerSupabase();
      const { data } = await sb.from("recipes").select("data").eq("user_id", userId);
      return (data ?? []).map((r) => r.data as Recipe);
    },
    async getById(id) {
      const sb = await getServerSupabase();
      const { data } = await sb.from("recipes").select("data").eq("id", id).maybeSingle();
      return data ? (data.data as Recipe) : undefined;
    },
    async getByShareId(shareId) {
      const sb = await getServerSupabase();
      const { data } = await sb
        .from("recipes")
        .select("data")
        .eq("share_id", shareId)
        .maybeSingle();
      return data ? (data.data as Recipe) : undefined;
    },
    async create(recipe) {
      const sb = await getServerSupabase();
      await sb.from("recipes").insert({
        id: recipe.id,
        user_id: recipe.userId,
        share_id: recipe.shareId ?? null,
        visibility: recipe.visibility,
        data: recipe,
      });
      return recipe;
    },
  },

  masterSubmissions: {
    async list() {
      const sb = await getServerSupabase();
      const { data } = await sb.from("master_submissions").select("data");
      return (data ?? []).map((r) => r.data as MasterSubmission);
    },
    async listByUser(userId) {
      const sb = await getServerSupabase();
      const { data } = await sb
        .from("master_submissions")
        .select("data")
        .eq("user_id", userId);
      return (data ?? []).map((r) => r.data as MasterSubmission);
    },
    async create(submission) {
      const sb = await getServerSupabase();
      await sb.from("master_submissions").insert({
        id: submission.id,
        user_id: submission.userId,
        status: submission.status,
        data: submission,
      });
      return submission;
    },
    async update(id, patch) {
      const sb = await getServerSupabase();
      const { data: row } = await sb
        .from("master_submissions")
        .select("data")
        .eq("id", id)
        .maybeSingle();
      if (!row) return undefined;
      const updated: MasterSubmission = {
        ...(row.data as MasterSubmission),
        ...patch,
        updatedAt: now(),
      };
      await sb
        .from("master_submissions")
        .update({ status: updated.status, data: updated, updated_at: updated.updatedAt })
        .eq("id", id);
      return updated;
    },
  },

  curationNotes: {
    async list() {
      const sb = await getServerSupabase();
      const { data } = await sb
        .from("flavor_curation_notes")
        .select("data")
        .order("created_at", { ascending: false });
      return (data ?? []).map((r) => r.data as CurationNote);
    },
    async listByFlavor(flavorMasterId) {
      const sb = await getServerSupabase();
      const { data } = await sb
        .from("flavor_curation_notes")
        .select("data")
        .eq("flavor_master_id", flavorMasterId)
        .order("created_at", { ascending: false });
      return (data ?? []).map((r) => r.data as CurationNote);
    },
    async create(note) {
      const sb = await getServerSupabase();
      await sb.from("flavor_curation_notes").insert({
        id: note.id,
        flavor_master_id: note.flavorMasterId,
        status: note.status,
        author_id: note.authorId,
        data: note,
      });
      return note;
    },
    async update(id, patch) {
      const sb = await getServerSupabase();
      const { data: row } = await sb
        .from("flavor_curation_notes")
        .select("data")
        .eq("id", id)
        .maybeSingle();
      if (!row) return undefined;
      const updated: CurationNote = {
        ...(row.data as CurationNote),
        ...patch,
        updatedAt: now(),
      };
      await sb
        .from("flavor_curation_notes")
        .update({ status: updated.status, data: updated, updated_at: updated.updatedAt })
        .eq("id", id);
      return updated;
    },
    async remove(id) {
      const sb = await getServerSupabase();
      await sb.from("flavor_curation_notes").delete().eq("id", id);
    },
  },

  photoImport: {
    async listSessionsByUser(userId) {
      const sb = await getServerSupabase();
      const { data } = await sb.from("photo_sessions").select("data").eq("user_id", userId);
      return (data ?? []).map((r) => r.data as PhotoImportSession);
    },
    async getSession(id) {
      const sb = await getServerSupabase();
      const { data } = await sb
        .from("photo_sessions")
        .select("data")
        .eq("id", id)
        .maybeSingle();
      return data ? (data.data as PhotoImportSession) : undefined;
    },
    async createSession(session) {
      const sb = await getServerSupabase();
      await sb.from("photo_sessions").insert({
        id: session.id,
        user_id: session.userId,
        status: session.status,
        data: session,
      });
      return session;
    },
    async updateSession(id, patch) {
      const sb = await getServerSupabase();
      const { data: row } = await sb
        .from("photo_sessions")
        .select("data")
        .eq("id", id)
        .maybeSingle();
      if (!row) return undefined;
      const updated: PhotoImportSession = {
        ...(row.data as PhotoImportSession),
        ...patch,
        updatedAt: now(),
      };
      await sb
        .from("photo_sessions")
        .update({ status: updated.status, data: updated, updated_at: updated.updatedAt })
        .eq("id", id);
      return updated;
    },
    async listItemsBySession(sessionId) {
      const sb = await getServerSupabase();
      const { data } = await sb
        .from("photo_detected_items")
        .select("data")
        .eq("session_id", sessionId);
      return (data ?? []).map((r) => r.data as PhotoDetectedItem);
    },
    async createItem(item) {
      const sb = await getServerSupabase();
      const session = await this.getSession(item.sessionId);
      await sb.from("photo_detected_items").insert({
        id: item.id,
        user_id: session?.userId ?? null,
        session_id: item.sessionId,
        data: item,
      });
      return item;
    },
    async updateItem(id, patch) {
      const sb = await getServerSupabase();
      const { data: row } = await sb
        .from("photo_detected_items")
        .select("data")
        .eq("id", id)
        .maybeSingle();
      if (!row) return undefined;
      const updated: PhotoDetectedItem = {
        ...(row.data as PhotoDetectedItem),
        ...patch,
        updatedAt: now(),
      };
      await sb
        .from("photo_detected_items")
        .update({ data: updated, updated_at: updated.updatedAt })
        .eq("id", id);
      return updated;
    },
  },
};

type ProfileRow = {
  id: string;
  display_name: string;
  handle: string | null;
  role: string;
  wages: UserProfile["wages"] | null;
  created_at: string;
  updated_at: string;
};

function rowToProfile(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    displayName: row.display_name,
    handle: row.handle ?? undefined,
    role: (row.role as UserProfile["role"]) ?? "user",
    wages: row.wages ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
