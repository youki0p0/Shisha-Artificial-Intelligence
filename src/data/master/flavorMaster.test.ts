import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parseFlavorMasterCsv } from "./parseCsv";
import { deriveFlavorMaster } from "./deriveFlavorMaster";
import { DerivationSpec } from "./derivationSpec";
import { TASTE_DIMENSIONS } from "@/domain/types";
import { seedFlavors } from "@/data/seed/flavors";
import { seedBrands } from "@/data/seed/brands";

const ROOT = resolve(__dirname, "../../..");
const csv = readFileSync(resolve(ROOT, "src/data/master/flavor_master.csv"), "utf8");
const spec = JSON.parse(
  readFileSync(resolve(ROOT, "src/data/master/derivation_spec.json"), "utf8"),
) as DerivationSpec;
const T = "2025-01-01T00:00:00.000Z";
const resolveBrand = (name: string) => ({ id: `brand_${name}`, name });

const profiles = parseFlavorMasterCsv(csv);

describe("flavor master CSV (the core ShishaOS DB)", () => {
  it("parses every curated row with brand + flavor identity", () => {
    expect(profiles.length).toBeGreaterThan(60);
    for (const p of profiles) {
      expect(p.brand).toBeTruthy();
      expect(p.flavor).toBeTruthy();
    }
  });

  it("derivation is deterministic (same input ⇒ same output)", () => {
    const a = deriveFlavorMaster(profiles[0], spec, resolveBrand, T);
    const b = deriveFlavorMaster(profiles[0], spec, resolveBrand, T);
    expect(a).toEqual(b);
  });

  it("every derived taste value stays within 0..10", () => {
    for (const p of profiles) {
      const fm = deriveFlavorMaster(p, spec, resolveBrand, T);
      for (const dim of TASTE_DIMENSIONS) {
        expect(fm[dim], `${p.flavor}.${dim}`).toBeGreaterThanOrEqual(0);
        expect(fm[dim], `${p.flavor}.${dim}`).toBeLessThanOrEqual(10);
      }
      for (const k of ["heatTolerance", "beginnerFriendly", "soloUsability"] as const) {
        expect(fm[k]).toBeGreaterThanOrEqual(0);
        expect(fm[k]).toBeLessThanOrEqual(10);
      }
    }
  });

  it("keyword matching is word-anchored: 'ice' must not fire on 'juice'/'spice'", () => {
    // Cola Dragon's descriptor contains 'spice' but no real cooling — the old
    // substring bug inflated cooling via 'sp[ice]'. It must stay low now.
    const cola = seedFlavors.find((f) => f.id === "fm_adalya_cola_dragon");
    expect(cola).toBeDefined();
    expect(cola!.cooling).toBeLessThan(3);
  });

  it("derived vectors land near the curated anchor concepts (weight calibration)", () => {
    // anchors: sweetness, cooling, bitterness, body, freshness, luxury,
    //          heaviness, aftertaste, structure, heatTolerance, aromaStrength
    const dims = [
      "sweetness", "cooling", "bitterness", "body", "freshness", "luxury",
      "heaviness", "aftertaste", "structure", "heatTolerance", "aromaStrength",
    ] as const;
    const anchors: Record<string, number[]> = {
      Mint: [2, 8, 2, 2, 8, 3, 1, 4, 3, 6, 6],
      "Earl Grey": [3, 0, 3, 4, 5, 8, 3, 6, 7, 4, 7],
      Vanilla: [7, 0, 1, 6, 1, 6, 6, 7, 5, 8, 5],
      Peanut: [3, 0, 3, 7, 1, 5, 8, 7, 7, 8, 6],
      Lychee: [6, 2, 0, 3, 6, 5, 2, 4, 3, 6, 7],
    };
    let total = 0;
    let count = 0;
    for (const [name, anchor] of Object.entries(anchors)) {
      const f = seedFlavors.find((x) => x.name === name);
      expect(f, `${name} present in CSV-derived seed`).toBeDefined();
      dims.forEach((d, i) => {
        total += Math.abs((f as unknown as Record<string, number>)[d] - anchor[i]);
        count++;
      });
    }
    // Deterministic projection won't match hand values exactly (CSV is the new
    // source of truth) but must stay in the same neighborhood.
    expect(total / count).toBeLessThan(1.3);
  });

  it("tag identity is promoted to a role (cola flavor plays the 'cola' role)", () => {
    const cola = seedFlavors.find((f) => f.id === "fm_adalya_cola_dragon");
    expect(cola!.roles).toContain("cola");
  });
});

describe("brand normalization + alias tolerance", () => {
  it("collapses spelling variants and keeps them as searchable aliases", () => {
    // Every flavor's brand resolves, and brands carry no duplicate canonical names.
    const byName = new Map(seedBrands.map((b) => [b.name.toLowerCase(), b]));
    // Adalya absorbed ADALYA / adayla — the variants live on as aliases.
    const adalya = byName.get("adalya");
    expect(adalya).toBeDefined();
    const aliasNorms = adalya!.aliases.map((a) => a.toLowerCase().replace(/[^a-z0-9]/g, ""));
    expect(aliasNorms).toContain("adayla");
    // No two brands share a normalized name (variants were merged, not duplicated).
    const norms = seedBrands.map((b) => b.name.toLowerCase().replace(/[^a-z0-9]/g, ""));
    expect(new Set(norms).size).toBe(norms.length);
  });
});

describe("generated flavor seed", () => {
  it("has unique ids and resolvable brands", () => {
    const ids = new Set(seedFlavors.map((f) => f.id));
    expect(ids.size).toBe(seedFlavors.length);
    const brandIds = new Set(seedBrands.map((b) => b.id));
    for (const f of seedFlavors) {
      expect(brandIds.has(f.brandId), `${f.id} → ${f.brandId}`).toBe(true);
    }
  });
});
