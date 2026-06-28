/**
 * Build step: curated CSV + derivation spec  ⇒  generated TypeScript seed.
 *
 *   npm run flavors:build
 *
 * Reads `src/data/master/flavor_master.csv` (the single source of truth) and
 * `src/data/master/derivation_spec.json` (the council-approved mapping), then
 * writes `src/data/seed/flavors.generated.ts` with fully-derived FlavorMaster
 * records + any brands the CSV introduced. The app imports the generated file,
 * so there is no filesystem access at runtime (serverless-safe) and the
 * projection stays 100% deterministic.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { Brand, FlavorMaster } from "../src/domain/types";
import { curatedBrands } from "../src/data/seed/brands";
import { parseFlavorMasterCsv } from "../src/data/master/parseCsv";
import {
  BrandResolver,
  deriveFlavorMaster,
} from "../src/data/master/deriveFlavorMaster";
import { DerivationSpec } from "../src/data/master/derivationSpec";

const ROOT = resolve(__dirname, "..");
const T = "2025-01-01T00:00:00.000Z";

const csv = readFileSync(resolve(ROOT, "src/data/master/flavor_master.csv"), "utf8");
const spec = JSON.parse(
  readFileSync(resolve(ROOT, "src/data/master/derivation_spec.json"), "utf8"),
) as DerivationSpec;

const profiles = parseFlavorMasterCsv(csv);

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");
const slug = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

// Index curated brands (and their aliases) so CSV case/spelling variants resolve.
const brandIndex = new Map<string, Pick<Brand, "id" | "name">>();
for (const b of curatedBrands) {
  brandIndex.set(norm(b.name), { id: b.id, name: b.name });
  for (const a of b.aliases) brandIndex.set(norm(a), { id: b.id, name: b.name });
}

const newBrands = new Map<string, Brand>();
const resolveBrand: BrandResolver = (brandName) => {
  const key = norm(brandName);
  const known = brandIndex.get(key);
  if (known) return known;
  const id = `brand_${slug(brandName)}`;
  if (!newBrands.has(id)) {
    newBrands.set(id, {
      id,
      name: brandName,
      aliases: [],
      notes: "Imported from LISSO flavor master CSV.",
      createdAt: T,
      updatedAt: T,
    });
  }
  brandIndex.set(key, { id, name: brandName });
  return { id, name: brandName };
};

const derived = profiles.map((p) => ({
  fm: deriveFlavorMaster(p, spec, resolveBrand, T),
  profile: p,
}));

// Brand case/spelling variants (e.g. "DOZAJ" vs "Dozaj") can collide on the same
// id. Keep the profiled (verified) record over a stub; otherwise keep the first.
const byId = new Map<string, (typeof derived)[number]>();
for (const d of derived) {
  const prev = byId.get(d.fm.id);
  if (!prev || (prev.fm.dataStatus !== "verified" && d.fm.dataStatus === "verified")) {
    byId.set(d.fm.id, d);
  }
}
const flavors: FlavorMaster[] = [...byId.values()].map((d) => d.fm);
// Raw curated sensory profile (the 22 CSV columns) keyed by flavor id — for the
// admin inspector, kept out of the main bundle in its own module.
const profilesById: Record<string, (typeof profiles)[number]> = {};
for (const [id, d] of byId) profilesById[id] = d.profile;
if (flavors.length !== derived.length) {
  console.log(`Deduped ${derived.length - flavors.length} duplicate flavor id(s).`);
}

const generatedBrands = [...newBrands.values()].sort((a, b) => a.id.localeCompare(b.id));

const banner =
  "// AUTO-GENERATED — do not edit by hand.\n" +
  "// Source: src/data/master/flavor_master.csv + derivation_spec.json\n" +
  "// Regenerate with: npm run flavors:build\n";

// The data is embedded as a JSON string and parsed at module load. With ~3k
// records a raw object literal makes tsc build an enormous union type (TS2590);
// JSON.parse sidesteps that entirely while staying a single synchronous import.
const out =
  banner +
  'import { Brand, FlavorMaster } from "@/domain/types";\n\n' +
  `/** Brands introduced by the curated CSV (not already in the hand seed). */\n` +
  `export const generatedBrands: Brand[] = JSON.parse(\n  ${JSON.stringify(JSON.stringify(generatedBrands))},\n) as Brand[];\n\n` +
  `/** FlavorMaster records derived deterministically from the curated CSV. */\n` +
  `export const generatedFlavors: FlavorMaster[] = JSON.parse(\n  ${JSON.stringify(JSON.stringify(flavors))},\n) as FlavorMaster[];\n`;

const target = resolve(ROOT, "src/data/seed/flavors.generated.ts");
writeFileSync(target, out);

// Separate module (admin-only, server-side) with the raw sensory profiles.
const profilesOut =
  banner +
  'import { FlavorProfile } from "@/data/master/flavorProfile";\n\n' +
  `/** Raw curated 22-column sensory profile by flavor id (for the admin inspector). */\n` +
  `export const generatedProfiles: Record<string, FlavorProfile> = JSON.parse(\n  ${JSON.stringify(JSON.stringify(profilesById))},\n) as Record<string, FlavorProfile>;\n`;
writeFileSync(resolve(ROOT, "src/data/seed/flavorProfiles.generated.ts"), profilesOut);

const profiled = flavors.filter((f) => f.dataStatus === "verified").length;
console.log(
  `Wrote ${flavors.length} flavors (${profiled} profiled / ${flavors.length - profiled} stub) ` +
    `+ ${generatedBrands.length} new brands → ${target}`,
);
