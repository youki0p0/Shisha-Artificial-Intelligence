// AUTO-GENERATED — do not edit by hand.
// Source: src/data/master/flavor_master.csv + derivation_spec.json
// Regenerate with: npm run flavors:build
import { Brand, FlavorMaster } from "@/domain/types";

/** Brands introduced by the curated CSV (not already in the hand seed). */
export const generatedBrands: Brand[] = [
  {
    "id": "brand_afzal",
    "name": "Afzal",
    "aliases": [],
    "notes": "Imported from LISSO flavor master CSV.",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "brand_al_amasi",
    "name": "AL AMASI",
    "aliases": [],
    "notes": "Imported from LISSO flavor master CSV.",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "brand_al_fakhamah",
    "name": "Al Fakhamah",
    "aliases": [],
    "notes": "Imported from LISSO flavor master CSV.",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "brand_debaj",
    "name": "DEBAJ",
    "aliases": [],
    "notes": "Imported from LISSO flavor master CSV.",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "brand_jent",
    "name": "Jent",
    "aliases": [],
    "notes": "Imported from LISSO flavor master CSV.",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "brand_jibiar",
    "name": "JiBiAR",
    "aliases": [],
    "notes": "Imported from LISSO flavor master CSV.",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "brand_lirra",
    "name": "LIRRA",
    "aliases": [],
    "notes": "Imported from LISSO flavor master CSV.",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "brand_mazaya",
    "name": "MAZAYA",
    "aliases": [],
    "notes": "Imported from LISSO flavor master CSV.",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "brand_starbuzz",
    "name": "StarBuzz",
    "aliases": [],
    "notes": "Imported from LISSO flavor master CSV.",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "brand_troffimofs",
    "name": "Troffimofs",
    "aliases": [],
    "notes": "Imported from LISSO flavor master CSV.",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
];

/** FlavorMaster records derived deterministically from the curated CSV. */
export const generatedFlavors: FlavorMaster[] = [
  {
    "id": "fm_blackburn_grapefruit",
    "brandId": "brand_blackburn",
    "name": "Grapefruit",
    "aliases": [],
    "category": [
      "booster"
    ],
    "roles": [
      "support",
      "top-note",
      "aroma",
      "citrus",
      "fruit",
      "saltiness"
    ],
    "tags": [
      "citrus",
      "fruit",
      "saltiness",
      "sour"
    ],
    "nicotineLevel": 3,
    "aromaStrength": 7.3,
    "sweetness": 4.6,
    "sourness": 5.5,
    "cooling": 0.5,
    "bitterness": 1.2,
    "body": 4,
    "wetness": 2.7,
    "freshness": 5.9,
    "luxury": 5.6,
    "heaviness": 2.8,
    "aftertaste": 3.8,
    "structure": 6,
    "layerAffinity": {
      "top": 5.8,
      "middle": 9.2,
      "bottom": 2.7
    },
    "heatTolerance": 6.8,
    "beginnerFriendly": 2.2,
    "soloUsability": 2.6,
    "description": "grapefruit peel feeling",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_blackburn_malibu",
    "brandId": "brand_blackburn",
    "name": "Malibu",
    "aliases": [],
    "category": [
      "body"
    ],
    "roles": [
      "main",
      "middle-note",
      "base",
      "cream"
    ],
    "tags": [
      "cream",
      "nutty"
    ],
    "nicotineLevel": 3,
    "aromaStrength": 4,
    "sweetness": 6,
    "sourness": 1.4,
    "cooling": 0.5,
    "bitterness": 0.6,
    "body": 6.1,
    "wetness": 5.7,
    "freshness": 0.6,
    "luxury": 2.9,
    "heaviness": 3.4,
    "aftertaste": 3.8,
    "structure": 3.4,
    "layerAffinity": {
      "top": 0.8,
      "middle": 10,
      "bottom": 4.9
    },
    "heatTolerance": 6.4,
    "beginnerFriendly": 5.3,
    "soloUsability": 7.9,
    "description": "sweet tropical blend",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_blackburn_peach_yogurt",
    "brandId": "brand_blackburn",
    "name": "Peach Yogurt",
    "aliases": [],
    "category": [
      "accent"
    ],
    "roles": [
      "support",
      "aroma",
      "top-note",
      "structure",
      "middle-note",
      "cream",
      "fruit",
      "saltiness"
    ],
    "tags": [
      "fruit",
      "cream",
      "saltiness",
      "sour"
    ],
    "nicotineLevel": 3,
    "aromaStrength": 5.9,
    "sweetness": 6.4,
    "sourness": 4.7,
    "cooling": 0.5,
    "bitterness": 0.6,
    "body": 4.4,
    "wetness": 5.7,
    "freshness": 2.6,
    "luxury": 4.9,
    "heaviness": 3.4,
    "aftertaste": 3.8,
    "structure": 5.2,
    "layerAffinity": {
      "top": 3.5,
      "middle": 8.2,
      "bottom": 2.7
    },
    "heatTolerance": 6.5,
    "beginnerFriendly": 4.3,
    "soloUsability": 3.2,
    "description": "creamy peach yogurt",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_blackburn_na_chille",
    "brandId": "brand_blackburn",
    "name": "Na Chille",
    "aliases": [],
    "category": [
      "cooling"
    ],
    "roles": [
      "cooling",
      "mint",
      "top-note"
    ],
    "tags": [
      "cooling"
    ],
    "nicotineLevel": 3,
    "aromaStrength": 6.5,
    "sweetness": 2.9,
    "sourness": 0.2,
    "cooling": 4.8,
    "bitterness": 0.6,
    "body": 2.4,
    "wetness": 4.1,
    "freshness": 7.1,
    "luxury": 2.9,
    "heaviness": 0,
    "aftertaste": 0.9,
    "structure": 1.8,
    "layerAffinity": {
      "top": 10,
      "middle": 0.1,
      "bottom": 0
    },
    "heatTolerance": 5,
    "beginnerFriendly": 4.8,
    "soloUsability": 4.5,
    "description": "strong chill sensation",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_blackburn_green_tea",
    "brandId": "brand_blackburn",
    "name": "Green Tea",
    "aliases": [],
    "category": [
      "base"
    ],
    "roles": [
      "base",
      "main",
      "bottom-note",
      "tea",
      "structure",
      "middle-note",
      "saltiness",
      "green"
    ],
    "tags": [
      "tea",
      "saltiness",
      "green"
    ],
    "nicotineLevel": 3,
    "aromaStrength": 5.6,
    "sweetness": 2.3,
    "sourness": 0.2,
    "cooling": 0.5,
    "bitterness": 2.6,
    "body": 4.1,
    "wetness": 1.4,
    "freshness": 5.4,
    "luxury": 7.4,
    "heaviness": 4,
    "aftertaste": 6.7,
    "structure": 6.1,
    "layerAffinity": {
      "top": 0,
      "middle": 5.7,
      "bottom": 10
    },
    "heatTolerance": 6.9,
    "beginnerFriendly": 0.6,
    "soloUsability": 7.6,
    "description": "tea dryness and bitterness",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_blackburn_black_cola",
    "brandId": "brand_blackburn",
    "name": "Black Cola",
    "aliases": [],
    "category": [
      "base"
    ],
    "roles": [
      "base",
      "main",
      "bottom-note",
      "cola",
      "spice"
    ],
    "tags": [
      "cola",
      "spice"
    ],
    "nicotineLevel": 3,
    "aromaStrength": 5.9,
    "sweetness": 4.9,
    "sourness": 1,
    "cooling": 0.5,
    "bitterness": 1.6,
    "body": 5.4,
    "wetness": 2.7,
    "freshness": 2.5,
    "luxury": 3.5,
    "heaviness": 3.6,
    "aftertaste": 4.9,
    "structure": 4.6,
    "layerAffinity": {
      "top": 0.8,
      "middle": 9.2,
      "bottom": 6.7
    },
    "heatTolerance": 6.7,
    "beginnerFriendly": 5.1,
    "soloUsability": 8.2,
    "description": "dark cola syrup",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_blackburn_apple_shock",
    "brandId": "brand_blackburn",
    "name": "Apple Shock",
    "aliases": [],
    "category": [
      "booster"
    ],
    "roles": [
      "support",
      "top-note",
      "aroma",
      "fruit",
      "watery",
      "green"
    ],
    "tags": [
      "fruit",
      "watery",
      "sour",
      "green"
    ],
    "nicotineLevel": 3,
    "aromaStrength": 7.6,
    "sweetness": 6.2,
    "sourness": 4.7,
    "cooling": 0.8,
    "bitterness": 0.6,
    "body": 3.4,
    "wetness": 5.7,
    "freshness": 5.8,
    "luxury": 2.3,
    "heaviness": 1.4,
    "aftertaste": 2.7,
    "structure": 2.9,
    "layerAffinity": {
      "top": 8.1,
      "middle": 5.6,
      "bottom": 0
    },
    "heatTolerance": 5,
    "beginnerFriendly": 4.3,
    "soloUsability": 2.9,
    "description": "sharp juicy apple",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_deus_vanilla_berries",
    "brandId": "brand_deus",
    "name": "Vanilla Berries",
    "aliases": [],
    "category": [
      "accent"
    ],
    "roles": [
      "support",
      "aroma",
      "top-note",
      "structure",
      "middle-note",
      "cream",
      "fruit",
      "dessert"
    ],
    "tags": [
      "fruit",
      "cream",
      "dessert"
    ],
    "nicotineLevel": 2.5,
    "aromaStrength": 5.2,
    "sweetness": 7.4,
    "sourness": 0.7,
    "cooling": 0.5,
    "bitterness": 0.6,
    "body": 5.1,
    "wetness": 5.7,
    "freshness": 2.6,
    "luxury": 2.9,
    "heaviness": 3.4,
    "aftertaste": 4.9,
    "structure": 3.4,
    "layerAffinity": {
      "top": 3.5,
      "middle": 8.2,
      "bottom": 2.7
    },
    "heatTolerance": 5.8,
    "beginnerFriendly": 5.1,
    "soloUsability": 3,
    "description": "sweet creamy berry",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_deus_tropic_soda",
    "brandId": "brand_deus",
    "name": "Tropic Soda",
    "aliases": [],
    "category": [
      "booster"
    ],
    "roles": [
      "support",
      "top-note",
      "aroma"
    ],
    "tags": [
      "carbonated"
    ],
    "nicotineLevel": 2.5,
    "aromaStrength": 6.2,
    "sweetness": 4.8,
    "sourness": 0.2,
    "cooling": 0.8,
    "bitterness": 0.6,
    "body": 2.4,
    "wetness": 5.7,
    "freshness": 4.4,
    "luxury": 2.3,
    "heaviness": 0,
    "aftertaste": 1.6,
    "structure": 1.8,
    "layerAffinity": {
      "top": 10,
      "middle": 2.7,
      "bottom": 0
    },
    "heatTolerance": 5,
    "beginnerFriendly": 5.1,
    "soloUsability": 2.4,
    "description": "carbonated tropical drink",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_deus_blackberry_wine",
    "brandId": "brand_deus",
    "name": "Blackberry Wine",
    "aliases": [],
    "category": [
      "body"
    ],
    "roles": [
      "main",
      "middle-note",
      "base",
      "fruit",
      "saltiness",
      "watery"
    ],
    "tags": [
      "fruit",
      "saltiness",
      "watery",
      "sour"
    ],
    "nicotineLevel": 2.5,
    "aromaStrength": 4.9,
    "sweetness": 5.2,
    "sourness": 1.9,
    "cooling": 0.5,
    "bitterness": 1.3,
    "body": 4.4,
    "wetness": 5.7,
    "freshness": 3.9,
    "luxury": 4.9,
    "heaviness": 3.2,
    "aftertaste": 5.4,
    "structure": 5.9,
    "layerAffinity": {
      "top": 1.1,
      "middle": 10,
      "bottom": 7.7
    },
    "heatTolerance": 6.7,
    "beginnerFriendly": 5.2,
    "soloUsability": 8.2,
    "description": "dark berry wine",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_deus_marmelade",
    "brandId": "brand_deus",
    "name": "Marmelade",
    "aliases": [],
    "category": [
      "accent"
    ],
    "roles": [
      "support",
      "aroma",
      "top-note",
      "structure",
      "middle-note",
      "cream",
      "citrus",
      "dessert",
      "saltiness"
    ],
    "tags": [
      "citrus",
      "dessert",
      "saltiness"
    ],
    "nicotineLevel": 2.5,
    "aromaStrength": 6.4,
    "sweetness": 5.8,
    "sourness": 2.2,
    "cooling": 0.5,
    "bitterness": 1.2,
    "body": 4.4,
    "wetness": 5.4,
    "freshness": 4.5,
    "luxury": 3,
    "heaviness": 3.2,
    "aftertaste": 4.5,
    "structure": 5.2,
    "layerAffinity": {
      "top": 6,
      "middle": 6.6,
      "bottom": 2.3
    },
    "heatTolerance": 5.6,
    "beginnerFriendly": 3.2,
    "soloUsability": 3.5,
    "description": "citrus jam sweetness",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_al_fakher_mint",
    "brandId": "brand_alfakher",
    "name": "Mint",
    "aliases": [],
    "category": [
      "cooling"
    ],
    "roles": [
      "cooling",
      "mint",
      "top-note"
    ],
    "tags": [
      "mint",
      "cooling"
    ],
    "nicotineLevel": 2,
    "aromaStrength": 6,
    "sweetness": 0.4,
    "sourness": 0.2,
    "cooling": 6.8,
    "bitterness": 0.6,
    "body": 1.7,
    "wetness": 1.4,
    "freshness": 7.1,
    "luxury": 3.7,
    "heaviness": 0,
    "aftertaste": 1.8,
    "structure": 1.8,
    "layerAffinity": {
      "top": 10,
      "middle": 0,
      "bottom": 0
    },
    "heatTolerance": 5,
    "beginnerFriendly": 4.8,
    "soloUsability": 2.3,
    "description": "straight mint",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_al_fakher_two_apples",
    "brandId": "brand_alfakher",
    "name": "Two Apples",
    "aliases": [],
    "category": [
      "classic"
    ],
    "roles": [
      "main",
      "middle-note",
      "base",
      "fruit",
      "spice"
    ],
    "tags": [
      "fruit",
      "spice"
    ],
    "nicotineLevel": 2,
    "aromaStrength": 7.7,
    "sweetness": 4.2,
    "sourness": 0.2,
    "cooling": 0.5,
    "bitterness": 1.6,
    "body": 5,
    "wetness": 2.7,
    "freshness": 3,
    "luxury": 4.9,
    "heaviness": 5.3,
    "aftertaste": 6.2,
    "structure": 6.2,
    "layerAffinity": {
      "top": 2.3,
      "middle": 9,
      "bottom": 6.4
    },
    "heatTolerance": 7.3,
    "beginnerFriendly": 5.6,
    "soloUsability": 9.1,
    "description": "traditional two apple",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_al_fakher_gum",
    "brandId": "brand_alfakher",
    "name": "Gum",
    "aliases": [],
    "category": [
      "accent"
    ],
    "roles": [
      "support",
      "aroma",
      "top-note",
      "mint",
      "cooling"
    ],
    "tags": [
      "mint",
      "cooling"
    ],
    "nicotineLevel": 2,
    "aromaStrength": 4.5,
    "sweetness": 3.3,
    "sourness": 0.2,
    "cooling": 4,
    "bitterness": 0.6,
    "body": 1.7,
    "wetness": 2.8,
    "freshness": 4.3,
    "luxury": 2.3,
    "heaviness": 1.2,
    "aftertaste": 3.6,
    "structure": 2.3,
    "layerAffinity": {
      "top": 7,
      "middle": 5.4,
      "bottom": 0.1
    },
    "heatTolerance": 5.4,
    "beginnerFriendly": 4.6,
    "soloUsability": 0.8,
    "description": "chewing gum",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_al_fakher_peach",
    "brandId": "brand_alfakher",
    "name": "Peach",
    "aliases": [],
    "category": [
      "accent"
    ],
    "roles": [
      "support",
      "aroma",
      "top-note",
      "main",
      "middle-note",
      "base",
      "fruit"
    ],
    "tags": [
      "fruit"
    ],
    "nicotineLevel": 2,
    "aromaStrength": 5.1,
    "sweetness": 6.2,
    "sourness": 0.7,
    "cooling": 0.5,
    "bitterness": 0.6,
    "body": 3.4,
    "wetness": 4.1,
    "freshness": 3.9,
    "luxury": 2.9,
    "heaviness": 2.8,
    "aftertaste": 3.8,
    "structure": 4,
    "layerAffinity": {
      "top": 4.8,
      "middle": 8.2,
      "bottom": 1.4
    },
    "heatTolerance": 5.4,
    "beginnerFriendly": 5.5,
    "soloUsability": 3.9,
    "description": "round peach",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_al_fakher_vanilla",
    "brandId": "brand_alfakher",
    "name": "Vanilla",
    "aliases": [],
    "category": [
      "binder"
    ],
    "roles": [
      "support",
      "structure",
      "middle-note",
      "cream",
      "dessert"
    ],
    "tags": [
      "cream",
      "dessert"
    ],
    "nicotineLevel": 2,
    "aromaStrength": 3.9,
    "sweetness": 6,
    "sourness": 0.2,
    "cooling": 0.5,
    "bitterness": 0.6,
    "body": 5.1,
    "wetness": 5.7,
    "freshness": 1.2,
    "luxury": 2.9,
    "heaviness": 4.6,
    "aftertaste": 6.7,
    "structure": 4.9,
    "layerAffinity": {
      "top": 0.3,
      "middle": 7.5,
      "bottom": 9.1
    },
    "heatTolerance": 5.8,
    "beginnerFriendly": 5.2,
    "soloUsability": 5.7,
    "description": "soft vanilla cream",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_al_fakher_cappuccino",
    "brandId": "brand_alfakher",
    "name": "Cappuccino",
    "aliases": [],
    "category": [
      "roast"
    ],
    "roles": [
      "base",
      "main",
      "bottom-note",
      "dessert",
      "structure",
      "cream",
      "saltiness"
    ],
    "tags": [
      "cream",
      "roast",
      "saltiness"
    ],
    "nicotineLevel": 2,
    "aromaStrength": 6.1,
    "sweetness": 3.5,
    "sourness": 0.2,
    "cooling": 0.5,
    "bitterness": 4.2,
    "body": 5.3,
    "wetness": 3,
    "freshness": 2.5,
    "luxury": 3.9,
    "heaviness": 6.3,
    "aftertaste": 6.7,
    "structure": 6.7,
    "layerAffinity": {
      "top": 0.1,
      "middle": 7.5,
      "bottom": 9.7
    },
    "heatTolerance": 7.9,
    "beginnerFriendly": 0.8,
    "soloUsability": 7.1,
    "description": "coffee bitterness",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_al_fakher_orange",
    "brandId": "brand_alfakher",
    "name": "Orange",
    "aliases": [],
    "category": [
      "booster"
    ],
    "roles": [
      "support",
      "top-note",
      "aroma",
      "citrus",
      "fruit",
      "saltiness",
      "watery"
    ],
    "tags": [
      "citrus",
      "fruit",
      "saltiness",
      "watery"
    ],
    "nicotineLevel": 2,
    "aromaStrength": 7.7,
    "sweetness": 6,
    "sourness": 2.7,
    "cooling": 0.8,
    "bitterness": 1.2,
    "body": 3.4,
    "wetness": 5.7,
    "freshness": 6.7,
    "luxury": 3,
    "heaviness": 1.4,
    "aftertaste": 3.3,
    "structure": 4.7,
    "layerAffinity": {
      "top": 9.3,
      "middle": 6.4,
      "bottom": 0
    },
    "heatTolerance": 5.2,
    "beginnerFriendly": 5.2,
    "soloUsability": 2.6,
    "description": "juicy orange",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_al_fakher_grape",
    "brandId": "brand_alfakher",
    "name": "Grape",
    "aliases": [],
    "category": [
      "body"
    ],
    "roles": [
      "main",
      "middle-note",
      "base",
      "fruit"
    ],
    "tags": [
      "fruit"
    ],
    "nicotineLevel": 2,
    "aromaStrength": 5.5,
    "sweetness": 6.2,
    "sourness": 0.7,
    "cooling": 0.5,
    "bitterness": 0.6,
    "body": 5.4,
    "wetness": 4.1,
    "freshness": 3.9,
    "luxury": 2.9,
    "heaviness": 4.9,
    "aftertaste": 4.5,
    "structure": 4,
    "layerAffinity": {
      "top": 0.8,
      "middle": 10,
      "bottom": 7.3
    },
    "heatTolerance": 6.7,
    "beginnerFriendly": 5.5,
    "soloUsability": 8.4,
    "description": "syrupy grape",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_al_fakher_coconut",
    "brandId": "brand_alfakher",
    "name": "Coconut",
    "aliases": [],
    "category": [
      "binder"
    ],
    "roles": [
      "support",
      "structure",
      "middle-note",
      "cream",
      "saltiness"
    ],
    "tags": [
      "cream",
      "saltiness",
      "nutty"
    ],
    "nicotineLevel": 1.5,
    "aromaStrength": 5.2,
    "sweetness": 5,
    "sourness": 0.2,
    "cooling": 0.5,
    "bitterness": 0.6,
    "body": 5.1,
    "wetness": 5.7,
    "freshness": 0.6,
    "luxury": 3.5,
    "heaviness": 5.5,
    "aftertaste": 4.3,
    "structure": 6.1,
    "layerAffinity": {
      "top": 0.3,
      "middle": 9,
      "bottom": 6.9
    },
    "heatTolerance": 6.5,
    "beginnerFriendly": 5.1,
    "soloUsability": 6.2,
    "description": "coconut fat texture",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_afzal_earl_grey",
    "brandId": "brand_afzal",
    "name": "Earl Grey",
    "aliases": [],
    "category": [
      "tea"
    ],
    "roles": [
      "tea",
      "base",
      "structure",
      "middle-note",
      "citrus",
      "saltiness"
    ],
    "tags": [
      "citrus",
      "tea",
      "floral",
      "saltiness"
    ],
    "nicotineLevel": 2,
    "aromaStrength": 7.1,
    "sweetness": 2,
    "sourness": 1.4,
    "cooling": 0.5,
    "bitterness": 3.7,
    "body": 3.3,
    "wetness": 1.4,
    "freshness": 4.9,
    "luxury": 6.5,
    "heaviness": 4,
    "aftertaste": 6.7,
    "structure": 7.5,
    "layerAffinity": {
      "top": 2.6,
      "middle": 7,
      "bottom": 8.7
    },
    "heatTolerance": 5,
    "beginnerFriendly": 0.8,
    "soloUsability": 6.5,
    "description": "hotel tea aroma",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_adalya_cola_dragon",
    "brandId": "brand_adalya",
    "name": "Cola Dragon",
    "aliases": [],
    "category": [
      "base"
    ],
    "roles": [
      "base",
      "main",
      "bottom-note",
      "middle-note",
      "fruit",
      "cola",
      "spice"
    ],
    "tags": [
      "fruit",
      "cola",
      "spice",
      "carbonated"
    ],
    "nicotineLevel": 2,
    "aromaStrength": 6.9,
    "sweetness": 6.3,
    "sourness": 1.5,
    "cooling": 0.8,
    "bitterness": 1.6,
    "body": 4.4,
    "wetness": 4.3,
    "freshness": 5.8,
    "luxury": 3.5,
    "heaviness": 1,
    "aftertaste": 3.8,
    "structure": 4.1,
    "layerAffinity": {
      "top": 6.8,
      "middle": 6.4,
      "bottom": 0
    },
    "heatTolerance": 6.3,
    "beginnerFriendly": 5.5,
    "soloUsability": 8.4,
    "description": "sweet craft cola",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_lirra_bbq_peach",
    "brandId": "brand_lirra",
    "name": "BBQ Peach",
    "aliases": [],
    "category": [
      "accent"
    ],
    "roles": [
      "support",
      "aroma",
      "top-note",
      "fruit",
      "saltiness"
    ],
    "tags": [
      "fruit",
      "saltiness",
      "smoky"
    ],
    "nicotineLevel": 2.2,
    "aromaStrength": 6.1,
    "sweetness": 5.2,
    "sourness": 0.7,
    "cooling": 0.5,
    "bitterness": 0.6,
    "body": 3.4,
    "wetness": 2.7,
    "freshness": 3.9,
    "luxury": 4.9,
    "heaviness": 3.2,
    "aftertaste": 4.3,
    "structure": 5.9,
    "layerAffinity": {
      "top": 3.8,
      "middle": 7.2,
      "bottom": 4.2
    },
    "heatTolerance": 6.1,
    "beginnerFriendly": 2.3,
    "soloUsability": 2.1,
    "description": "smoky peach",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_lirra_ice_cream",
    "brandId": "brand_lirra",
    "name": "Ice Cream",
    "aliases": [],
    "category": [
      "binder"
    ],
    "roles": [
      "support",
      "structure",
      "middle-note",
      "cream",
      "cooling",
      "dessert"
    ],
    "tags": [
      "cooling",
      "cream",
      "dessert"
    ],
    "nicotineLevel": 2.2,
    "aromaStrength": 5.2,
    "sweetness": 6,
    "sourness": 0.2,
    "cooling": 2,
    "bitterness": 0.6,
    "body": 4.4,
    "wetness": 5.7,
    "freshness": 3,
    "luxury": 2.9,
    "heaviness": 3.8,
    "aftertaste": 4.5,
    "structure": 4.2,
    "layerAffinity": {
      "top": 2.5,
      "middle": 9.4,
      "bottom": 5.2
    },
    "heatTolerance": 5.8,
    "beginnerFriendly": 4.6,
    "soloUsability": 6.2,
    "description": "soft dairy texture",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_lirra_caramel",
    "brandId": "brand_lirra",
    "name": "Caramel",
    "aliases": [],
    "category": [
      "roast"
    ],
    "roles": [
      "base",
      "main",
      "bottom-note",
      "dessert",
      "structure",
      "saltiness"
    ],
    "tags": [
      "dessert",
      "roast",
      "saltiness"
    ],
    "nicotineLevel": 2.2,
    "aromaStrength": 3.6,
    "sweetness": 5,
    "sourness": 0.2,
    "cooling": 0.3,
    "bitterness": 4.2,
    "body": 6.4,
    "wetness": 4,
    "freshness": 0.2,
    "luxury": 3.9,
    "heaviness": 7.3,
    "aftertaste": 7.1,
    "structure": 6.1,
    "layerAffinity": {
      "top": 0,
      "middle": 4.3,
      "bottom": 10
    },
    "heatTolerance": 7.1,
    "beginnerFriendly": 2.2,
    "soloUsability": 7.6,
    "description": "custard caramel",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_lirra_mango",
    "brandId": "brand_lirra",
    "name": "Mango",
    "aliases": [],
    "category": [
      "body"
    ],
    "roles": [
      "main",
      "middle-note",
      "base",
      "fruit"
    ],
    "tags": [
      "fruit"
    ],
    "nicotineLevel": 2.2,
    "aromaStrength": 4.6,
    "sweetness": 6.2,
    "sourness": 0.7,
    "cooling": 0.5,
    "bitterness": 0.6,
    "body": 4.4,
    "wetness": 4.1,
    "freshness": 3.9,
    "luxury": 2.9,
    "heaviness": 2.8,
    "aftertaste": 3.8,
    "structure": 4,
    "layerAffinity": {
      "top": 2.1,
      "middle": 10,
      "bottom": 4.9
    },
    "heatTolerance": 6,
    "beginnerFriendly": 5.6,
    "soloUsability": 8.2,
    "description": "ripe yellow fruit",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_lirra_pineapple",
    "brandId": "brand_lirra",
    "name": "Pineapple",
    "aliases": [],
    "category": [
      "booster"
    ],
    "roles": [
      "support",
      "top-note",
      "aroma",
      "fruit",
      "saltiness",
      "watery"
    ],
    "tags": [
      "fruit",
      "saltiness",
      "watery",
      "sour"
    ],
    "nicotineLevel": 2.2,
    "aromaStrength": 6.8,
    "sweetness": 5.2,
    "sourness": 4.7,
    "cooling": 0.8,
    "bitterness": 0.6,
    "body": 3.4,
    "wetness": 5.7,
    "freshness": 4.7,
    "luxury": 3.5,
    "heaviness": 1,
    "aftertaste": 2.7,
    "structure": 4.7,
    "layerAffinity": {
      "top": 8.1,
      "middle": 5.5,
      "bottom": 0
    },
    "heatTolerance": 5.7,
    "beginnerFriendly": 5.1,
    "soloUsability": 2.6,
    "description": "juicy pineapple",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_lirra_nanachill",
    "brandId": "brand_lirra",
    "name": "NANACHILL",
    "aliases": [],
    "category": [
      "cooling"
    ],
    "roles": [
      "cooling",
      "mint",
      "top-note",
      "fruit"
    ],
    "tags": [
      "cooling",
      "fruit"
    ],
    "nicotineLevel": 2.2,
    "aromaStrength": 6,
    "sweetness": 5.7,
    "sourness": 0.7,
    "cooling": 4.8,
    "bitterness": 0.6,
    "body": 3.4,
    "wetness": 4.1,
    "freshness": 8.5,
    "luxury": 2.3,
    "heaviness": 0,
    "aftertaste": 1.6,
    "structure": 2.4,
    "layerAffinity": {
      "top": 10,
      "middle": 1.9,
      "bottom": 0
    },
    "heatTolerance": 5,
    "beginnerFriendly": 5.6,
    "soloUsability": 3.1,
    "description": "banana chill",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_lirra_biscuit",
    "brandId": "brand_lirra",
    "name": "Biscuit",
    "aliases": [],
    "category": [
      "bakery"
    ],
    "roles": [
      "dessert",
      "base",
      "bottom-note",
      "cream",
      "main",
      "saltiness"
    ],
    "tags": [
      "dessert",
      "saltiness"
    ],
    "nicotineLevel": 2.2,
    "aromaStrength": 4.9,
    "sweetness": 4.6,
    "sourness": 0.2,
    "cooling": 0.3,
    "bitterness": 0.6,
    "body": 4,
    "wetness": 2.7,
    "freshness": 1.5,
    "luxury": 3.5,
    "heaviness": 4.7,
    "aftertaste": 5.6,
    "structure": 6.1,
    "layerAffinity": {
      "top": 0,
      "middle": 5,
      "bottom": 10
    },
    "heatTolerance": 7.7,
    "beginnerFriendly": 3.8,
    "soloUsability": 6.6,
    "description": "grainy baked texture",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_lirra_kiwi",
    "brandId": "brand_lirra",
    "name": "Kiwi",
    "aliases": [],
    "category": [
      "booster"
    ],
    "roles": [
      "support",
      "top-note",
      "aroma",
      "fruit",
      "saltiness",
      "watery",
      "green"
    ],
    "tags": [
      "fruit",
      "saltiness",
      "watery",
      "sour",
      "green"
    ],
    "nicotineLevel": 2.2,
    "aromaStrength": 6.2,
    "sweetness": 3.8,
    "sourness": 4.7,
    "cooling": 0.8,
    "bitterness": 0.6,
    "body": 3.4,
    "wetness": 5.7,
    "freshness": 5.8,
    "luxury": 4.9,
    "heaviness": 1.4,
    "aftertaste": 3.3,
    "structure": 4.7,
    "layerAffinity": {
      "top": 8.1,
      "middle": 6.4,
      "bottom": 0
    },
    "heatTolerance": 5.7,
    "beginnerFriendly": 5.1,
    "soloUsability": 2.4,
    "description": "unripe kiwi",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_lirra_dragon_fruits",
    "brandId": "brand_lirra",
    "name": "Dragon Fruits",
    "aliases": [],
    "category": [
      "accent"
    ],
    "roles": [
      "support",
      "aroma",
      "top-note",
      "main",
      "middle-note",
      "base",
      "fruit",
      "watery"
    ],
    "tags": [
      "fruit",
      "watery"
    ],
    "nicotineLevel": 2.2,
    "aromaStrength": 5.8,
    "sweetness": 6.2,
    "sourness": 0.7,
    "cooling": 0.5,
    "bitterness": 0.6,
    "body": 2.4,
    "wetness": 5.7,
    "freshness": 3.9,
    "luxury": 2.9,
    "heaviness": 1.6,
    "aftertaste": 3.8,
    "structure": 4,
    "layerAffinity": {
      "top": 4.8,
      "middle": 8.2,
      "bottom": 0
    },
    "heatTolerance": 5.4,
    "beginnerFriendly": 5.1,
    "soloUsability": 4.1,
    "description": "soft tropical fruit",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_mazaya_watermelon",
    "brandId": "brand_mazaya",
    "name": "Watermelon",
    "aliases": [],
    "category": [
      "refreshing"
    ],
    "roles": [
      "watery",
      "fruit",
      "citrus",
      "top-note",
      "support",
      "middle-note",
      "saltiness"
    ],
    "tags": [
      "fruit",
      "saltiness",
      "watery"
    ],
    "nicotineLevel": 2,
    "aromaStrength": 5.4,
    "sweetness": 5.2,
    "sourness": 0.7,
    "cooling": 0.8,
    "bitterness": 0.6,
    "body": 2.4,
    "wetness": 5.7,
    "freshness": 6.7,
    "luxury": 3.5,
    "heaviness": 0,
    "aftertaste": 2.2,
    "structure": 4.2,
    "layerAffinity": {
      "top": 10,
      "middle": 3.7,
      "bottom": 0
    },
    "heatTolerance": 5.4,
    "beginnerFriendly": 6.5,
    "soloUsability": 4.4,
    "description": "summer watermelon",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_mazaya_blueberry",
    "brandId": "brand_mazaya",
    "name": "Blueberry",
    "aliases": [],
    "category": [
      "accent"
    ],
    "roles": [
      "support",
      "aroma",
      "top-note",
      "fruit"
    ],
    "tags": [
      "fruit"
    ],
    "nicotineLevel": 2,
    "aromaStrength": 5.1,
    "sweetness": 6.2,
    "sourness": 0.7,
    "cooling": 0.5,
    "bitterness": 0.6,
    "body": 3.4,
    "wetness": 4.1,
    "freshness": 3.9,
    "luxury": 2.9,
    "heaviness": 2.8,
    "aftertaste": 3.8,
    "structure": 3.4,
    "layerAffinity": {
      "top": 4.8,
      "middle": 8.2,
      "bottom": 1.4
    },
    "heatTolerance": 5.4,
    "beginnerFriendly": 5.5,
    "soloUsability": 1.9,
    "description": "soft berry",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_mazaya_gum_mint",
    "brandId": "brand_mazaya",
    "name": "Gum Mint",
    "aliases": [],
    "category": [
      "cooling"
    ],
    "roles": [
      "cooling",
      "mint",
      "top-note"
    ],
    "tags": [
      "mint",
      "cooling"
    ],
    "nicotineLevel": 2,
    "aromaStrength": 5.4,
    "sweetness": 2.8,
    "sourness": 0.2,
    "cooling": 6.8,
    "bitterness": 0.6,
    "body": 1.7,
    "wetness": 2.8,
    "freshness": 7.1,
    "luxury": 2.3,
    "heaviness": 0,
    "aftertaste": 1.8,
    "structure": 1.8,
    "layerAffinity": {
      "top": 10,
      "middle": 0.9,
      "bottom": 0
    },
    "heatTolerance": 5,
    "beginnerFriendly": 4.9,
    "soloUsability": 2.1,
    "description": "mint gum",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_mazaya_gum",
    "brandId": "brand_mazaya",
    "name": "Gum",
    "aliases": [],
    "category": [
      "accent"
    ],
    "roles": [
      "support",
      "aroma",
      "top-note"
    ],
    "tags": [],
    "nicotineLevel": 2,
    "aromaStrength": 5.1,
    "sweetness": 3.3,
    "sourness": 0.2,
    "cooling": 0.5,
    "bitterness": 0.6,
    "body": 2.7,
    "wetness": 2.8,
    "freshness": 2.5,
    "luxury": 2.3,
    "heaviness": 2.4,
    "aftertaste": 3.3,
    "structure": 2.9,
    "layerAffinity": {
      "top": 5.8,
      "middle": 5.4,
      "bottom": 0.1
    },
    "heatTolerance": 5.4,
    "beginnerFriendly": 4.4,
    "soloUsability": 1.1,
    "description": "gum sweetness",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_serbetli_lemon",
    "brandId": "brand_serbetli",
    "name": "Lemon",
    "aliases": [],
    "category": [
      "booster"
    ],
    "roles": [
      "support",
      "top-note",
      "aroma",
      "citrus",
      "fruit",
      "saltiness"
    ],
    "tags": [
      "citrus",
      "fruit",
      "saltiness",
      "sour"
    ],
    "nicotineLevel": 2.5,
    "aromaStrength": 7.1,
    "sweetness": 4.6,
    "sourness": 5.5,
    "cooling": 0.8,
    "bitterness": 1.2,
    "body": 3.4,
    "wetness": 4.1,
    "freshness": 6.7,
    "luxury": 3,
    "heaviness": 0.2,
    "aftertaste": 1.5,
    "structure": 4.2,
    "layerAffinity": {
      "top": 10,
      "middle": 2.1,
      "bottom": 0
    },
    "heatTolerance": 5.2,
    "beginnerFriendly": 5.1,
    "soloUsability": 2.4,
    "description": "sharp lemon",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_serbetli_orange",
    "brandId": "brand_serbetli",
    "name": "Orange",
    "aliases": [],
    "category": [
      "booster"
    ],
    "roles": [
      "support",
      "top-note",
      "aroma",
      "citrus",
      "fruit",
      "saltiness"
    ],
    "tags": [
      "citrus",
      "fruit",
      "saltiness"
    ],
    "nicotineLevel": 2.5,
    "aromaStrength": 6.8,
    "sweetness": 6,
    "sourness": 2.7,
    "cooling": 0.8,
    "bitterness": 1.2,
    "body": 3.4,
    "wetness": 4.1,
    "freshness": 6.7,
    "luxury": 3,
    "heaviness": 1.4,
    "aftertaste": 3.3,
    "structure": 4.7,
    "layerAffinity": {
      "top": 9.3,
      "middle": 6.4,
      "bottom": 0
    },
    "heatTolerance": 5.2,
    "beginnerFriendly": 5.1,
    "soloUsability": 2.4,
    "description": "soft orange",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_serbetli_banana_milkshake",
    "brandId": "brand_serbetli",
    "name": "Banana Milkshake",
    "aliases": [],
    "category": [
      "binder"
    ],
    "roles": [
      "support",
      "structure",
      "middle-note",
      "cream",
      "fruit"
    ],
    "tags": [
      "fruit",
      "cream"
    ],
    "nicotineLevel": 2.5,
    "aromaStrength": 4.9,
    "sweetness": 7.2,
    "sourness": 0.2,
    "cooling": 0.5,
    "bitterness": 0.6,
    "body": 5.4,
    "wetness": 7,
    "freshness": 1.2,
    "luxury": 2.9,
    "heaviness": 5.9,
    "aftertaste": 5.1,
    "structure": 4.2,
    "layerAffinity": {
      "top": 1.3,
      "middle": 8.5,
      "bottom": 7.6
    },
    "heatTolerance": 5.8,
    "beginnerFriendly": 4.8,
    "soloUsability": 6.5,
    "description": "thick banana cream",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_serbetli_lime_spice_peach",
    "brandId": "brand_serbetli",
    "name": "Lime Spice Peach",
    "aliases": [],
    "category": [
      "accent"
    ],
    "roles": [
      "support",
      "aroma",
      "top-note",
      "citrus",
      "fruit",
      "spice",
      "saltiness"
    ],
    "tags": [
      "citrus",
      "fruit",
      "spice",
      "saltiness",
      "sour"
    ],
    "nicotineLevel": 2.5,
    "aromaStrength": 7.6,
    "sweetness": 6,
    "sourness": 5.5,
    "cooling": 0.8,
    "bitterness": 1.6,
    "body": 3.4,
    "wetness": 4.1,
    "freshness": 6.7,
    "luxury": 3,
    "heaviness": 0.2,
    "aftertaste": 4.4,
    "structure": 4.7,
    "layerAffinity": {
      "top": 9.5,
      "middle": 5.4,
      "bottom": 0
    },
    "heatTolerance": 5.2,
    "beginnerFriendly": 4.9,
    "soloUsability": 2.1,
    "description": "lime peach spice",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_serbetli_lemon_cake",
    "brandId": "brand_serbetli",
    "name": "Lemon Cake",
    "aliases": [],
    "category": [
      "bakery"
    ],
    "roles": [
      "dessert",
      "base",
      "bottom-note",
      "cream",
      "support",
      "structure",
      "middle-note",
      "citrus",
      "saltiness"
    ],
    "tags": [
      "citrus",
      "dessert",
      "saltiness"
    ],
    "nicotineLevel": 2.5,
    "aromaStrength": 5.8,
    "sweetness": 6.6,
    "sourness": 2.2,
    "cooling": 0.5,
    "bitterness": 0.6,
    "body": 4.4,
    "wetness": 4,
    "freshness": 4.5,
    "luxury": 3.5,
    "heaviness": 3.6,
    "aftertaste": 5,
    "structure": 5.9,
    "layerAffinity": {
      "top": 3.8,
      "middle": 6.6,
      "bottom": 7.1
    },
    "heatTolerance": 5.6,
    "beginnerFriendly": 4.5,
    "soloUsability": 6,
    "description": "sweet lemon dessert",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_bonche_peanut",
    "brandId": "brand_bonche",
    "name": "Peanut",
    "aliases": [],
    "category": [
      "texture"
    ],
    "roles": [
      "base",
      "main",
      "bottom-note",
      "structure",
      "cream",
      "saltiness"
    ],
    "tags": [
      "cream",
      "roast",
      "saltiness",
      "nutty"
    ],
    "nicotineLevel": 2.5,
    "aromaStrength": 5,
    "sweetness": 5,
    "sourness": 0.2,
    "cooling": 0.3,
    "bitterness": 3.4,
    "body": 7.8,
    "wetness": 4.3,
    "freshness": 0.2,
    "luxury": 5.9,
    "heaviness": 7.3,
    "aftertaste": 7.1,
    "structure": 6.3,
    "layerAffinity": {
      "top": 0,
      "middle": 4.5,
      "bottom": 10
    },
    "heatTolerance": 8.6,
    "beginnerFriendly": 2.6,
    "soloUsability": 6.6,
    "description": "egg yolk texture",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_bonche_olive",
    "brandId": "brand_bonche",
    "name": "Olive",
    "aliases": [],
    "category": [
      "salinity"
    ],
    "roles": [
      "base",
      "main",
      "bottom-note",
      "saltiness",
      "structure"
    ],
    "tags": [
      "saltiness"
    ],
    "nicotineLevel": 2.5,
    "aromaStrength": 3.4,
    "sweetness": 1.3,
    "sourness": 0.2,
    "cooling": 0.3,
    "bitterness": 3.4,
    "body": 5.6,
    "wetness": 4.4,
    "freshness": 0.2,
    "luxury": 5.9,
    "heaviness": 6.7,
    "aftertaste": 7.1,
    "structure": 7.1,
    "layerAffinity": {
      "top": 0,
      "middle": 3.5,
      "bottom": 10
    },
    "heatTolerance": 8.2,
    "beginnerFriendly": 0,
    "soloUsability": 3.3,
    "description": "hotel air mineral",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_troffimofs_shulare",
    "brandId": "brand_troffimofs",
    "name": "Shulare",
    "aliases": [],
    "category": [
      "base"
    ],
    "roles": [
      "base",
      "main",
      "bottom-note",
      "saltiness"
    ],
    "tags": [
      "saltiness",
      "smoky"
    ],
    "nicotineLevel": 3.5,
    "aromaStrength": 6.4,
    "sweetness": 0.9,
    "sourness": 0.2,
    "cooling": 0.3,
    "bitterness": 0.6,
    "body": 4.1,
    "wetness": 1.4,
    "freshness": 1.5,
    "luxury": 5.9,
    "heaviness": 6.7,
    "aftertaste": 7.1,
    "structure": 6.3,
    "layerAffinity": {
      "top": 0,
      "middle": 2.7,
      "bottom": 10
    },
    "heatTolerance": 8.3,
    "beginnerFriendly": 0,
    "soloUsability": 8.1,
    "description": "dark cigar leaf",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_dozaj_mint",
    "brandId": "brand_dozaj",
    "name": "Mint",
    "aliases": [],
    "category": [
      "cooling"
    ],
    "roles": [
      "cooling",
      "mint",
      "top-note"
    ],
    "tags": [
      "mint",
      "cooling"
    ],
    "nicotineLevel": 1.5,
    "aromaStrength": 5.7,
    "sweetness": 1.4,
    "sourness": 0.2,
    "cooling": 6.8,
    "bitterness": 0.6,
    "body": 1.7,
    "wetness": 2.8,
    "freshness": 8.2,
    "luxury": 2.9,
    "heaviness": 0,
    "aftertaste": 1.8,
    "structure": 1.8,
    "layerAffinity": {
      "top": 10,
      "middle": 0,
      "bottom": 0
    },
    "heatTolerance": 5,
    "beginnerFriendly": 5,
    "soloUsability": 2.3,
    "description": "clean coldness",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_dozaj_ice",
    "brandId": "brand_dozaj",
    "name": "Ice",
    "aliases": [],
    "category": [
      "cooling"
    ],
    "roles": [
      "cooling",
      "mint",
      "top-note"
    ],
    "tags": [
      "cooling"
    ],
    "nicotineLevel": 1.5,
    "aromaStrength": 5.7,
    "sweetness": 1.4,
    "sourness": 0.2,
    "cooling": 4.8,
    "bitterness": 0.6,
    "body": 2.7,
    "wetness": 2.8,
    "freshness": 7.1,
    "luxury": 2.9,
    "heaviness": 0,
    "aftertaste": 1.5,
    "structure": 2.4,
    "layerAffinity": {
      "top": 10,
      "middle": 0,
      "bottom": 0
    },
    "heatTolerance": 5,
    "beginnerFriendly": 5,
    "soloUsability": 3.4,
    "description": "refrigerator coldness",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_dozaj_pear",
    "brandId": "brand_dozaj",
    "name": "Pear",
    "aliases": [],
    "category": [
      "water"
    ],
    "roles": [
      "main",
      "middle-note",
      "base",
      "watery",
      "support",
      "fruit",
      "saltiness"
    ],
    "tags": [
      "fruit",
      "saltiness",
      "watery"
    ],
    "nicotineLevel": 1.5,
    "aromaStrength": 6,
    "sweetness": 4.7,
    "sourness": 0.7,
    "cooling": 0.8,
    "bitterness": 0.6,
    "body": 2.4,
    "wetness": 5.7,
    "freshness": 5.9,
    "luxury": 4.9,
    "heaviness": 0.2,
    "aftertaste": 3.3,
    "structure": 4.7,
    "layerAffinity": {
      "top": 7.1,
      "middle": 5.6,
      "bottom": 0
    },
    "heatTolerance": 5.1,
    "beginnerFriendly": 5.4,
    "soloUsability": 5.1,
    "description": "transparent moisture",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_dozaj_basil",
    "brandId": "brand_dozaj",
    "name": "Basil",
    "aliases": [],
    "category": [
      "salinity"
    ],
    "roles": [
      "saltiness",
      "structure",
      "base",
      "bottom-note",
      "spice",
      "green"
    ],
    "tags": [
      "spice",
      "saltiness",
      "green"
    ],
    "nicotineLevel": 1.5,
    "aromaStrength": 6.4,
    "sweetness": 1.3,
    "sourness": 0.2,
    "cooling": 0.5,
    "bitterness": 2.8,
    "body": 2.7,
    "wetness": 1.4,
    "freshness": 3.6,
    "luxury": 4.9,
    "heaviness": 3.2,
    "aftertaste": 5.4,
    "structure": 6.1,
    "layerAffinity": {
      "top": 2.6,
      "middle": 7.2,
      "bottom": 7
    },
    "heatTolerance": 6.6,
    "beginnerFriendly": 1.5,
    "soloUsability": 2.9,
    "description": "hotel herb aroma",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_afzal_lychee",
    "brandId": "brand_afzal",
    "name": "Lychee",
    "aliases": [],
    "category": [
      "floral"
    ],
    "roles": [
      "aroma",
      "top-note",
      "support",
      "fruit",
      "saltiness",
      "watery"
    ],
    "tags": [
      "fruit",
      "floral",
      "saltiness",
      "watery"
    ],
    "nicotineLevel": 1.5,
    "aromaStrength": 7.2,
    "sweetness": 5.2,
    "sourness": 0.7,
    "cooling": 0.8,
    "bitterness": 0.6,
    "body": 2.4,
    "wetness": 5.7,
    "freshness": 5.4,
    "luxury": 5.3,
    "heaviness": 0.2,
    "aftertaste": 3.3,
    "structure": 4.7,
    "layerAffinity": {
      "top": 9.3,
      "middle": 6.4,
      "bottom": 0
    },
    "heatTolerance": 4.9,
    "beginnerFriendly": 4.3,
    "soloUsability": 3.4,
    "description": "jasmine tea nuance",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_al_fakhamah_cinnamon",
    "brandId": "brand_al_fakhamah",
    "name": "Cinnamon",
    "aliases": [],
    "category": [
      "spice"
    ],
    "roles": [
      "spice",
      "structure",
      "middle-note",
      "saltiness"
    ],
    "tags": [
      "spice",
      "saltiness"
    ],
    "nicotineLevel": 1.5,
    "aromaStrength": 6.4,
    "sweetness": 2.3,
    "sourness": 0.2,
    "cooling": 0.5,
    "bitterness": 2.4,
    "body": 3.3,
    "wetness": 1.4,
    "freshness": 2.5,
    "luxury": 4.9,
    "heaviness": 4,
    "aftertaste": 6.7,
    "structure": 6.7,
    "layerAffinity": {
      "top": 2.6,
      "middle": 6.5,
      "bottom": 7.9
    },
    "heatTolerance": 7.3,
    "beginnerFriendly": 3.1,
    "soloUsability": 2.5,
    "description": "dry cinnamon stick",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_al_fakhamah_exotic_lime",
    "brandId": "brand_al_fakhamah",
    "name": "Exotic Lime",
    "aliases": [],
    "category": [
      "salinity"
    ],
    "roles": [
      "support",
      "top-note",
      "aroma",
      "saltiness",
      "structure",
      "base",
      "bottom-note",
      "citrus",
      "fruit",
      "watery"
    ],
    "tags": [
      "citrus",
      "fruit",
      "saltiness",
      "watery",
      "sour"
    ],
    "nicotineLevel": 1.5,
    "aromaStrength": 6.9,
    "sweetness": 3.6,
    "sourness": 5.5,
    "cooling": 0.8,
    "bitterness": 2.4,
    "body": 2.4,
    "wetness": 5.7,
    "freshness": 6.7,
    "luxury": 4.4,
    "heaviness": 0,
    "aftertaste": 2.2,
    "structure": 5,
    "layerAffinity": {
      "top": 9.3,
      "middle": 2.9,
      "bottom": 0
    },
    "heatTolerance": 5.7,
    "beginnerFriendly": 3.4,
    "soloUsability": 2.6,
    "description": "acidic lime peel",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_al_amasi_super_guava",
    "brandId": "brand_al_amasi",
    "name": "Super Guava",
    "aliases": [],
    "category": [
      "body"
    ],
    "roles": [
      "main",
      "middle-note",
      "base",
      "fruit"
    ],
    "tags": [
      "fruit"
    ],
    "nicotineLevel": 1.5,
    "aromaStrength": 5.2,
    "sweetness": 4.8,
    "sourness": 0.7,
    "cooling": 0.5,
    "bitterness": 0.6,
    "body": 4.4,
    "wetness": 5.7,
    "freshness": 3.9,
    "luxury": 4.3,
    "heaviness": 2.8,
    "aftertaste": 3.8,
    "structure": 4,
    "layerAffinity": {
      "top": 2.1,
      "middle": 10,
      "bottom": 4.9
    },
    "heatTolerance": 6,
    "beginnerFriendly": 5.6,
    "soloUsability": 8.4,
    "description": "guava nectar",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_al_amasi_jasmine",
    "brandId": "brand_al_amasi",
    "name": "Jasmine",
    "aliases": [],
    "category": [
      "floral"
    ],
    "roles": [
      "aroma",
      "top-note",
      "support",
      "tea"
    ],
    "tags": [
      "tea",
      "floral"
    ],
    "nicotineLevel": 1.5,
    "aromaStrength": 7.5,
    "sweetness": 4.8,
    "sourness": 0.2,
    "cooling": 0.8,
    "bitterness": 1.9,
    "body": 3.4,
    "wetness": 4.1,
    "freshness": 4,
    "luxury": 6.3,
    "heaviness": 1.4,
    "aftertaste": 4.4,
    "structure": 4.1,
    "layerAffinity": {
      "top": 8.1,
      "middle": 5.4,
      "bottom": 0
    },
    "heatTolerance": 4.2,
    "beginnerFriendly": 0.5,
    "soloUsability": 4.5,
    "description": "hotel aroma diffuser",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_debaj_guava",
    "brandId": "brand_debaj",
    "name": "Guava",
    "aliases": [],
    "category": [
      "accent"
    ],
    "roles": [
      "support",
      "aroma",
      "top-note",
      "citrus",
      "fruit",
      "saltiness"
    ],
    "tags": [
      "citrus",
      "fruit",
      "saltiness"
    ],
    "nicotineLevel": 1.5,
    "aromaStrength": 6.7,
    "sweetness": 6,
    "sourness": 2.7,
    "cooling": 0.5,
    "bitterness": 1.2,
    "body": 3.4,
    "wetness": 4.1,
    "freshness": 5.9,
    "luxury": 4.4,
    "heaviness": 2.8,
    "aftertaste": 3.8,
    "structure": 5.2,
    "layerAffinity": {
      "top": 6,
      "middle": 8.2,
      "bottom": 2.7
    },
    "heatTolerance": 5.6,
    "beginnerFriendly": 5.4,
    "soloUsability": 2.1,
    "description": "fresh guava peel",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_debaj_cardamom_milk",
    "brandId": "brand_debaj",
    "name": "Cardamom Milk",
    "aliases": [],
    "category": [
      "binder"
    ],
    "roles": [
      "support",
      "structure",
      "middle-note",
      "cream",
      "spice",
      "saltiness"
    ],
    "tags": [
      "cream",
      "spice",
      "saltiness"
    ],
    "nicotineLevel": 1.5,
    "aromaStrength": 6.1,
    "sweetness": 5,
    "sourness": 0.2,
    "cooling": 0.5,
    "bitterness": 1.6,
    "body": 4.4,
    "wetness": 5.7,
    "freshness": 1.2,
    "luxury": 3.5,
    "heaviness": 5.9,
    "aftertaste": 6.1,
    "structure": 6.1,
    "layerAffinity": {
      "top": 0.3,
      "middle": 8.4,
      "bottom": 8
    },
    "heatTolerance": 6.5,
    "beginnerFriendly": 5.1,
    "soloUsability": 6.2,
    "description": "egg custard texture",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_starbuzz_lebanese_bombshell",
    "brandId": "brand_starbuzz",
    "name": "Lebanese Bombshell",
    "aliases": [],
    "category": [
      "floral"
    ],
    "roles": [
      "support",
      "aroma",
      "top-note",
      "spice",
      "saltiness",
      "green",
      "hotel"
    ],
    "tags": [
      "spice",
      "floral",
      "saltiness",
      "green",
      "hotel"
    ],
    "nicotineLevel": 2,
    "aromaStrength": 7.6,
    "sweetness": 3.8,
    "sourness": 0.2,
    "cooling": 0.8,
    "bitterness": 1.6,
    "body": 3.4,
    "wetness": 2.7,
    "freshness": 5.1,
    "luxury": 6.9,
    "heaviness": 1.4,
    "aftertaste": 4.4,
    "structure": 4.1,
    "layerAffinity": {
      "top": 8.1,
      "middle": 5.4,
      "bottom": 0
    },
    "heatTolerance": 4.9,
    "beginnerFriendly": 0.2,
    "soloUsability": 3.4,
    "description": "hotel perfume air",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_al_fakher_magic_love",
    "brandId": "brand_alfakher",
    "name": "Magic Love",
    "aliases": [],
    "category": [
      "booster"
    ],
    "roles": [
      "support",
      "top-note",
      "aroma",
      "mint",
      "cooling",
      "fruit",
      "saltiness"
    ],
    "tags": [
      "mint",
      "cooling",
      "fruit",
      "floral",
      "saltiness"
    ],
    "nicotineLevel": 2,
    "aromaStrength": 9.4,
    "sweetness": 5.2,
    "sourness": 0.2,
    "cooling": 4.3,
    "bitterness": 0.6,
    "body": 2.4,
    "wetness": 4.1,
    "freshness": 6.5,
    "luxury": 2.9,
    "heaviness": 0,
    "aftertaste": 2.5,
    "structure": 3,
    "layerAffinity": {
      "top": 10,
      "middle": 3,
      "bottom": 0
    },
    "heatTolerance": 5.7,
    "beginnerFriendly": 3.2,
    "soloUsability": 4.3,
    "description": "strong AF magic love profile",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_al_fakher_watermelon",
    "brandId": "brand_alfakher",
    "name": "Watermelon",
    "aliases": [],
    "category": [
      "refreshing"
    ],
    "roles": [
      "watery",
      "fruit",
      "citrus",
      "top-note",
      "support",
      "middle-note",
      "saltiness"
    ],
    "tags": [
      "fruit",
      "saltiness",
      "watery"
    ],
    "nicotineLevel": 2,
    "aromaStrength": 5.1,
    "sweetness": 5.2,
    "sourness": 0.7,
    "cooling": 0.8,
    "bitterness": 0.6,
    "body": 2.4,
    "wetness": 5.7,
    "freshness": 6.7,
    "luxury": 2.9,
    "heaviness": 0,
    "aftertaste": 1.6,
    "structure": 3.6,
    "layerAffinity": {
      "top": 10,
      "middle": 3.7,
      "bottom": 0
    },
    "heatTolerance": 5.4,
    "beginnerFriendly": 6.6,
    "soloUsability": 4.3,
    "description": "slightly weaker than standard AF",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_al_fakher_mint_frost",
    "brandId": "brand_alfakher",
    "name": "Mint Frost",
    "aliases": [],
    "category": [
      "cooling"
    ],
    "roles": [
      "cooling",
      "mint",
      "top-note"
    ],
    "tags": [
      "mint",
      "cooling"
    ],
    "nicotineLevel": 2,
    "aromaStrength": 7.6,
    "sweetness": 0.4,
    "sourness": 0.2,
    "cooling": 6.8,
    "bitterness": 0.6,
    "body": 1.7,
    "wetness": 1.4,
    "freshness": 7.1,
    "luxury": 2.9,
    "heaviness": 0,
    "aftertaste": 1.8,
    "structure": 1.8,
    "layerAffinity": {
      "top": 10,
      "middle": 0,
      "bottom": 0
    },
    "heatTolerance": 5,
    "beginnerFriendly": 4.4,
    "soloUsability": 3.7,
    "description": "strong icy mint",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_jibiar_ice_cola",
    "brandId": "brand_jibiar",
    "name": "Ice Cola",
    "aliases": [],
    "category": [
      "booster"
    ],
    "roles": [
      "support",
      "top-note",
      "aroma",
      "cooling",
      "cola",
      "spice",
      "saltiness"
    ],
    "tags": [
      "cooling",
      "cola",
      "spice",
      "saltiness"
    ],
    "nicotineLevel": 2,
    "aromaStrength": 7.7,
    "sweetness": 4.9,
    "sourness": 1,
    "cooling": 2.3,
    "bitterness": 1.6,
    "body": 4.6,
    "wetness": 4.1,
    "freshness": 5.1,
    "luxury": 3.5,
    "heaviness": 2.2,
    "aftertaste": 4.4,
    "structure": 4.1,
    "layerAffinity": {
      "top": 9.3,
      "middle": 6.4,
      "bottom": 0
    },
    "heatTolerance": 5.7,
    "beginnerFriendly": 5.2,
    "soloUsability": 2.6,
    "description": "cold cola drink",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_al_fakher_mint_with_cream",
    "brandId": "brand_alfakher",
    "name": "Mint with Cream",
    "aliases": [],
    "category": [
      "binder"
    ],
    "roles": [
      "support",
      "structure",
      "middle-note",
      "cream",
      "cooling",
      "mint",
      "top-note",
      "saltiness"
    ],
    "tags": [
      "mint",
      "cooling",
      "cream",
      "saltiness"
    ],
    "nicotineLevel": 2,
    "aromaStrength": 5.7,
    "sweetness": 5,
    "sourness": 0.2,
    "cooling": 4.3,
    "bitterness": 0.6,
    "body": 3.4,
    "wetness": 5.7,
    "freshness": 3.8,
    "luxury": 3.5,
    "heaviness": 0.8,
    "aftertaste": 3.6,
    "structure": 4.3,
    "layerAffinity": {
      "top": 6,
      "middle": 7.2,
      "bottom": 1.5
    },
    "heatTolerance": 6.1,
    "beginnerFriendly": 4.7,
    "soloUsability": 6.2,
    "description": "minty cream texture",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_al_fakher_lemon_with_mint",
    "brandId": "brand_alfakher",
    "name": "Lemon with Mint",
    "aliases": [],
    "category": [
      "booster"
    ],
    "roles": [
      "support",
      "top-note",
      "aroma",
      "cooling",
      "mint",
      "citrus",
      "fruit",
      "saltiness"
    ],
    "tags": [
      "mint",
      "cooling",
      "citrus",
      "fruit",
      "saltiness",
      "sour"
    ],
    "nicotineLevel": 2,
    "aromaStrength": 8.4,
    "sweetness": 4.6,
    "sourness": 5.5,
    "cooling": 4.3,
    "bitterness": 0.6,
    "body": 2.4,
    "wetness": 4.1,
    "freshness": 8.5,
    "luxury": 3.5,
    "heaviness": 0,
    "aftertaste": 2.5,
    "structure": 3.6,
    "layerAffinity": {
      "top": 10,
      "middle": 2.1,
      "bottom": 0
    },
    "heatTolerance": 5.2,
    "beginnerFriendly": 5,
    "soloUsability": 2.9,
    "description": "classic AF lemon mint",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_al_fakher_melon",
    "brandId": "brand_alfakher",
    "name": "Melon",
    "aliases": [],
    "category": [
      "body"
    ],
    "roles": [
      "main",
      "middle-note",
      "base",
      "fruit",
      "saltiness",
      "watery",
      "green"
    ],
    "tags": [
      "fruit",
      "saltiness",
      "watery",
      "green"
    ],
    "nicotineLevel": 2,
    "aromaStrength": 4.3,
    "sweetness": 5.2,
    "sourness": 0.7,
    "cooling": 0.5,
    "bitterness": 0.6,
    "body": 3.4,
    "wetness": 5.7,
    "freshness": 5,
    "luxury": 2.9,
    "heaviness": 1.6,
    "aftertaste": 3.2,
    "structure": 4.6,
    "layerAffinity": {
      "top": 2.1,
      "middle": 10,
      "bottom": 4.7
    },
    "heatTolerance": 6.7,
    "beginnerFriendly": 5.9,
    "soloUsability": 8,
    "description": "slightly weaker melon",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_al_fakher_rose",
    "brandId": "brand_alfakher",
    "name": "Rose",
    "aliases": [],
    "category": [
      "floral"
    ],
    "roles": [
      "aroma",
      "top-note",
      "support",
      "saltiness"
    ],
    "tags": [
      "floral",
      "saltiness"
    ],
    "nicotineLevel": 2,
    "aromaStrength": 8.2,
    "sweetness": 3.8,
    "sourness": 0.2,
    "cooling": 0.8,
    "bitterness": 0.6,
    "body": 3.4,
    "wetness": 2.7,
    "freshness": 4,
    "luxury": 6.9,
    "heaviness": 1.4,
    "aftertaste": 3.3,
    "structure": 4.1,
    "layerAffinity": {
      "top": 8.1,
      "middle": 5.4,
      "bottom": 0.3
    },
    "heatTolerance": 4.9,
    "beginnerFriendly": 0,
    "soloUsability": 5.6,
    "description": "strong rose perfume",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_al_fakher_blueberry",
    "brandId": "brand_alfakher",
    "name": "Blueberry",
    "aliases": [],
    "category": [
      "accent"
    ],
    "roles": [
      "support",
      "aroma",
      "top-note",
      "main",
      "middle-note",
      "base",
      "fruit"
    ],
    "tags": [
      "fruit"
    ],
    "nicotineLevel": 2,
    "aromaStrength": 6.1,
    "sweetness": 6.2,
    "sourness": 0.7,
    "cooling": 0.5,
    "bitterness": 0.6,
    "body": 3.4,
    "wetness": 4.1,
    "freshness": 3.9,
    "luxury": 2.3,
    "heaviness": 2.8,
    "aftertaste": 3.2,
    "structure": 2.8,
    "layerAffinity": {
      "top": 4.8,
      "middle": 8.2,
      "bottom": 1.4
    },
    "heatTolerance": 5.4,
    "beginnerFriendly": 5.2,
    "soloUsability": 4.1,
    "description": "classic AF blueberry",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_al_fakher_strawberry",
    "brandId": "brand_alfakher",
    "name": "Strawberry",
    "aliases": [],
    "category": [
      "accent"
    ],
    "roles": [
      "support",
      "aroma",
      "top-note",
      "fruit",
      "green"
    ],
    "tags": [
      "fruit",
      "green"
    ],
    "nicotineLevel": 2,
    "aromaStrength": 6.6,
    "sweetness": 6.2,
    "sourness": 0.7,
    "cooling": 0.8,
    "bitterness": 0.6,
    "body": 3.4,
    "wetness": 4.1,
    "freshness": 5.8,
    "luxury": 2.3,
    "heaviness": 1.4,
    "aftertaste": 2.7,
    "structure": 2.9,
    "layerAffinity": {
      "top": 9.5,
      "middle": 5.4,
      "bottom": 0
    },
    "heatTolerance": 5,
    "beginnerFriendly": 5.2,
    "soloUsability": 2.1,
    "description": "classic AF strawberry",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_al_fakher_kiwi",
    "brandId": "brand_alfakher",
    "name": "Kiwi",
    "aliases": [],
    "category": [
      "booster"
    ],
    "roles": [
      "support",
      "top-note",
      "aroma",
      "fruit",
      "saltiness",
      "watery",
      "green"
    ],
    "tags": [
      "fruit",
      "saltiness",
      "watery",
      "sour",
      "green"
    ],
    "nicotineLevel": 2,
    "aromaStrength": 6.8,
    "sweetness": 5.2,
    "sourness": 4.7,
    "cooling": 0.8,
    "bitterness": 0.6,
    "body": 3.4,
    "wetness": 5.7,
    "freshness": 5.8,
    "luxury": 3.5,
    "heaviness": 1.4,
    "aftertaste": 3.3,
    "structure": 4.7,
    "layerAffinity": {
      "top": 8.1,
      "middle": 6.4,
      "bottom": 0
    },
    "heatTolerance": 5.7,
    "beginnerFriendly": 5.2,
    "soloUsability": 2.6,
    "description": "classic AF kiwi",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_al_fakher_lemon",
    "brandId": "brand_alfakher",
    "name": "Lemon",
    "aliases": [],
    "category": [
      "booster"
    ],
    "roles": [
      "support",
      "top-note",
      "aroma",
      "citrus",
      "fruit",
      "saltiness"
    ],
    "tags": [
      "citrus",
      "fruit",
      "saltiness",
      "sour"
    ],
    "nicotineLevel": 2,
    "aromaStrength": 7.7,
    "sweetness": 4.6,
    "sourness": 5.5,
    "cooling": 0.8,
    "bitterness": 1.2,
    "body": 3.4,
    "wetness": 4.1,
    "freshness": 6.7,
    "luxury": 3,
    "heaviness": 0.2,
    "aftertaste": 1.5,
    "structure": 4.2,
    "layerAffinity": {
      "top": 10,
      "middle": 2.1,
      "bottom": 0
    },
    "heatTolerance": 5.2,
    "beginnerFriendly": 5.2,
    "soloUsability": 2.6,
    "description": "classic AF lemon",
    "dataStatus": "verified",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_lirra_royal_tea",
    "brandId": "brand_lirra",
    "name": "Royal Tea",
    "aliases": [],
    "category": [],
    "roles": [],
    "tags": [],
    "aromaStrength": 1.1,
    "sweetness": 1.6,
    "sourness": 0.2,
    "cooling": 0.3,
    "bitterness": 0.6,
    "body": 2.4,
    "wetness": 2.8,
    "freshness": 1.8,
    "luxury": 2.5,
    "heaviness": 1.4,
    "aftertaste": 2.4,
    "structure": 2.4,
    "layerAffinity": {
      "top": 1.5,
      "middle": 3.2,
      "bottom": 1.2
    },
    "heatTolerance": 4.4,
    "beginnerFriendly": 5,
    "soloUsability": 3.2,
    "dataStatus": "pending",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_lirra_rosemary",
    "brandId": "brand_lirra",
    "name": "Rosemary",
    "aliases": [],
    "category": [],
    "roles": [],
    "tags": [],
    "aromaStrength": 1.1,
    "sweetness": 1.6,
    "sourness": 0.2,
    "cooling": 0.3,
    "bitterness": 0.6,
    "body": 2.4,
    "wetness": 2.8,
    "freshness": 1.8,
    "luxury": 2.5,
    "heaviness": 1.4,
    "aftertaste": 2.4,
    "structure": 2.4,
    "layerAffinity": {
      "top": 1.5,
      "middle": 3.2,
      "bottom": 1.2
    },
    "heatTolerance": 4.4,
    "beginnerFriendly": 5,
    "soloUsability": 3.2,
    "dataStatus": "pending",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_al_fakher_lime",
    "brandId": "brand_alfakher",
    "name": "Lime",
    "aliases": [],
    "category": [],
    "roles": [],
    "tags": [],
    "aromaStrength": 1.1,
    "sweetness": 1.6,
    "sourness": 0.2,
    "cooling": 0.3,
    "bitterness": 0.6,
    "body": 2.4,
    "wetness": 2.8,
    "freshness": 1.8,
    "luxury": 2.5,
    "heaviness": 1.4,
    "aftertaste": 2.4,
    "structure": 2.4,
    "layerAffinity": {
      "top": 1.5,
      "middle": 3.2,
      "bottom": 1.2
    },
    "heatTolerance": 4.4,
    "beginnerFriendly": 5,
    "soloUsability": 3.2,
    "dataStatus": "pending",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_dozaj_pistachio",
    "brandId": "brand_dozaj",
    "name": "Pistachio",
    "aliases": [],
    "category": [],
    "roles": [],
    "tags": [],
    "aromaStrength": 1.1,
    "sweetness": 1.6,
    "sourness": 0.2,
    "cooling": 0.3,
    "bitterness": 0.6,
    "body": 2.4,
    "wetness": 2.8,
    "freshness": 1.8,
    "luxury": 2.5,
    "heaviness": 1.4,
    "aftertaste": 2.4,
    "structure": 2.4,
    "layerAffinity": {
      "top": 1.5,
      "middle": 3.2,
      "bottom": 1.2
    },
    "heatTolerance": 4.4,
    "beginnerFriendly": 5,
    "soloUsability": 3.2,
    "dataStatus": "pending",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_dozaj_cucumber",
    "brandId": "brand_dozaj",
    "name": "Cucumber",
    "aliases": [],
    "category": [],
    "roles": [],
    "tags": [],
    "aromaStrength": 1.1,
    "sweetness": 1.6,
    "sourness": 0.2,
    "cooling": 0.3,
    "bitterness": 0.6,
    "body": 2.4,
    "wetness": 2.8,
    "freshness": 1.8,
    "luxury": 2.5,
    "heaviness": 1.4,
    "aftertaste": 2.4,
    "structure": 2.4,
    "layerAffinity": {
      "top": 1.5,
      "middle": 3.2,
      "bottom": 1.2
    },
    "heatTolerance": 4.4,
    "beginnerFriendly": 5,
    "soloUsability": 3.2,
    "notes": "Strong realistic cucumber aroma; green mineral; watery texture",
    "dataStatus": "pending",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_dozaj_milk",
    "brandId": "brand_dozaj",
    "name": "Milk",
    "aliases": [],
    "category": [],
    "roles": [],
    "tags": [],
    "aromaStrength": 1.1,
    "sweetness": 1.6,
    "sourness": 0.2,
    "cooling": 0.3,
    "bitterness": 0.6,
    "body": 2.4,
    "wetness": 2.8,
    "freshness": 1.8,
    "luxury": 2.5,
    "heaviness": 1.4,
    "aftertaste": 2.4,
    "structure": 2.4,
    "layerAffinity": {
      "top": 1.5,
      "middle": 3.2,
      "bottom": 1.2
    },
    "heatTolerance": 4.4,
    "beginnerFriendly": 5,
    "soloUsability": 3.2,
    "notes": "Sweet condensed-milk style; silky/sticky texture",
    "dataStatus": "pending",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "fm_jent_jasmine_oolong",
    "brandId": "brand_jent",
    "name": "Jasmine Oolong",
    "aliases": [],
    "category": [],
    "roles": [],
    "tags": [],
    "aromaStrength": 1.1,
    "sweetness": 1.6,
    "sourness": 0.2,
    "cooling": 0.3,
    "bitterness": 0.6,
    "body": 2.4,
    "wetness": 2.8,
    "freshness": 1.8,
    "luxury": 2.5,
    "heaviness": 1.4,
    "aftertaste": 2.4,
    "structure": 2.4,
    "layerAffinity": {
      "top": 1.5,
      "middle": 3.2,
      "bottom": 1.2
    },
    "heatTolerance": 4.4,
    "beginnerFriendly": 5,
    "soloUsability": 3.2,
    "dataStatus": "pending",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
];
