import { describe, expect, it } from "vitest";
import { extractAmountGram, matchText } from "./matcher";
import { seedBrands } from "@/data/seed/brands";
import { seedFlavors } from "@/data/seed/flavors";

describe("matcher", () => {
  it("extracts gram amounts", () => {
    expect(extractAmountGram("Deus Earl Grey 50g")).toBe(50);
    expect(extractAmountGram("Al Fakher Mint 250 g")).toBe(250);
    expect(extractAmountGram("no amount here")).toBeUndefined();
  });

  it("matches brand + flavor + size with high confidence", () => {
    const m = matchText("Deus Earl Grey 50g", seedBrands, seedFlavors);
    expect(m.detectedBrand).toBe("Deus");
    expect(m.matchedFlavorMasterId).toBe("fm_deus_earlgrey");
    expect(m.detectedAmountGram).toBe(50);
    expect(m.matchConfidence).toBeGreaterThanOrEqual(0.8);
  });

  it("returns low confidence for unknown text", () => {
    const m = matchText("謎の新作フレーバー 50g", seedBrands, seedFlavors);
    expect(m.matchedFlavorMasterId).toBeUndefined();
    expect(m.matchConfidence).toBeLessThan(0.5);
  });
});
