/**
 * Zod schemas for runtime validation at the boundaries (API routes,
 * server actions, form submissions, seed loading).
 *
 * We keep these aligned with src/domain/types.ts. Where convenient we infer
 * TypeScript types back from schemas, but the canonical hand-written types in
 * types.ts remain the source of truth for documentation.
 */
import { z } from "zod";
import { ALL_FLAVOR_ROLES } from "./types";

const score0to10 = z.number().min(0).max(10);

export const flavorRoleSchema = z.enum(
  ALL_FLAVOR_ROLES as [string, ...string[]],
);

export const tasteVectorSchema = z.object({
  sweetness: z.number(),
  sourness: z.number(),
  cooling: z.number(),
  bitterness: z.number(),
  body: z.number(),
  wetness: z.number(),
  freshness: z.number(),
  luxury: z.number(),
  heaviness: z.number(),
  aftertaste: z.number(),
  structure: z.number(),
});

export const tasteConstraintsSchema = z.object({
  sweetnessMin: z.number().optional(),
  sweetnessMax: z.number().optional(),
  sournessMin: z.number().optional(),
  sournessMax: z.number().optional(),
  coolingMin: z.number().optional(),
  coolingMax: z.number().optional(),
  bodyMin: z.number().optional(),
  bodyMax: z.number().optional(),
  heavinessMin: z.number().optional(),
  heavinessMax: z.number().optional(),
});

export const brandSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  aliases: z.array(z.string()).default([]),
  country: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const flavorMasterSchema = z.object({
  id: z.string(),
  brandId: z.string(),
  name: z.string().min(1),
  displayNameJa: z.string().optional(),
  aliases: z.array(z.string()).default([]),
  category: z.array(z.string()).default([]),
  roles: z.array(flavorRoleSchema).default([]),
  tags: z.array(z.string()).default([]),
  nicotineLevel: z.number().optional(),
  aromaStrength: z.number().optional(),
  sweetness: score0to10,
  sourness: score0to10,
  cooling: score0to10,
  bitterness: score0to10,
  body: score0to10,
  wetness: score0to10,
  freshness: score0to10,
  luxury: score0to10,
  heaviness: score0to10,
  aftertaste: score0to10,
  structure: score0to10,
  layerAffinity: z.object({
    top: z.number(),
    middle: z.number(),
    bottom: z.number(),
  }),
  heatTolerance: score0to10,
  beginnerFriendly: score0to10,
  soloUsability: score0to10,
  description: z.string().optional(),
  notes: z.string().optional(),
  dataStatus: z.enum(["verified", "community", "pending", "unknown"]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const tasteWordSchema = z.object({
  id: z.string(),
  keyword: z.string().min(1),
  aliases: z.array(z.string()).default([]),
  effects: tasteVectorSchema.partial(),
  constraints: tasteConstraintsSchema.optional(),
  preferredRoles: z.array(flavorRoleSchema).default([]),
  avoidRoles: z.array(flavorRoleSchema).default([]),
  preferredTags: z.array(z.string()).default([]),
  avoidTags: z.array(z.string()).default([]),
  priority: z.number(),
  description: z.string(),
  examples: z.array(z.string()).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const synergyRuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  whenRolesAll: z.array(flavorRoleSchema).default([]),
  whenTagsAny: z.array(z.string()).default([]),
  whenFlavorIdsAny: z.array(z.string()).default([]),
  bonus: z.number(),
  description: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const heatTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  bowlType: z.string(),
  hmdOrFoil: z.string(),
  charcoalType: z.string(),
  totalGramRange: z.tuple([z.number(), z.number()]),
  suitableForTags: z.array(z.string()).default([]),
  start: z.string(),
  after10min: z.string(),
  after25min: z.string(),
  notes: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const troubleshootingRuleSchema = z.object({
  id: z.string(),
  symptom: z.string(),
  whenTagsAny: z.array(z.string()).default([]),
  whenCoolingOver: z.number().optional(),
  whenHeavinessOver: z.number().optional(),
  whenSweetnessOver: z.number().optional(),
  suggestion: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const userProfileSchema = z.object({
  id: z.string(),
  displayName: z.string().min(1),
  handle: z.string().optional(),
  role: z.enum(["user", "curator", "admin"]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const inventoryStatusSchema = z.enum([
  "in_stock",
  "low",
  "out",
  "planned",
]);
export const inventorySourceSchema = z.enum([
  "manual",
  "photo_import",
  "csv",
  "web_search",
]);

export const userInventoryItemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  flavorMasterId: z.string().optional(),
  customBrand: z.string().optional(),
  customName: z.string().optional(),
  amountGram: z.number().optional(),
  status: inventoryStatusSchema,
  purchaseUrl: z.string().url().optional().or(z.literal("")),
  memo: z.string().optional(),
  source: inventorySourceSchema,
  confidence: z.number().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const masterSubmissionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  brandName: z.string().min(1),
  flavorName: z.string().min(1),
  aliases: z.array(z.string()).optional(),
  imageUrl: z.string().optional(),
  purchaseUrl: z.string().optional(),
  memo: z.string().optional(),
  status: z.enum(["pending", "approved", "rejected", "merged"]),
  reviewedBy: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// --- Input schemas used by forms / API (subset of the full record) ---------

export const manualInventoryInputSchema = z.object({
  flavorMasterId: z.string().optional(),
  customBrand: z.string().optional(),
  customName: z.string().optional(),
  amountGram: z.coerce.number().min(0).optional(),
  status: inventoryStatusSchema.default("in_stock"),
  purchaseUrl: z.string().optional(),
  memo: z.string().optional(),
});

export const recipeRequestSchema = z.object({
  input: z.string().min(1),
  mode: z.enum(["inventory_only", "allow_missing", "beginner", "advanced"]),
  totalGram: z.coerce.number().min(5).max(60).default(15),
});

export const masterSubmissionInputSchema = z.object({
  brandName: z.string().min(1),
  flavorName: z.string().min(1),
  aliases: z.array(z.string()).optional(),
  imageUrl: z.string().optional(),
  purchaseUrl: z.string().optional(),
  memo: z.string().optional(),
});

export type ManualInventoryInput = z.infer<typeof manualInventoryInputSchema>;
export type RecipeRequestInput = z.infer<typeof recipeRequestSchema>;
export type MasterSubmissionInput = z.infer<typeof masterSubmissionInputSchema>;
