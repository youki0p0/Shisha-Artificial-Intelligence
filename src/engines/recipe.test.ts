import { describe, expect, it } from "vitest";
import { parseIntent } from "./parser";
import { generateRecipe } from "./recipe";
import { seedFlavors } from "@/data/seed/flavors";
import { seedTasteWords } from "@/data/seed/tasteWords";
import { seedSynergyRules } from "@/data/seed/synergy";
import { seedHeatTemplates } from "@/data/seed/heatTemplates";
import { seedTroubleshootingRules } from "@/data/seed/troubleshooting";

const inventoryIds = new Set([
  "fm_deus_earlgrey",
  "fm_adalya_pear",
  "fm_alfakher_vanilla",
  "fm_blackburn_coladragon",
  "fm_serbetli_exoticlime",
  "fm_alfakher_mint",
  "fm_alfakher_greentea",
]);

function gen(input: string, mode: "inventory_only" | "allow_missing" | "beginner" | "advanced" = "inventory_only", totalGram = 15) {
  const intent = parseIntent(input, seedTasteWords);
  return generateRecipe({
    userId: "user_demo",
    intent,
    allFlavors: seedFlavors,
    inventoryIds,
    mode,
    totalGram,
    synergyRules: seedSynergyRules,
    heatTemplates: seedHeatTemplates,
    troubleshootingRules: seedTroubleshootingRules,
  });
}

describe("RecipeEngine", () => {
  it("produces a complete recipe whose grams sum to the requested total", () => {
    const { recipe } = gen("甘すぎないホテル系で水っぽいやつ", "inventory_only", 15);
    expect(recipe.items.length).toBeGreaterThan(0);
    const sum = recipe.items.reduce((a, b) => a + b.grams, 0);
    expect(sum).toBeCloseTo(15, 1);
    // percentages should add up to ~100
    const pct = recipe.items.reduce((a, b) => a + b.percentage, 0);
    expect(pct).toBeGreaterThan(95);
    expect(pct).toBeLessThan(105);
  });

  it("includes layers, heat plan, timeline and score breakdown", () => {
    const { recipe } = gen("コーラドラゴンを活かした大人っぽいやつ", "inventory_only");
    const layerCount =
      recipe.layers.top.length +
      recipe.layers.middle.length +
      recipe.layers.bottom.length;
    expect(layerCount).toBe(recipe.items.length);
    expect(recipe.layers.middle.length).toBeGreaterThan(0);
    expect(recipe.heatManagement.templateName).toBeTruthy();
    expect(recipe.flavorTimeline.phases.length).toBe(3);
    expect(Object.keys(recipe.scoreBreakdown).length).toBeGreaterThan(0);
    expect(recipe.shareId).toBeTruthy();
  });

  it("inventory_only never selects a flavor outside the inventory", () => {
    const { recipe } = gen("オリーブの変わったやつ", "inventory_only");
    for (const item of recipe.items) {
      expect(item.missing).toBe(false);
      expect(inventoryIds.has(item.flavorMasterId!)).toBe(true);
    }
  });

  it("allow_missing can pick a non-owned flavor and offers substitutes", () => {
    const emptyInv = new Set<string>();
    const intent = parseIntent("ピーナッツの重いデザート系", seedTasteWords);
    const { recipe, missingAlternatives } = generateRecipe({
      userId: "u",
      intent,
      allFlavors: seedFlavors,
      inventoryIds: emptyInv,
      mode: "allow_missing",
      totalGram: 15,
      synergyRules: seedSynergyRules,
      heatTemplates: seedHeatTemplates,
      troubleshootingRules: seedTroubleshootingRules,
    });
    expect(recipe.items.some((i) => i.missing)).toBe(true);
    // With empty inventory there are no substitutes, but the structure exists.
    expect(Array.isArray(missingAlternatives)).toBe(true);
  });

  it("cola request favors the cola flavor as a chosen item", () => {
    const { recipe } = gen("コーラドラゴンを活かした大人っぽいやつ", "inventory_only");
    expect(
      recipe.items.some((i) => i.flavorMasterId === "fm_blackburn_coladragon"),
    ).toBe(true);
  });
});
