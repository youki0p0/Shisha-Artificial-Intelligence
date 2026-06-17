/** Concrete JSON-backed repository implementations + the repositories factory. */
import { normalizeText } from "@/lib/utils";
import {
  Brand,
  FlavorMaster,
  MasterSubmission,
  PhotoDetectedItem,
  PhotoImportSession,
  Recipe,
  UserInventoryItem,
} from "@/domain/types";
import { getDb, mutate } from "./jsonStore";
import { Repositories } from "./types";

function textHit(haystacks: string[], q: string): boolean {
  const nq = normalizeText(q);
  if (!nq) return true;
  return haystacks.some((h) => normalizeText(h).includes(nq));
}

const repositories: Repositories = {
  brands: {
    async list() {
      return (await getDb()).brands;
    },
    async getById(id) {
      return (await getDb()).brands.find((b) => b.id === id);
    },
    async search(query) {
      const db = await getDb();
      return db.brands.filter((b) => textHit([b.name, ...b.aliases], query));
    },
  },

  flavors: {
    async list() {
      return (await getDb()).flavors;
    },
    async getById(id) {
      return (await getDb()).flavors.find((f) => f.id === id);
    },
    async getByIds(ids) {
      const set = new Set(ids);
      return (await getDb()).flavors.filter((f) => set.has(f.id));
    },
    async search(query) {
      const db = await getDb();
      const brandById = new Map(db.brands.map((b) => [b.id, b]));
      return db.flavors.filter((f) => {
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
    async create(flavor: FlavorMaster) {
      return mutate((db) => {
        db.flavors.push(flavor);
        return flavor;
      });
    },
  },

  tasteWords: {
    async list() {
      return (await getDb()).tasteWords;
    },
  },

  synergy: {
    async list() {
      return (await getDb()).synergyRules;
    },
  },

  heatTemplates: {
    async list() {
      return (await getDb()).heatTemplates;
    },
  },

  troubleshooting: {
    async list() {
      return (await getDb()).troubleshootingRules;
    },
  },

  users: {
    async getById(id) {
      return (await getDb()).users.find((u) => u.id === id);
    },
    async list() {
      return (await getDb()).users;
    },
  },

  inventory: {
    async listByUser(userId) {
      return (await getDb()).inventory.filter((i) => i.userId === userId);
    },
    async getById(id) {
      return (await getDb()).inventory.find((i) => i.id === id);
    },
    async create(item: UserInventoryItem) {
      return mutate((db) => {
        db.inventory.push(item);
        return item;
      });
    },
    async update(id, patch) {
      return mutate((db) => {
        const idx = db.inventory.findIndex((i) => i.id === id);
        if (idx === -1) return undefined;
        db.inventory[idx] = {
          ...db.inventory[idx],
          ...patch,
          updatedAt: new Date().toISOString(),
        };
        return db.inventory[idx];
      });
    },
    async remove(id) {
      await mutate((db) => {
        db.inventory = db.inventory.filter((i) => i.id !== id);
      });
    },
  },

  recipes: {
    async listByUser(userId) {
      return (await getDb()).recipes.filter((r) => r.userId === userId);
    },
    async getById(id) {
      return (await getDb()).recipes.find((r) => r.id === id);
    },
    async getByShareId(shareId) {
      return (await getDb()).recipes.find((r) => r.shareId === shareId);
    },
    async create(recipe: Recipe) {
      return mutate((db) => {
        db.recipes.push(recipe);
        return recipe;
      });
    },
  },

  masterSubmissions: {
    async list() {
      return (await getDb()).masterSubmissions;
    },
    async listByUser(userId) {
      return (await getDb()).masterSubmissions.filter((s) => s.userId === userId);
    },
    async create(submission: MasterSubmission) {
      return mutate((db) => {
        db.masterSubmissions.push(submission);
        return submission;
      });
    },
    async update(id, patch) {
      return mutate((db) => {
        const idx = db.masterSubmissions.findIndex((s) => s.id === id);
        if (idx === -1) return undefined;
        db.masterSubmissions[idx] = {
          ...db.masterSubmissions[idx],
          ...patch,
          updatedAt: new Date().toISOString(),
        };
        return db.masterSubmissions[idx];
      });
    },
  },

  photoImport: {
    async listSessionsByUser(userId) {
      return (await getDb()).photoSessions.filter((s) => s.userId === userId);
    },
    async getSession(id) {
      return (await getDb()).photoSessions.find((s) => s.id === id);
    },
    async createSession(session: PhotoImportSession) {
      return mutate((db) => {
        db.photoSessions.push(session);
        return session;
      });
    },
    async updateSession(id, patch) {
      return mutate((db) => {
        const idx = db.photoSessions.findIndex((s) => s.id === id);
        if (idx === -1) return undefined;
        db.photoSessions[idx] = {
          ...db.photoSessions[idx],
          ...patch,
          updatedAt: new Date().toISOString(),
        };
        return db.photoSessions[idx];
      });
    },
    async listItemsBySession(sessionId) {
      return (await getDb()).photoDetectedItems.filter(
        (i) => i.sessionId === sessionId,
      );
    },
    async createItem(item: PhotoDetectedItem) {
      return mutate((db) => {
        db.photoDetectedItems.push(item);
        return item;
      });
    },
    async updateItem(id, patch) {
      return mutate((db) => {
        const idx = db.photoDetectedItems.findIndex((i) => i.id === id);
        if (idx === -1) return undefined;
        db.photoDetectedItems[idx] = {
          ...db.photoDetectedItems[idx],
          ...patch,
          updatedAt: new Date().toISOString(),
        };
        return db.photoDetectedItems[idx];
      });
    },
  },
};

/** Single access point for all repositories. Swap implementation here later. */
export function getRepositories(): Repositories {
  return repositories;
}

export type { Brand };
