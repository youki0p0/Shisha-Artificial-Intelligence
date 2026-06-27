/**
 * ShishaOS — Flavor Master "sensory profile" model.
 *
 * This mirrors the curated LISSO CSV (`flavor_master.csv`) 1:1. The CSV is the
 * single source of truth for the core flavor DB: each row is one product's
 * human-curated sensory profile. The 22 columns are stored as-is here, then a
 * deterministic mapping (see `deriveFlavorMaster.ts`) projects them into the
 * engine's 11-dimension TasteVector + roles/tags. Nothing in this file is
 * AI-generated — it is the authoritative master shape.
 */
import { z } from "zod";

// --- Categorical enums observed in the curated CSV --------------------------

export const LEVELS = ["low", "medium", "high"] as const;
export type Level = (typeof LEVELS)[number];

export const HEAT_RESISTANCE = ["medium", "high"] as const;
export type HeatResistance = (typeof HEAT_RESISTANCE)[number];

export const OPENING_SPEED = ["very fast", "fast", "medium", "slow"] as const;
export type OpeningSpeed = (typeof OPENING_SPEED)[number];

export const PEAK_TIME = [
  "opening",
  "opening-middle",
  "middle",
  "middle-late",
  "late",
] as const;
export type PeakTime = (typeof PEAK_TIME)[number];

export const FADE_SPEED = [
  "fast",
  "fast-medium",
  "medium",
  "medium-slow",
  "slow",
] as const;
export type FadeSpeed = (typeof FADE_SPEED)[number];

export const CSV_ROLE = [
  "accent",
  "bakery",
  "base",
  "binder",
  "body",
  "booster",
  "classic",
  "cooling",
  "floral",
  "refreshing",
  "roast",
  "salinity",
  "spice",
  "tea",
  "texture",
  "water",
] as const;
export type CsvRole = (typeof CSV_ROLE)[number];

export const REALISM = [
  "real peel",
  "real tea",
  "realistic",
  "semi-real",
  "classic flavor",
  "concept flavor",
  "flavoring",
  "perfume",
] as const;
export type Realism = (typeof REALISM)[number];

/**
 * One curated flavor master record, matching the CSV columns exactly.
 * `null` means the cell was blank in the CSV (stub rows that are queued for
 * curation but not yet profiled).
 */
export type FlavorProfile = {
  brand: string;
  flavor: string;
  nicotine: number | null;
  intensity: number | null;
  main_notes: string | null;
  sub_notes: string | null;
  volatility: Level | null;
  syrup: Level | null;
  heat_resistance: HeatResistance | null;
  role: CsvRole | null;
  memo: string | null;
  opening_speed: OpeningSpeed | null;
  peak_time: PeakTime | null;
  fade_speed: FadeSpeed | null;
  heat_style: string | null;
  texture: string | null;
  nose_finish: string | null;
  sweetness_type: string | null;
  salinity_type: string | null;
  realism: Realism | null;
  expanded_role: string | null;
  notes: string | null;
};

/** True when the row carries a full sensory profile (not just a queued stub). */
export function isProfiled(p: FlavorProfile): boolean {
  return p.intensity != null && p.volatility != null && p.role != null;
}

// --- Zod schema (runtime validation at CSV load) ----------------------------

const enumOrNull = <T extends readonly [string, ...string[]]>(values: T) =>
  z.enum(values).nullable();

export const flavorProfileSchema = z.object({
  brand: z.string().min(1),
  flavor: z.string().min(1),
  nicotine: z.number().nullable(),
  intensity: z.number().nullable(),
  main_notes: z.string().nullable(),
  sub_notes: z.string().nullable(),
  volatility: enumOrNull(LEVELS),
  syrup: enumOrNull(LEVELS),
  heat_resistance: enumOrNull(HEAT_RESISTANCE),
  role: enumOrNull(CSV_ROLE),
  memo: z.string().nullable(),
  opening_speed: enumOrNull(OPENING_SPEED),
  peak_time: enumOrNull(PEAK_TIME),
  fade_speed: enumOrNull(FADE_SPEED),
  heat_style: z.string().nullable(),
  texture: z.string().nullable(),
  nose_finish: z.string().nullable(),
  sweetness_type: z.string().nullable(),
  salinity_type: z.string().nullable(),
  realism: enumOrNull(REALISM),
  expanded_role: z.string().nullable(),
  notes: z.string().nullable(),
});

/** Concatenated free-text descriptor surface used by keyword rules. */
export function descriptorText(p: FlavorProfile): string {
  return [
    p.main_notes,
    p.sub_notes,
    p.heat_style,
    p.texture,
    p.nose_finish,
    p.sweetness_type,
    p.salinity_type,
    p.expanded_role,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}
