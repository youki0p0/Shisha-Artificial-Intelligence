import { TroubleshootingRule } from "@/domain/types";

const T = "2025-01-01T00:00:00.000Z";

/** Curated troubleshooting rules; matched against the produced recipe. */
export const seedTroubleshootingRules: TroubleshootingRule[] = [
  {
    id: "ts_cooling_overload",
    symptom: "Cooling too strong / numb throat",
    whenTagsAny: ["cooling", "mint"],
    whenCoolingOver: 6,
    suggestion:
      "Cut mint/cooling by ~1g or move it to the top layer only. Cooling masks flavor when overdone.",
    createdAt: T,
    updatedAt: T,
  },
  {
    id: "ts_too_heavy",
    symptom: "Too heavy / headachy",
    whenTagsAny: ["heavy", "dark-leaf"],
    whenHeavinessOver: 7,
    suggestion:
      "Reduce the heavy base, add a bright citrus/fruit top-note, and lower coal count.",
    createdAt: T,
    updatedAt: T,
  },
  {
    id: "ts_too_sweet",
    symptom: "Cloyingly sweet",
    whenTagsAny: ["dessert", "candy"],
    whenSweetnessOver: 8,
    suggestion:
      "Add tea/citrus structure or reduce dessert grams to balance the sweetness.",
    createdAt: T,
    updatedAt: T,
  },
  {
    id: "ts_harsh",
    symptom: "Harsh / burnt taste",
    whenTagsAny: ["green", "tea"],
    suggestion:
      "Delicate tea/green notes scorch easily — use a fluffy pack, fewer coals, and a longer warm-up.",
    createdAt: T,
    updatedAt: T,
  },
  {
    id: "ts_weak_flavor",
    symptom: "Weak / muddy flavor",
    whenTagsAny: [],
    suggestion:
      "Too many flavors blur each other. Keep to 2-3 clear roles (main + support + base).",
    createdAt: T,
    updatedAt: T,
  },
];
