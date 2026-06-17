/**
 * ScoringEngine — pure functions that score a FlavorMaster against a
 * TasteIntent and the user's context (inventory, mode, already-picked flavors).
 *
 * Reference formula (see README):
 *   score = tasteVectorMatch*3 + roleMatch*2 + tagMatch*1.5
 *         + inventoryBonus*2 + synergyBonus*2 + layerAffinityBonus
 *         + beginnerBonus + conceptBonus
 *         - avoidRolePenalty - constraintViolationPenalty - overpowerPenalty
 *         - coolingOverloadPenalty - excessSweetnessPenalty - excessHeavinessPenalty
 */
import {
  FlavorMaster,
  SynergyRule,
  TasteIntent,
} from "@/domain/types";
import {
  constraintViolation,
  flavorToVector,
  vectorMatch,
} from "@/domain/taste";

export type ScoreContext = {
  intent: TasteIntent;
  /** Set of flavorMasterIds currently in the user's inventory. */
  inventoryIds: Set<string>;
  /** Flavors already chosen for the mix (for synergy / overlap). */
  selected: FlavorMaster[];
  synergyRules: SynergyRule[];
  beginnerMode: boolean;
};

export type ScoredFlavor = {
  flavor: FlavorMaster;
  score: number;
  breakdown: Record<string, number>;
  inInventory: boolean;
};

function fraction(items: string[], allowed: Set<string>): number {
  if (items.length === 0) return 0;
  const hits = items.filter((i) => allowed.has(i)).length;
  return hits / items.length;
}

/** Synergy bonus for adding `flavor` given the already-selected flavors. */
export function synergyBonus(
  flavor: FlavorMaster,
  selected: FlavorMaster[],
  rules: SynergyRule[],
): number {
  if (selected.length === 0) return 0;
  let bonus = 0;
  const group = [...selected, flavor];
  const tagSet = new Set(group.flatMap((f) => f.tags));
  const roleSet = new Set(group.flatMap((f) => f.roles));
  const idSet = new Set(group.map((f) => f.id));

  for (const rule of rules) {
    const rolesOk =
      rule.whenRolesAll.length === 0 ||
      rule.whenRolesAll.every((r) => roleSet.has(r));
    const tagsOk =
      rule.whenTagsAny.length === 0 ||
      rule.whenTagsAny.some((t) => tagSet.has(t));
    const idsOk =
      rule.whenFlavorIdsAny.length === 0 ||
      rule.whenFlavorIdsAny.some((id) => idSet.has(id));

    // A rule fires only if every *specified* matcher matches, and at least
    // one matcher was specified.
    const specified =
      rule.whenRolesAll.length > 0 ||
      rule.whenTagsAny.length > 0 ||
      rule.whenFlavorIdsAny.length > 0;
    if (specified && rolesOk && tagsOk && idsOk) {
      // Only count the synergy if the new flavor actually contributes to it.
      const flavorContributes =
        rule.whenRolesAll.some((r) => flavor.roles.includes(r)) ||
        rule.whenTagsAny.some((t) => flavor.tags.includes(t)) ||
        rule.whenFlavorIdsAny.includes(flavor.id);
      if (flavorContributes) bonus += rule.bonus;
    }
  }
  return bonus;
}

export function scoreFlavor(
  flavor: FlavorMaster,
  ctx: ScoreContext,
): ScoredFlavor {
  const { intent } = ctx;
  const vec = flavorToVector(flavor);
  const breakdown: Record<string, number> = {};

  // --- Positive components -------------------------------------------------
  const tasteVectorMatch = vectorMatch(intent.vector, vec); // 0..1
  breakdown.tasteVectorMatch = round(tasteVectorMatch * 3.0);

  const preferredRoleSet = new Set(intent.preferredRoles);
  const roleMatch = fraction(flavor.roles, preferredRoleSet);
  breakdown.roleMatch = round(roleMatch * 2.0);

  const preferredTagSet = new Set(intent.preferredTags);
  const tagMatch = fraction(flavor.tags, preferredTagSet);
  breakdown.tagMatch = round(tagMatch * 1.5);

  const inInventory = ctx.inventoryIds.has(flavor.id);
  breakdown.inventoryBonus = round((inInventory ? 1 : 0) * 2.0);

  const synergy = synergyBonus(flavor, ctx.selected, ctx.synergyRules);
  breakdown.synergyBonus = round(synergy * 2.0 * 0.5); // rule bonus already ~1..1.5

  const layerAffinityBonus =
    Math.max(
      flavor.layerAffinity.top,
      flavor.layerAffinity.middle,
      flavor.layerAffinity.bottom,
    ) / 10;
  breakdown.layerAffinityBonus = round(layerAffinityBonus);

  const beginnerBonus = ctx.beginnerMode ? (flavor.beginnerFriendly / 10) * 2 : 0;
  breakdown.beginnerBonus = round(beginnerBonus);

  const conceptBonus = conceptCompatibility(flavor, intent);
  breakdown.conceptBonus = round(conceptBonus);

  // --- Penalties -----------------------------------------------------------
  const avoidRoleSet = new Set(intent.avoidRoles);
  const avoidRoleHits = flavor.roles.filter((r) => avoidRoleSet.has(r)).length;
  const avoidTagSet = new Set(intent.avoidTags);
  const avoidTagHits = flavor.tags.filter((t) => avoidTagSet.has(t)).length;
  const avoidRolePenalty = avoidRoleHits * 1.5 + avoidTagHits * 1.0;
  breakdown.avoidRolePenalty = round(-avoidRolePenalty);

  const constraintPenalty =
    constraintViolation(intent.constraints, vec) * 3.0;
  breakdown.constraintViolationPenalty = round(-constraintPenalty);

  // Overpower: a very aromatic / structural flavor used where intent is gentle.
  const aroma = flavor.aromaStrength ?? 5;
  const overpowerPenalty =
    ctx.beginnerMode && aroma > 7 ? (aroma - 7) * 0.3 : 0;
  breakdown.overpowerPenalty = round(-overpowerPenalty);

  // Targeted "too much" penalties only when intent did NOT ask for them.
  const coolingOverloadPenalty =
    intent.vector.cooling < 3 && vec.cooling > 6 ? (vec.cooling - 6) * 0.4 : 0;
  breakdown.coolingOverloadPenalty = round(-coolingOverloadPenalty);

  const excessSweetnessPenalty =
    intent.constraints.sweetnessMax !== undefined &&
    vec.sweetness > intent.constraints.sweetnessMax
      ? (vec.sweetness - intent.constraints.sweetnessMax) * 0.3
      : 0;
  breakdown.excessSweetnessPenalty = round(-excessSweetnessPenalty);

  const excessHeavinessPenalty =
    intent.constraints.heavinessMax !== undefined &&
    vec.heaviness > intent.constraints.heavinessMax
      ? (vec.heaviness - intent.constraints.heavinessMax) * 0.3
      : 0;
  breakdown.excessHeavinessPenalty = round(-excessHeavinessPenalty);

  const score = round(
    Object.values(breakdown).reduce((a, b) => a + b, 0),
  );

  return { flavor, score, breakdown, inInventory };
}

function conceptCompatibility(flavor: FlavorMaster, intent: TasteIntent): number {
  // Concept tags are the matched taste-word keywords (e.g. ホテル系).
  // Reward flavors whose tags overlap conceptually with hotel/adult/etc.
  const conceptToTags: Record<string, string[]> = {
    ホテル系: ["hotel", "tea", "adult"],
    大人っぽい: ["adult", "structure", "tea"],
    デザート系: ["dessert", "cream"],
    フルーツ系: ["fruit"],
    コーラ系: ["cola"],
  };
  let bonus = 0;
  for (const concept of intent.conceptTags) {
    const wanted = conceptToTags[concept];
    if (!wanted) continue;
    if (wanted.some((t) => flavor.tags.includes(t))) bonus += 0.5;
  }
  return Math.min(bonus, 1.5);
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
