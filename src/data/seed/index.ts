/** Aggregated seed data + the full DB shape used by the JSON repository layer. */
import {
  Brand,
  CurationNote,
  FlavorMaster,
  HeatTemplate,
  MasterSubmission,
  PhotoDetectedItem,
  PhotoImportSession,
  Recipe,
  ShiftEntry,
  SynergyRule,
  TasteWord,
  TroubleshootingRule,
  UserInventoryItem,
  UserProfile,
} from "@/domain/types";
import { seedBrands } from "./brands";
import { seedFlavors } from "./flavors";
import { seedTasteWords } from "./tasteWords";
import { seedSynergyRules } from "./synergy";
import { seedHeatTemplates } from "./heatTemplates";
import { seedTroubleshootingRules } from "./troubleshooting";
import { seedInventory, seedShifts, seedUsers } from "./users";

export type Database = {
  brands: Brand[];
  flavors: FlavorMaster[];
  tasteWords: TasteWord[];
  synergyRules: SynergyRule[];
  heatTemplates: HeatTemplate[];
  troubleshootingRules: TroubleshootingRule[];
  users: UserProfile[];
  inventory: UserInventoryItem[];
  recipes: Recipe[];
  masterSubmissions: MasterSubmission[];
  photoSessions: PhotoImportSession[];
  photoDetectedItems: PhotoDetectedItem[];
  curationNotes: CurationNote[];
  shifts: ShiftEntry[];
};

/** Build a fresh seeded database (deep-cloned so callers can mutate safely). */
export function buildSeedDatabase(): Database {
  return structuredClone({
    brands: seedBrands,
    flavors: seedFlavors,
    tasteWords: seedTasteWords,
    synergyRules: seedSynergyRules,
    heatTemplates: seedHeatTemplates,
    troubleshootingRules: seedTroubleshootingRules,
    users: seedUsers,
    inventory: seedInventory,
    recipes: [],
    masterSubmissions: [],
    photoSessions: [],
    photoDetectedItems: [],
    curationNotes: [],
    shifts: seedShifts,
  });
}

export {
  seedBrands,
  seedFlavors,
  seedTasteWords,
  seedSynergyRules,
  seedHeatTemplates,
  seedTroubleshootingRules,
  seedUsers,
  seedInventory,
  seedShifts,
};
