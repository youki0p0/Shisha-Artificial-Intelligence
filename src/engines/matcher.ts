/**
 * Matcher — maps a raw text line (from OCR or web search) to brand / flavor /
 * size candidates and a confidence score. Pure, no AI.
 *
 * This is the "database matching" + "confidence scoring" stage of the
 * pipeline. Results are ALWAYS candidates for manual review, never confirmed.
 */
import { Brand, FlavorMaster } from "@/domain/types";
import { normalizeText } from "@/lib/utils";

export type MatchResult = {
  rawText: string;
  detectedBrand?: string;
  detectedFlavorName?: string;
  detectedAmountGram?: number;
  matchedFlavorMasterId?: string;
  matchConfidence: number;
};

/** Extract a gram amount like "50g" / "250 g" / "100ｇ". */
export function extractAmountGram(text: string): number | undefined {
  const m = normalizeText(text).match(/(\d{1,4})g/);
  if (!m) return undefined;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : undefined;
}

function bestBrand(text: string, brands: Brand[]): Brand | undefined {
  const n = normalizeText(text);
  let best: { brand: Brand; len: number } | undefined;
  for (const brand of brands) {
    for (const surface of [brand.name, ...brand.aliases]) {
      const ns = normalizeText(surface);
      if (ns && n.includes(ns)) {
        if (!best || ns.length > best.len) best = { brand, len: ns.length };
      }
    }
  }
  return best?.brand;
}

function bestFlavor(
  text: string,
  flavors: FlavorMaster[],
  brandId?: string,
): { flavor: FlavorMaster; len: number } | undefined {
  const n = normalizeText(text);
  let best: { flavor: FlavorMaster; len: number } | undefined;
  for (const flavor of flavors) {
    const surfaces = [flavor.name, flavor.displayNameJa ?? "", ...flavor.aliases];
    for (const surface of surfaces) {
      const ns = normalizeText(surface);
      if (ns && n.includes(ns)) {
        // Prefer flavors belonging to the detected brand.
        const lenScore = ns.length + (brandId && flavor.brandId === brandId ? 2 : 0);
        if (!best || lenScore > best.len) best = { flavor, len: lenScore };
      }
    }
  }
  return best;
}

export function matchText(
  rawText: string,
  brands: Brand[],
  flavors: FlavorMaster[],
): MatchResult {
  const detectedAmountGram = extractAmountGram(rawText);
  const brand = bestBrand(rawText, brands);
  const flavorHit = bestFlavor(rawText, flavors, brand?.id);

  let matchConfidence = 0;
  if (brand) matchConfidence += 0.4;
  if (flavorHit) matchConfidence += 0.5;
  if (detectedAmountGram !== undefined) matchConfidence += 0.1;
  // Bonus when the matched flavor's brand agrees with the detected brand.
  if (brand && flavorHit && flavorHit.flavor.brandId === brand.id) {
    matchConfidence = Math.min(1, matchConfidence + 0.1);
  }

  return {
    rawText,
    detectedBrand: brand?.name,
    detectedFlavorName: flavorHit?.flavor.name,
    detectedAmountGram,
    matchedFlavorMasterId: flavorHit?.flavor.id,
    matchConfidence: Number(Math.min(1, matchConfidence).toFixed(2)),
  };
}
