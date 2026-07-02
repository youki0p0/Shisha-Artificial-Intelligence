import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parseFlavorMasterCsv } from "./parseCsv";
import { FlavorProfile } from "./flavorProfile";
import {
  csvField,
  dedupeProfiles,
  normalizeKey,
  SNS_CSV_COLUMNS,
  sortProfiles,
  toFlavorMasterRecord,
  toSnsCsvRow,
} from "./exportSnsFlavorMaster";

const ROOT = resolve(__dirname, "../../..");
const csv = readFileSync(resolve(ROOT, "src/data/master/flavor_master.csv"), "utf8");
const profiles = parseFlavorMasterCsv(csv);
const { kept } = dedupeProfiles(profiles);
const sorted = sortProfiles(kept);
const records = sorted.map(toFlavorMasterRecord);

/** Minimal valid FlavorProfile fixture; individual tests override fields. */
const base: FlavorProfile = {
  brand: "Adalya",
  flavor: "Grape",
  nicotine: 3,
  intensity: 3,
  main_notes: null,
  sub_notes: null,
  volatility: null,
  syrup: null,
  heat_resistance: null,
  role: null,
  memo: null,
  opening_speed: null,
  peak_time: null,
  fade_speed: null,
  heat_style: null,
  texture: null,
  nose_finish: null,
  sweetness_type: null,
  salinity_type: null,
  realism: null,
  expanded_role: null,
  notes: null,
  confidence: 0.5,
  source_urls: null,
};

describe("SNS CSV column shape", () => {
  it("is the curated CSV's 22-column header, minus confidence/source_urls", () => {
    expect(SNS_CSV_COLUMNS).toEqual([
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
    ]);
    expect(SNS_CSV_COLUMNS.length).toBe(22);
  });
});

describe("SNS export JSON records", () => {
  it("produces more than 3000 records, all with a non-empty brand/name", () => {
    expect(records.length).toBeGreaterThan(3000);
    for (const r of records) {
      expect(r.brand.trim().length).toBeGreaterThan(0);
      expect(r.name.trim().length).toBeGreaterThan(0);
    }
  });

  it("is sorted brand → name ascending (plain UTF-16 compare)", () => {
    for (let i = 1; i < records.length; i++) {
      const prev = records[i - 1];
      const cur = records[i];
      const cmp = prev.brand !== cur.brand ? prev.brand < cur.brand : prev.name <= cur.name;
      expect(cmp, `${prev.brand}/${prev.name} → ${cur.brand}/${cur.name}`).toBe(true);
    }
  });
});

describe("normalized-key dedupe", () => {
  it("keeps the higher-confidence row on a normalized-key collision", () => {
    const low = { ...base, confidence: 0.4 };
    const high = { ...base, brand: "ADALYA", flavor: " grape ", confidence: 0.9 };
    const { kept: k, duplicates } = dedupeProfiles([low, high]);
    expect(duplicates).toBe(1);
    expect(k).toHaveLength(1);
    expect(k[0].confidence).toBe(0.9);
  });

  it("keeps the first-seen row when confidence ties", () => {
    const first = { ...base, confidence: 0.7 };
    const second = { ...base, brand: "adalya", flavor: "Grape", confidence: 0.7 };
    const { kept: k } = dedupeProfiles([first, second]);
    expect(k).toHaveLength(1);
    expect(k[0]).toBe(first);
  });

  it("normalizes full-width whitespace and punctuation via NFKC before comparing", () => {
    const a = { ...base, brand: "Al Fakher", flavor: "Two Apples" };
    // full-width space (U+3000) + a trailing full-width exclamation.
    const b = { ...base, brand: "Al　Fakher", flavor: "Two-Apples！", confidence: 0.9 };
    expect(normalizeKey(a.brand, a.flavor)).toBe(normalizeKey(b.brand, b.flavor));
    const { duplicates } = dedupeProfiles([a, b]);
    expect(duplicates).toBe(1);
  });

  it("does not collide unrelated flavors", () => {
    const a = { ...base, brand: "Adalya", flavor: "Grape" };
    const b = { ...base, brand: "Adalya", flavor: "Grapefruit" };
    const { kept: k, duplicates } = dedupeProfiles([a, b]);
    expect(duplicates).toBe(0);
    expect(k).toHaveLength(2);
  });
});

describe("RFC-4180 CSV quoting", () => {
  it("leaves plain fields unquoted and quotes comma/quote-bearing fields", () => {
    expect(csvField("plain")).toBe("plain");
    expect(csvField(null)).toBe("");
    expect(csvField(3.1)).toBe("3.1");
    expect(csvField("a, b")).toBe('"a, b"');
    expect(csvField('a "quoted" b')).toBe('"a ""quoted"" b"');
  });

  it("round-trips a comma/quote-bearing row through the existing curated-CSV parser", () => {
    const tricky: FlavorProfile = {
      ...base,
      brand: 'Weird, "Brand"',
      flavor: "Comma, Quote & Co.",
      main_notes: "kiwi, melon, berry",
      sub_notes: 'cool "fruit" candy',
    };
    const csvText = [SNS_CSV_COLUMNS.join(","), toSnsCsvRow(tricky)].join("\n");
    const [parsed] = parseFlavorMasterCsv(csvText);
    expect(parsed).toBeDefined();
    expect(parsed.brand).toBe(tricky.brand);
    expect(parsed.flavor).toBe(tricky.flavor);
    expect(parsed.main_notes).toBe(tricky.main_notes);
    expect(parsed.sub_notes).toBe(tricky.sub_notes);
  });
});
