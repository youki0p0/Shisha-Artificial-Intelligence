/**
 * RecipeEngine — turns a TasteIntent + flavor data + user context into a
 * complete Recipe. Pure function: no DB, no AI. The caller supplies all data.
 *
 * Pipeline:
 *   score candidates -> select diverse set -> allocate grams -> build layers
 *   -> plan heat -> build timeline -> run troubleshooting -> assemble Recipe.
 */
import {
  FlavorMaster,
  HeatTemplate,
  Recipe,
  RecipeItem,
  RecipeMode,
  SynergyRule,
  TasteIntent,
  TasteVector,
  TroubleshootingRule,
} from "@/domain/types";
import { flavorToVector, zeroVector } from "@/domain/taste";
import { newId, newShareId, nowIso } from "@/lib/ids";
import { scoreFlavor, ScoredFlavor, synergyBonus } from "./scoring";
import { buildLayers, LayerInput } from "./layering";
import { planHeat } from "./heat";

export type GenerateRecipeInput = {
  userId: string;
  intent: TasteIntent;
  /** All FlavorMaster candidates the engine may use. */
  allFlavors: FlavorMaster[];
  /** Inventory flavorMasterIds the user actually owns. */
  inventoryIds: Set<string>;
  mode: RecipeMode;
  totalGram: number;
  synergyRules: SynergyRule[];
  heatTemplates: HeatTemplate[];
  troubleshootingRules: TroubleshootingRule[];
};

export type GeneratedRecipe = {
  recipe: Recipe;
  /** Substitution suggestions for missing flavors (missingId -> alternatives). */
  missingAlternatives: Array<{
    missing: FlavorMaster;
    alternatives: FlavorMaster[];
  }>;
};

const MODE_MAX_FLAVORS: Record<RecipeMode, number> = {
  beginner: 2,
  inventory_only: 3,
  allow_missing: 3,
  advanced: 4,
};

export function generateRecipe(input: GenerateRecipeInput): GeneratedRecipe {
  const {
    userId,
    intent,
    allFlavors,
    inventoryIds,
    mode,
    totalGram,
    synergyRules,
    heatTemplates,
    troubleshootingRules,
  } = input;

  const beginnerMode = mode === "beginner";

  // 1. Build candidate pool.
  const pool =
    mode === "inventory_only"
      ? allFlavors.filter((f) => inventoryIds.has(f.id))
      : allFlavors;

  // 2. Score the pool (synergy is evaluated incrementally during selection).
  const scoreAll = (selected: FlavorMaster[]): ScoredFlavor[] =>
    pool
      .filter((f) => !selected.some((s) => s.id === f.id))
      .map((f) =>
        scoreFlavor(f, {
          intent,
          inventoryIds,
          selected,
          synergyRules,
          beginnerMode,
        }),
      )
      .sort((a, b) => b.score - a.score);

  // 3. Greedy diverse selection: pick best, then re-score for synergy, avoid
  //    duplicate primary roles so we get main + support + base variety.
  const maxFlavors = MODE_MAX_FLAVORS[mode];
  const selected: FlavorMaster[] = [];
  const usedPrimaryRoles = new Set<string>();

  while (selected.length < maxFlavors) {
    const ranked = scoreAll(selected);
    if (ranked.length === 0) break;

    // Prefer a candidate whose primary role we don't have yet (role diversity).
    const next =
      ranked.find((c) => {
        const primary = c.flavor.roles[0];
        return primary && !usedPrimaryRoles.has(primary);
      }) ?? ranked[0];

    // Stop early if the best remaining candidate is clearly weak.
    if (selected.length >= 2 && next.score < 1.5) break;

    selected.push(next.flavor);
    if (next.flavor.roles[0]) usedPrimaryRoles.add(next.flavor.roles[0]);
  }

  // Fallback: if nothing selected (empty inventory etc.), take top of pool.
  if (selected.length === 0 && pool.length > 0) {
    selected.push(scoreAll([])[0].flavor);
  }

  // 4. Allocate grams proportional to final scores (with sensible minimums).
  const finalScores = selected.map((f) =>
    scoreFlavor(f, {
      intent,
      inventoryIds,
      selected: selected.filter((s) => s.id !== f.id),
      synergyRules,
      beginnerMode,
    }),
  );
  const items = allocateGrams(finalScores, totalGram, inventoryIds);

  // 5. Layers.
  const layerInputs: LayerInput[] = items
    .map((it) => ({
      flavor: selected.find((f) => f.id === it.flavorMasterId)!,
      grams: it.grams,
    }))
    .filter((x) => x.flavor);
  const layers = buildLayers(layerInputs);

  // 6. Heat plan.
  const heatManagement = planHeat({
    totalGram,
    flavors: selected,
    templates: heatTemplates,
    beginnerMode,
  });

  // 7. Aggregate recipe vector + tags for timeline / troubleshooting.
  const aggVector = aggregateVector(layerInputs);
  const allTags = Array.from(new Set(selected.flatMap((f) => f.tags)));
  const allRoles = Array.from(new Set(selected.flatMap((f) => f.roles)));

  const flavorTimeline = buildTimeline(layers);
  const troubleshooting = runTroubleshooting(
    troubleshootingRules,
    allTags,
    allRoles,
    aggVector,
    selected.length,
  );

  // 8. Score breakdown (summed components across items).
  const scoreBreakdown = mergeBreakdowns(finalScores);
  const totalScore = round(finalScores.reduce((a, b) => a + b.score, 0));

  // 9. Missing-flavor alternatives (only meaningful when missing items exist).
  const missingAlternatives = buildMissingAlternatives(
    items,
    selected,
    allFlavors,
    inventoryIds,
  );

  const title = buildTitle(intent, selected);
  const concept = buildConcept(intent, selected, mode);

  const recipe: Recipe = {
    id: newId("recipe"),
    userId,
    title,
    concept,
    totalGram,
    items,
    layers,
    heatManagement,
    flavorTimeline,
    troubleshooting,
    score: totalScore,
    scoreBreakdown,
    tags: intent.conceptTags.concat(allTags).slice(0, 12),
    visibility: "private",
    shareId: newShareId(),
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  return { recipe, missingAlternatives };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function allocateGrams(
  scored: ScoredFlavor[],
  totalGram: number,
  inventoryIds: Set<string>,
): RecipeItem[] {
  const positive = scored.map((s) => Math.max(s.score, 0.5));
  const sum = positive.reduce((a, b) => a + b, 0) || 1;

  // Raw proportional grams, rounded to 0.5g.
  let grams = positive.map((p) => roundHalf((p / sum) * totalGram));

  // Fix rounding drift so grams sum exactly to totalGram.
  let drift = round(totalGram - grams.reduce((a, b) => a + b, 0));
  let i = 0;
  while (Math.abs(drift) >= 0.5 && grams.length > 0) {
    const idx = i % grams.length;
    grams[idx] = round(grams[idx] + Math.sign(drift) * 0.5);
    drift = round(drift - Math.sign(drift) * 0.5);
    i++;
  }

  return scored.map((s, idx) => {
    const f = s.flavor;
    const g = Math.max(grams[idx], 0.5);
    return {
      flavorMasterId: f.id,
      displayName: f.displayNameJa ?? f.name,
      brandName: undefined,
      role: f.roles[0] ?? "support",
      grams: g,
      percentage: round((g / totalGram) * 100),
      reason: buildItemReason(s),
      missing: !inventoryIds.has(f.id),
    };
  });
}

function buildItemReason(s: ScoredFlavor): string {
  const top = Object.entries(s.breakdown)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([k]) => HUMAN_REASON[k] ?? k);
  const base = top.length
    ? `Chosen for ${top.join(" + ")}.`
    : "Chosen as a balancing flavor.";
  return s.inInventory ? base : `${base} (Not in your inventory yet.)`;
}

const HUMAN_REASON: Record<string, string> = {
  tasteVectorMatch: "matching your taste profile",
  roleMatch: "filling a needed role",
  tagMatch: "matching requested tags",
  inventoryBonus: "being in your inventory",
  synergyBonus: "synergy with the other flavors",
  layerAffinityBonus: "clear layering position",
  beginnerBonus: "being beginner-friendly",
  conceptBonus: "fitting the concept",
};

function aggregateVector(items: LayerInput[]): TasteVector {
  const total = items.reduce((a, b) => a + b.grams, 0) || 1;
  const out = zeroVector();
  for (const { flavor, grams } of items) {
    const v = flavorToVector(flavor);
    for (const k of Object.keys(out) as (keyof TasteVector)[]) {
      out[k] += (v[k] * grams) / total;
    }
  }
  for (const k of Object.keys(out) as (keyof TasteVector)[]) {
    out[k] = round(out[k]);
  }
  return out;
}

function buildTimeline(layers: ReturnType<typeof buildLayers>) {
  const names = (arr: { displayName: string }[]) =>
    arr.map((x) => x.displayName).join(", ") || "—";
  return {
    phases: [
      {
        phase: "early" as const,
        label: "序盤 (0-10分)",
        description: `Top notes lead: ${names(layers.top)}. Bright, aromatic first impression.`,
      },
      {
        phase: "mid" as const,
        label: "中盤 (10-25分)",
        description: `Core develops: ${names(layers.middle)}. The main character of the mix.`,
      },
      {
        phase: "late" as const,
        label: "終盤 (25分+)",
        description: `Base lingers: ${names(layers.bottom)}. Heavier, longer aftertaste.`,
      },
    ],
  };
}

function runTroubleshooting(
  rules: TroubleshootingRule[],
  tags: string[],
  roles: string[],
  vector: TasteVector,
  flavorCount: number,
) {
  const tagSet = new Set([...tags, ...roles]);
  const out: { symptom: string; suggestion: string }[] = [];
  for (const rule of rules) {
    const tagHit =
      rule.whenTagsAny.length > 0 && rule.whenTagsAny.some((t) => tagSet.has(t));
    const hasThreshold =
      rule.whenCoolingOver !== undefined ||
      rule.whenHeavinessOver !== undefined ||
      rule.whenSweetnessOver !== undefined;
    const coolingHit =
      rule.whenCoolingOver !== undefined && vector.cooling > rule.whenCoolingOver;
    const heavyHit =
      rule.whenHeavinessOver !== undefined &&
      vector.heaviness > rule.whenHeavinessOver;
    const sweetHit =
      rule.whenSweetnessOver !== undefined &&
      vector.sweetness > rule.whenSweetnessOver;

    let fire = false;
    if (hasThreshold) {
      // Threshold rule: any threshold exceeded triggers it.
      fire = coolingHit || heavyHit || sweetHit;
    } else if (rule.whenTagsAny.length > 0) {
      // Tag-only rule.
      fire = tagHit;
    } else {
      // Conditionless catch-all (e.g. "weak/muddy flavor"): only when the
      // mix has many flavors that may blur each other.
      fire = flavorCount >= 4;
    }

    if (fire) out.push({ symptom: rule.symptom, suggestion: rule.suggestion });
  }
  return out;
}

function buildMissingAlternatives(
  items: RecipeItem[],
  selected: FlavorMaster[],
  allFlavors: FlavorMaster[],
  inventoryIds: Set<string>,
) {
  const out: { missing: FlavorMaster; alternatives: FlavorMaster[] }[] = [];
  for (const item of items.filter((i) => i.missing)) {
    const missing = selected.find((f) => f.id === item.flavorMasterId);
    if (!missing) continue;
    const target = flavorToVector(missing);
    const alternatives = allFlavors
      .filter((f) => inventoryIds.has(f.id) && f.id !== missing.id)
      .map((f) => ({ f, dist: vectorDistance(target, flavorToVector(f)) }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 2)
      .map((x) => x.f);
    out.push({ missing, alternatives });
  }
  return out;
}

function vectorDistance(a: TasteVector, b: TasteVector): number {
  let d = 0;
  for (const k of Object.keys(a) as (keyof TasteVector)[]) {
    d += (a[k] - b[k]) ** 2;
  }
  return Math.sqrt(d);
}

function mergeBreakdowns(scored: ScoredFlavor[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const s of scored) {
    for (const [k, v] of Object.entries(s.breakdown)) {
      out[k] = round((out[k] ?? 0) + v);
    }
  }
  return out;
}

function buildTitle(intent: TasteIntent, selected: FlavorMaster[]): string {
  const lead = selected[0]?.displayNameJa ?? selected[0]?.name ?? "ミックス";
  const concept = intent.conceptTags[0] ?? "";
  return concept ? `${concept}・${lead}ブレンド` : `${lead}ブレンド`;
}

function buildConcept(
  intent: TasteIntent,
  selected: FlavorMaster[],
  mode: RecipeMode,
): string {
  const tags = intent.conceptTags.join(" / ") || "バランス重視";
  const names = selected
    .map((f) => f.displayNameJa ?? f.name)
    .join(" + ");
  const modeLabel: Record<RecipeMode, string> = {
    inventory_only: "在庫のみ",
    allow_missing: "不足品も許容",
    beginner: "初心者向け",
    advanced: "上級者向け",
  };
  return `${tags} をテーマにした ${names}。(${modeLabel[mode]})`;
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
function roundHalf(n: number): number {
  return Math.round(n * 2) / 2;
}
