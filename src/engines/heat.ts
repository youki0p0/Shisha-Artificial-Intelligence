/**
 * HeatManagementEngine — selects the best HeatTemplate for a mix and produces
 * a HeatManagementPlan. Pure function over the curated HeatTemplate DB.
 */
import {
  FlavorMaster,
  HeatManagementPlan,
  HeatTemplate,
} from "@/domain/types";

export type HeatContext = {
  totalGram: number;
  flavors: FlavorMaster[];
  templates: HeatTemplate[];
  beginnerMode: boolean;
};

function scoreTemplate(template: HeatTemplate, ctx: HeatContext): number {
  let score = 0;
  const [min, max] = template.totalGramRange;
  if (ctx.totalGram >= min && ctx.totalGram <= max) score += 3;
  else score -= Math.min(3, Math.abs(ctx.totalGram - (min + max) / 2) / 2);

  const tags = new Set(ctx.flavors.flatMap((f) => f.tags));
  const roleTags = new Set(ctx.flavors.flatMap((f) => f.roles));
  for (const t of template.suitableForTags) {
    if (tags.has(t) || roleTags.has(t as never)) score += 1;
  }

  // Delicate tea/green => prefer fluffy / lower-heat templates.
  const delicate = ctx.flavors.some(
    (f) => f.roles.includes("green") || (f.roles.includes("tea") && f.heatTolerance <= 4),
  );
  if (delicate && template.suitableForTags.some((t) => ["tea", "green", "light"].includes(t))) {
    score += 1.5;
  }

  // Heavy mixes => prefer heavier templates.
  const heavy = ctx.flavors.some((f) => f.heaviness >= 7);
  if (heavy && template.suitableForTags.includes("heavy")) score += 1.5;

  if (ctx.beginnerMode && template.suitableForTags.includes("beginner")) {
    score += 2;
  }
  return score;
}

export function planHeat(ctx: HeatContext): HeatManagementPlan {
  const ranked = [...ctx.templates]
    .map((t) => ({ t, s: scoreTemplate(t, ctx) }))
    .sort((a, b) => b.s - a.s);
  const best = ranked[0]?.t;

  if (!best) {
    return {
      templateName: "Generic HMD setup",
      bowlType: "Phunnel",
      hmdOrFoil: "HMD",
      charcoalType: "26mm coconut x2-3",
      start: "Warm up fully before pulling.",
      after10min: "Manage coal position to avoid scorching.",
      after25min: "Reduce heat to extend the session.",
      notes: "No matching template; using a safe default.",
    };
  }

  const delicateNote = ctx.flavors.some(
    (f) => f.roles.includes("green") || f.roles.includes("tea"),
  )
    ? " Contains delicate tea/green — favor a fluffy pack and fewer coals."
    : "";

  return {
    templateId: best.id,
    templateName: best.name,
    bowlType: best.bowlType,
    hmdOrFoil: best.hmdOrFoil,
    charcoalType: best.charcoalType,
    start: best.start,
    after10min: best.after10min,
    after25min: best.after25min,
    notes: best.notes + delicateNote,
  };
}
