/**
 * Repository interfaces.
 *
 * The whole app talks to data ONLY through these interfaces. The MVP ships a
 * JSON-file implementation (see jsonStore.ts), but the same interfaces can be
 * backed by Supabase / Postgres / Neon / Vercel Postgres later with zero
 * changes to engines or UI. See README "Future migration notes".
 */
import {
  Brand,
  CurationNote,
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

export interface BrandRepository {
  list(): Promise<Brand[]>;
  getById(id: string): Promise<Brand | undefined>;
  search(query: string): Promise<Brand[]>;
}

export interface FlavorRepository {
  list(): Promise<FlavorMaster[]>;
  getById(id: string): Promise<FlavorMaster | undefined>;
  getByIds(ids: string[]): Promise<FlavorMaster[]>;
  search(query: string): Promise<FlavorMaster[]>;
  create(flavor: FlavorMaster): Promise<FlavorMaster>;
}

export interface TasteWordRepository {
  list(): Promise<TasteWord[]>;
}

export interface SynergyRepository {
  list(): Promise<SynergyRule[]>;
}

export interface HeatTemplateRepository {
  list(): Promise<HeatTemplate[]>;
}

export interface TroubleshootingRepository {
  list(): Promise<TroubleshootingRule[]>;
}

export interface UserRepository {
  getById(id: string): Promise<UserProfile | undefined>;
  list(): Promise<UserProfile[]>;
  /** Admin-only: update display name / role / wage schedule. */
  update(
    id: string,
    patch: Partial<UserProfile>,
  ): Promise<UserProfile | undefined>;
}

export interface InventoryRepository {
  listByUser(userId: string): Promise<UserInventoryItem[]>;
  getById(id: string): Promise<UserInventoryItem | undefined>;
  create(item: UserInventoryItem): Promise<UserInventoryItem>;
  update(
    id: string,
    patch: Partial<UserInventoryItem>,
  ): Promise<UserInventoryItem | undefined>;
  remove(id: string): Promise<void>;
}

export interface RecipeRepository {
  listByUser(userId: string): Promise<Recipe[]>;
  getById(id: string): Promise<Recipe | undefined>;
  getByShareId(shareId: string): Promise<Recipe | undefined>;
  create(recipe: Recipe): Promise<Recipe>;
}

export interface MasterSubmissionRepository {
  list(): Promise<MasterSubmission[]>;
  listByUser(userId: string): Promise<MasterSubmission[]>;
  create(submission: MasterSubmission): Promise<MasterSubmission>;
  update(
    id: string,
    patch: Partial<MasterSubmission>,
  ): Promise<MasterSubmission | undefined>;
}

export interface PhotoImportRepository {
  listSessionsByUser(userId: string): Promise<PhotoImportSession[]>;
  getSession(id: string): Promise<PhotoImportSession | undefined>;
  createSession(session: PhotoImportSession): Promise<PhotoImportSession>;
  updateSession(
    id: string,
    patch: Partial<PhotoImportSession>,
  ): Promise<PhotoImportSession | undefined>;
  listItemsBySession(sessionId: string): Promise<PhotoDetectedItem[]>;
  createItem(item: PhotoDetectedItem): Promise<PhotoDetectedItem>;
  updateItem(
    id: string,
    patch: Partial<PhotoDetectedItem>,
  ): Promise<PhotoDetectedItem | undefined>;
}

export interface CurationNoteRepository {
  /** All notes (for an AI pass to scan); newest first. */
  list(): Promise<CurationNote[]>;
  listByFlavor(flavorMasterId: string): Promise<CurationNote[]>;
  create(note: CurationNote): Promise<CurationNote>;
  update(
    id: string,
    patch: Partial<CurationNote>,
  ): Promise<CurationNote | undefined>;
  remove(id: string): Promise<void>;
}

export interface Repositories {
  brands: BrandRepository;
  flavors: FlavorRepository;
  tasteWords: TasteWordRepository;
  synergy: SynergyRepository;
  heatTemplates: HeatTemplateRepository;
  troubleshooting: TroubleshootingRepository;
  users: UserRepository;
  inventory: InventoryRepository;
  recipes: RecipeRepository;
  masterSubmissions: MasterSubmissionRepository;
  photoImport: PhotoImportRepository;
  curationNotes: CurationNoteRepository;
}
