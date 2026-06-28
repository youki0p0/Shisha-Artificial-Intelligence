/**
 * ShishaOS — Core domain types.
 *
 * These types model the whole product:
 *  - Global master data (shared, read-only for normal users)
 *  - User private data (separated by userId)
 *
 * Design principles:
 *  - DB-first / local-first. AI is an optional fallback, never the core.
 *  - Master data is curated; OCR / AI / web search results are *candidates*
 *    that must be reviewed by a human before becoming confirmed data.
 */

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

/** ISO-8601 timestamp string. */
export type ISODateString = string;

/** Roles a flavor can play in a recipe / mix. */
export type FlavorRole =
  | "main"
  | "support"
  | "base"
  | "top-note"
  | "middle-note"
  | "bottom-note"
  | "cooling"
  | "tea"
  | "fruit"
  | "citrus"
  | "dessert"
  | "spice"
  | "green"
  | "watery"
  | "hotel"
  | "structure"
  | "saltiness"
  | "aroma"
  | "aftertaste"
  | "cola"
  | "cream"
  | "mint";

export const ALL_FLAVOR_ROLES: FlavorRole[] = [
  "main",
  "support",
  "base",
  "top-note",
  "middle-note",
  "bottom-note",
  "cooling",
  "tea",
  "fruit",
  "citrus",
  "dessert",
  "spice",
  "green",
  "watery",
  "hotel",
  "structure",
  "saltiness",
  "aroma",
  "aftertaste",
  "cola",
  "cream",
  "mint",
];

/**
 * The 11-dimension taste vector. Every dimension is a 0..10 score.
 * This is the shared "language" between FlavorMaster, TasteWord and the
 * scoring engine.
 */
export type TasteVector = {
  sweetness: number;
  sourness: number;
  cooling: number;
  bitterness: number;
  body: number;
  wetness: number;
  freshness: number;
  luxury: number;
  heaviness: number;
  aftertaste: number;
  structure: number;
};

export const TASTE_DIMENSIONS: (keyof TasteVector)[] = [
  "sweetness",
  "sourness",
  "cooling",
  "bitterness",
  "body",
  "wetness",
  "freshness",
  "luxury",
  "heaviness",
  "aftertaste",
  "structure",
];

/** Min/max bounds expressed by a taste word (e.g. "甘すぎない" => sweetnessMax). */
export type TasteConstraints = {
  sweetnessMin?: number;
  sweetnessMax?: number;
  sournessMin?: number;
  sournessMax?: number;
  coolingMin?: number;
  coolingMax?: number;
  bodyMin?: number;
  bodyMax?: number;
  heavinessMin?: number;
  heavinessMax?: number;
};

// ---------------------------------------------------------------------------
// Global master data
// ---------------------------------------------------------------------------

export type Brand = {
  id: string;
  name: string;
  aliases: string[];
  country?: string;
  notes?: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type FlavorDataStatus = "verified" | "community" | "pending" | "unknown";

export type FlavorMaster = {
  id: string;
  brandId: string;
  name: string;
  displayNameJa?: string;
  aliases: string[];
  category: string[];
  roles: FlavorRole[];
  tags: string[];
  nicotineLevel?: number;
  aromaStrength?: number;
  // Taste vector fields (flattened so master records read naturally).
  sweetness: number;
  sourness: number;
  cooling: number;
  bitterness: number;
  body: number;
  wetness: number;
  freshness: number;
  luxury: number;
  heaviness: number;
  aftertaste: number;
  structure: number;
  layerAffinity: {
    top: number;
    middle: number;
    bottom: number;
  };
  heatTolerance: number;
  beginnerFriendly: number;
  soloUsability: number;
  description?: string;
  notes?: string;
  /** Provenance for auto-enriched values: confidence (0..1) and a source URL. */
  confidence?: number;
  sourceUrl?: string;
  dataStatus: FlavorDataStatus;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type TasteWord = {
  id: string;
  keyword: string;
  aliases: string[];
  effects: Partial<TasteVector>;
  constraints?: TasteConstraints;
  preferredRoles: FlavorRole[];
  avoidRoles: FlavorRole[];
  preferredTags: string[];
  avoidTags: string[];
  /** Higher priority words dominate when several match. */
  priority: number;
  description: string;
  examples: string[];
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

/**
 * A synergy / anti-synergy rule between flavors, roles or tags.
 * Used by the scoring engine to add bonuses (or penalties when bonus<0).
 */
export type SynergyRule = {
  id: string;
  name: string;
  /** Match by any of these — empty arrays mean "ignore this matcher". */
  whenRolesAll: FlavorRole[];
  whenTagsAny: string[];
  whenFlavorIdsAny: string[];
  /** Positive = synergy bonus, negative = clash penalty. */
  bonus: number;
  description: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type HeatTemplate = {
  id: string;
  name: string;
  bowlType: string;
  hmdOrFoil: string;
  charcoalType: string;
  totalGramRange: [number, number];
  suitableForTags: string[];
  start: string;
  after10min: string;
  after25min: string;
  notes: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type TroubleshootingRule = {
  id: string;
  /** Symptom keyword(s), e.g. "harsh", "weak-flavor", "headache". */
  symptom: string;
  /** Trigger conditions on the produced recipe. */
  whenTagsAny: string[];
  whenCoolingOver?: number;
  whenHeavinessOver?: number;
  whenSweetnessOver?: number;
  suggestion: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type PublicRecipeTemplate = {
  id: string;
  title: string;
  concept: string;
  conceptTags: string[];
  description: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

// ---------------------------------------------------------------------------
// User private data
// ---------------------------------------------------------------------------

export type UserRole = "user" | "curator" | "admin";

export type UserProfile = {
  id: string;
  displayName: string;
  handle?: string;
  role: UserRole;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type InventoryStatus = "in_stock" | "low" | "out" | "planned";
export type InventorySource = "manual" | "photo_import" | "csv" | "web_search";

export type UserInventoryItem = {
  id: string;
  userId: string;
  flavorMasterId?: string;
  customBrand?: string;
  customName?: string;
  amountGram?: number;
  status: InventoryStatus;
  purchaseUrl?: string;
  memo?: string;
  source: InventorySource;
  confidence?: number;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type UserFlavorMemo = {
  id: string;
  userId: string;
  flavorMasterId: string;
  memo: string;
  rating?: number;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type UserPreference = {
  id: string;
  userId: string;
  /** Persisted bias applied to the taste intent (-5..+5 per dim). */
  tasteBias: Partial<TasteVector>;
  avoidTags: string[];
  preferredTags: string[];
  defaultMode: RecipeMode;
  beginnerMode: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type RecipeVisibility = "private" | "public" | "unlisted";

export type FavoriteRecipe = {
  id: string;
  userId: string;
  recipeId: string;
  createdAt: ISODateString;
};

export type PhotoImportStatus =
  | "uploaded"
  | "processing"
  | "review_required"
  | "completed"
  | "failed";

export type PhotoImportSession = {
  id: string;
  userId: string;
  imageUrl: string;
  status: PhotoImportStatus;
  detectedText?: string;
  ocrConfidence?: number;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type PhotoDetectedItemStatus = "pending" | "approved" | "edited" | "ignored";

export type PhotoDetectedItem = {
  id: string;
  sessionId: string;
  rawText: string;
  detectedBrand?: string;
  detectedFlavorName?: string;
  detectedAmountGram?: number;
  matchedFlavorMasterId?: string;
  matchConfidence: number;
  status: PhotoDetectedItemStatus;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type MasterSubmissionStatus = "pending" | "approved" | "rejected" | "merged";

export type MasterSubmission = {
  id: string;
  userId: string;
  brandName: string;
  flavorName: string;
  aliases?: string[];
  imageUrl?: string;
  purchaseUrl?: string;
  memo?: string;
  status: MasterSubmissionStatus;
  reviewedBy?: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

// ---------------------------------------------------------------------------
// Recipe types
// ---------------------------------------------------------------------------

export type RecipeMode =
  | "inventory_only"
  | "allow_missing"
  | "beginner"
  | "advanced";

export type RecipeItem = {
  flavorMasterId?: string;
  /** Display name fallback for custom / missing flavors. */
  displayName: string;
  brandName?: string;
  role: FlavorRole;
  grams: number;
  percentage: number;
  reason: string;
  /** True when the flavor is not in the current user's inventory. */
  missing: boolean;
};

export type RecipeLayerItem = {
  flavorMasterId?: string;
  displayName: string;
  grams: number;
  reason: string;
};

export type HeatManagementPlan = {
  templateId?: string;
  templateName: string;
  bowlType: string;
  hmdOrFoil: string;
  charcoalType: string;
  start: string;
  after10min: string;
  after25min: string;
  notes: string;
};

export type FlavorTimelinePhase = {
  phase: "early" | "mid" | "late";
  label: string;
  description: string;
};

export type FlavorTimeline = {
  phases: FlavorTimelinePhase[];
};

export type TroubleshootingSuggestion = {
  symptom: string;
  suggestion: string;
};

export type Recipe = {
  id: string;
  userId: string;
  title: string;
  concept: string;
  totalGram: number;
  items: RecipeItem[];
  layers: {
    top: RecipeLayerItem[];
    middle: RecipeLayerItem[];
    bottom: RecipeLayerItem[];
  };
  heatManagement: HeatManagementPlan;
  flavorTimeline: FlavorTimeline;
  troubleshooting: TroubleshootingSuggestion[];
  score: number;
  scoreBreakdown: Record<string, number>;
  tags: string[];
  visibility: RecipeVisibility;
  shareId?: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

// ---------------------------------------------------------------------------
// Parser / intent types
// ---------------------------------------------------------------------------

export type TasteIntent = {
  originalInput: string;
  vector: TasteVector;
  constraints: TasteConstraints;
  matchedKeywords: string[];
  unknownTerms: string[];
  preferredRoles: FlavorRole[];
  avoidRoles: FlavorRole[];
  preferredTags: string[];
  avoidTags: string[];
  conceptTags: string[];
  confidence: number;
  shouldUseAiFallback: boolean;
  fallbackReason?: string;
};

// ---------------------------------------------------------------------------
// OCR adapter types
// ---------------------------------------------------------------------------

export type OcrTextBlock = {
  text: string;
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

export type OcrResult = {
  rawText: string;
  blocks: OcrTextBlock[];
  confidence: number;
};

export interface OcrAdapter {
  extractText(imageUrl: string): Promise<OcrResult>;
}

// ---------------------------------------------------------------------------
// Web search adapter types
// ---------------------------------------------------------------------------

export type SearchSource = {
  id: string;
  name: string;
  baseUrl: string;
  enabled: boolean;
  priority: number;
  notes?: string;
};

export type SearchResultStockStatus = "in_stock" | "out" | "unknown";
export type SearchResultStatus = "new" | "matched" | "ignored" | "approved";

export type SearchResult = {
  id: string;
  query: string;
  title: string;
  url: string;
  snippet?: string;
  detectedBrand?: string;
  detectedFlavorName?: string;
  detectedSize?: string;
  detectedPrice?: number;
  detectedStockStatus?: SearchResultStockStatus;
  confidence: number;
  matchedExistingFlavorId?: string;
  status: SearchResultStatus;
  createdAt: ISODateString;
};

export interface WebSearchAdapter {
  search(query: string): Promise<SearchResult[]>;
}

// ---------------------------------------------------------------------------
// AI fallback adapter types (optional, never required)
// ---------------------------------------------------------------------------

export interface AiFallbackAdapter {
  /** Optional refinement of a low-confidence TasteIntent. Must NOT invent
   * flavor master data or finalize a recipe. */
  refineIntent(input: string, draft: TasteIntent): Promise<Partial<TasteIntent>>;
}
