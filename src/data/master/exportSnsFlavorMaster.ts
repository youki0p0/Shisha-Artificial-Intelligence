/**
 * ShishaOS → shisha-recipe-sns export.
 *
 * Projects the curated 24-column `flavor_master.csv` (see `flavorProfile.ts`)
 * into the 22-column shape shisha-recipe-sns's CSV importer expects — the same
 * header names and column order as the curated CSV, minus the two provenance
 * columns (`confidence`, `source_urls`) — plus a camelCase JSON record array
 * for direct import.
 *
 * Pure + deterministic: no filesystem access here (see
 * `scripts/exportSnsFlavorMaster.ts` for the CLI that reads/writes files).
 */
import { FlavorProfile } from "./flavorProfile";

/** The 22 columns shisha-recipe-sns's CSV importer expects, in CSV column order. */
export const SNS_CSV_COLUMNS = [
  "brand",
  "flavor",
  "nicotine",
  "intensity",
  "main_notes",
  "sub_notes",
  "volatility",
  "syrup",
  "heat_resistance",
  "role",
  "memo",
  "opening_speed",
  "peak_time",
  "fade_speed",
  "heat_style",
  "texture",
  "nose_finish",
  "sweetness_type",
  "salinity_type",
  "realism",
  "expanded_role",
  "notes",
] as const;

/** camelCase projection of one curated row, for the JSON export. */
export interface FlavorMasterRecord {
  brand: string;
  name: string;
  nicotine: number | null;
  intensity: number | null;
  mainNotes: string | null;
  subNotes: string | null;
  volatility: string | null;
  syrup: string | null;
  heatResistance: string | null;
  role: string | null;
  expandedRole: string | null;
  memo: string | null;
  openingSpeed: string | null;
  peakTime: string | null;
  fadeSpeed: string | null;
  heatStyle: string | null;
  texture: string | null;
  noseFinish: string | null;
  sweetnessType: string | null;
  salinityType: string | null;
  realism: string | null;
  notes: string | null;
  /** Provenance kept out of the CSV import but preserved in the JSON export. */
  masterConfidence: number | null;
  sourceUrls: string[];
}

/** RFC-4180 quote a single cell: quote (and double-up embedded quotes) whenever comma/quote/CR/LF is present. */
export function csvField(value: string | number | null): string {
  const s = value === null || value === undefined ? "" : String(value);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Join already-quoted cells into one RFC-4180 CSV line. */
export function toCsvRow(cells: (string | number | null)[]): string {
  return cells.map(csvField).join(",");
}

/** One curated row as an SNS-import CSV line (22 columns, `SNS_CSV_COLUMNS` order). */
export function toSnsCsvRow(p: FlavorProfile): string {
  return toCsvRow([
    p.brand,
    p.flavor,
    p.nicotine,
    p.intensity,
    p.main_notes,
    p.sub_notes,
    p.volatility,
    p.syrup,
    p.heat_resistance,
    p.role,
    p.memo,
    p.opening_speed,
    p.peak_time,
    p.fade_speed,
    p.heat_style,
    p.texture,
    p.nose_finish,
    p.sweetness_type,
    p.salinity_type,
    p.realism,
    p.expanded_role,
    p.notes,
  ]);
}

/** One curated row as a camelCase `FlavorMasterRecord` (JSON export). */
export function toFlavorMasterRecord(p: FlavorProfile): FlavorMasterRecord {
  return {
    brand: p.brand,
    name: p.flavor,
    nicotine: p.nicotine,
    intensity: p.intensity,
    mainNotes: p.main_notes,
    subNotes: p.sub_notes,
    volatility: p.volatility,
    syrup: p.syrup,
    heatResistance: p.heat_resistance,
    role: p.role,
    expandedRole: p.expanded_role,
    memo: p.memo,
    openingSpeed: p.opening_speed,
    peakTime: p.peak_time,
    fadeSpeed: p.fade_speed,
    heatStyle: p.heat_style,
    texture: p.texture,
    noseFinish: p.nose_finish,
    sweetnessType: p.sweetness_type,
    salinityType: p.salinity_type,
    realism: p.realism,
    notes: p.notes,
    masterConfidence: p.confidence,
    sourceUrls: (p.source_urls ?? "")
      .split(";")
      .map((u) => u.trim())
      .filter((u) => u.length > 0),
  };
}

/**
 * Dedup key for a (brand, name) pair: lowercase → NFKC → strip all whitespace
 * (incl. full-width) → strip everything but letters/digits. Two rows that
 * normalize to the same key are treated as the same flavor.
 */
export function normalizeKey(brand: string, name: string): string {
  return (brand + name)
    .toLowerCase()
    .normalize("NFKC")
    .replace(/\s+/gu, "")
    .replace(/[^\p{L}\p{N}]+/gu, "");
}

export interface DedupeResult {
  kept: FlavorProfile[];
  duplicates: number;
}

/**
 * Collapse rows whose `normalizeKey(brand, flavor)` collides, keeping the
 * higher-`confidence` row (the first-seen row wins on a tie). Input order is
 * treated as "first" — call this before `sortProfiles` for deterministic
 * tie-breaking on the source file's row order.
 */
export function dedupeProfiles(profiles: FlavorProfile[]): DedupeResult {
  const bestByKey = new Map<string, FlavorProfile>();
  let duplicates = 0;
  for (const p of profiles) {
    const key = normalizeKey(p.brand, p.flavor);
    const prev = bestByKey.get(key);
    if (!prev) {
      bestByKey.set(key, p);
      continue;
    }
    duplicates++;
    const prevConfidence = prev.confidence ?? -Infinity;
    const curConfidence = p.confidence ?? -Infinity;
    if (curConfidence > prevConfidence) bestByKey.set(key, p);
  }
  return { kept: [...bestByKey.values()], duplicates };
}

/** Sort brand → name ascending with a plain UTF-16 (`<`) comparison. */
export function sortProfiles(profiles: FlavorProfile[]): FlavorProfile[] {
  return [...profiles].sort((a, b) => {
    if (a.brand !== b.brand) return a.brand < b.brand ? -1 : 1;
    if (a.flavor !== b.flavor) return a.flavor < b.flavor ? -1 : 1;
    return 0;
  });
}
