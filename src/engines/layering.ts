/**
 * LayeringEngine — assigns chosen flavors to top / middle / bottom layers.
 *
 * Rules:
 *  - top: aroma, citrus, light tea, controlled cooling
 *  - middle: main flavor + structure
 *  - bottom: base, vanilla, cream, heavy body, long aftertaste
 *  - delicate green/tea should not sit directly under the coals (keep cooler)
 *  - heavy dessert flavors usually go lower
 *  - cooling is limited and clearly explained
 */
import { FlavorMaster, FlavorRole, RecipeLayerItem } from "@/domain/types";

export type LayerInput = {
  flavor: FlavorMaster;
  grams: number;
};

export type Layers = {
  top: RecipeLayerItem[];
  middle: RecipeLayerItem[];
  bottom: RecipeLayerItem[];
};

const TOP_ROLES: FlavorRole[] = [
  "aroma",
  "citrus",
  "top-note",
  "cooling",
  "mint",
];
const BOTTOM_ROLES: FlavorRole[] = [
  "base",
  "bottom-note",
  "cream",
  "dessert",
];

function pickLayer(flavor: FlavorMaster): "top" | "middle" | "bottom" {
  // Strong role signals first.
  if (flavor.roles.some((r) => BOTTOM_ROLES.includes(r)) && flavor.heaviness >= 5) {
    return "bottom";
  }
  if (flavor.roles.some((r) => TOP_ROLES.includes(r)) && flavor.heaviness <= 4) {
    return "top";
  }
  // Otherwise fall back to declared layer affinity.
  const { top, middle, bottom } = flavor.layerAffinity;
  const max = Math.max(top, middle, bottom);
  if (max === bottom) return "bottom";
  if (max === top) return "top";
  return "middle";
}

function reason(flavor: FlavorMaster, layer: "top" | "middle" | "bottom"): string {
  switch (layer) {
    case "top":
      return `${flavor.name}: aromatic/bright note — keep on top, away from direct heat.`;
    case "bottom":
      return `${flavor.name}: heavy/creamy base — sits at the bottom for body and long aftertaste.`;
    default:
      return `${flavor.name}: main/structure — middle layer carries the core of the mix.`;
  }
}

export function buildLayers(items: LayerInput[]): Layers {
  const layers: Layers = { top: [], middle: [], bottom: [] };
  for (const { flavor, grams } of items) {
    const layer = pickLayer(flavor);
    layers[layer].push({
      flavorMasterId: flavor.id,
      displayName: flavor.displayNameJa ?? flavor.name,
      grams,
      reason: reason(flavor, layer),
    });
  }
  // Guarantee the middle isn't empty: if everything went top/bottom, pull the
  // heaviest top item (or lightest bottom) into the middle.
  if (layers.middle.length === 0) {
    const donor = layers.top.pop() ?? layers.bottom.shift();
    if (donor) layers.middle.push(donor);
  }
  return layers;
}
