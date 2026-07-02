/**
 * Export step: curated CSV ⇒ shisha-recipe-sns import-ready CSV + JSON.
 *
 *   npm run flavors:export-sns
 *
 * Reads `src/data/master/flavor_master.csv` (the single source of truth) and
 * writes:
 *   - `data/export/sns_flavor_master.csv`  — the 22 columns shisha-recipe-sns's
 *     CSV importer expects (same header names/order as the curated CSV, minus
 *     `confidence`/`source_urls`), RFC-4180 quoted.
 *   - `data/export/sns_flavor_master.json` — the same rows as camelCase
 *     `FlavorMasterRecord` objects (see `src/data/master/exportSnsFlavorMaster.ts`).
 *
 * Both outputs are deterministic: sorted brand→name ascending, with
 * normalized-key duplicates collapsed to the highest-confidence row. Rows
 * missing brand or flavor are skipped (the curated parser already drops
 * them; we just report how many).
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseFlavorMasterCsv } from "../src/data/master/parseCsv";
import {
  dedupeProfiles,
  SNS_CSV_COLUMNS,
  sortProfiles,
  toFlavorMasterRecord,
  toSnsCsvRow,
} from "../src/data/master/exportSnsFlavorMaster";

const ROOT = resolve(__dirname, "..");
const SRC = resolve(ROOT, "src/data/master/flavor_master.csv");
const OUT_DIR = resolve(ROOT, "data/export");

const csvText = readFileSync(SRC, "utf8");
const profiles = parseFlavorMasterCsv(csvText);

// parseFlavorMasterCsv drops rows missing brand/flavor without reporting a
// count. It filters the same non-blank lines we do here, so the delta
// between "data lines" and "parsed rows" is exactly the skipped count.
const dataRows =
  csvText
    .replace(/\r\n/g, "\n")
    .split("\n")
    .filter((l) => l.length > 0).length - 1;
const skippedEmpty = dataRows - profiles.length;

const { kept, duplicates } = dedupeProfiles(profiles);
const sorted = sortProfiles(kept);

mkdirSync(OUT_DIR, { recursive: true });

const csvOut = [SNS_CSV_COLUMNS.join(","), ...sorted.map(toSnsCsvRow)].join("\n") + "\n";
const csvTarget = resolve(OUT_DIR, "sns_flavor_master.csv");
writeFileSync(csvTarget, csvOut);

const records = sorted.map(toFlavorMasterRecord);
const jsonTarget = resolve(OUT_DIR, "sns_flavor_master.json");
writeFileSync(jsonTarget, JSON.stringify(records, null, 2) + "\n");

console.log(`Skipped ${skippedEmpty} row(s) missing brand/flavor.`);
console.log(`Deduped ${duplicates} normalized-key duplicate(s).`);
console.log(
  `Wrote ${sorted.length} flavors → ${csvTarget}\n` +
    `Wrote ${records.length} flavors → ${jsonTarget}`,
);
