import { SynergyRule } from "@/domain/types";

const T = "2025-01-01T00:00:00.000Z";

/** Synergy / clash rules used by the scoring engine. */
export const seedSynergyRules: SynergyRule[] = [
  {
    id: "syn_tea_pear",
    name: "Tea + Pear (hotel-kei classic)",
    whenRolesAll: [],
    whenTagsAny: ["tea", "pear"],
    whenFlavorIdsAny: [],
    bonus: 1.5,
    description: "Tea and pear are a classic refined pairing.",
    createdAt: T,
    updatedAt: T,
  },
  {
    id: "syn_cola_citrus",
    name: "Cola + Citrus lift",
    whenRolesAll: [],
    whenTagsAny: ["cola", "citrus"],
    whenFlavorIdsAny: [],
    bonus: 1.2,
    description: "Citrus brightens a cola base.",
    createdAt: T,
    updatedAt: T,
  },
  {
    id: "syn_cream_fruit",
    name: "Cream + Fruit dessert",
    whenRolesAll: [],
    whenTagsAny: ["cream", "fruit"],
    whenFlavorIdsAny: [],
    bonus: 1.0,
    description: "Cream rounds fruit into a dessert profile.",
    createdAt: T,
    updatedAt: T,
  },
  {
    id: "syn_vanilla_base",
    name: "Vanilla base lengthening",
    whenRolesAll: [],
    whenTagsAny: ["vanilla"],
    whenFlavorIdsAny: [],
    bonus: 0.8,
    description: "Vanilla extends aftertaste and smooths the mix.",
    createdAt: T,
    updatedAt: T,
  },
  {
    id: "syn_green_savory_clash",
    name: "Green tea + savory clash",
    whenRolesAll: ["green", "saltiness"],
    whenTagsAny: [],
    whenFlavorIdsAny: [],
    bonus: -1.5,
    description: "Delicate green tea clashes with savory/salty notes.",
    createdAt: T,
    updatedAt: T,
  },
];
