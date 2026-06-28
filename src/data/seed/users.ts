import {
  UserInventoryItem,
  UserProfile,
} from "@/domain/types";

const T = "2025-01-01T00:00:00.000Z";

/**
 * Seed users. The MVP uses a mock "current user" (see src/lib/auth.ts).
 * - demo user: a normal user with a starter inventory
 * - curator: LISSO curator account for admin screens
 */
export const seedUsers: UserProfile[] = [
  {
    id: "user_demo",
    displayName: "デモユーザー",
    handle: "demo",
    role: "user",
    createdAt: T,
    updatedAt: T,
  },
  {
    id: "user_lisso",
    displayName: "LISSO Curator",
    handle: "lisso",
    role: "curator",
    createdAt: T,
    updatedAt: T,
  },
  {
    id: "user_admin",
    displayName: "Admin",
    handle: "admin",
    role: "admin",
    createdAt: T,
    updatedAt: T,
  },
  {
    // Staff member. Login handle "0129ryuusei", display name set to "さおとめ".
    // Hourly wage: ¥1,200 through June 2026, ¥1,250 from July 2026.
    id: "user_0129ryuusei",
    displayName: "さおとめ",
    handle: "0129ryuusei",
    role: "user",
    wages: [
      { id: "wage_0129ryuusei_base", effectiveFrom: "2025-01", hourlyWage: 1200 },
      { id: "wage_0129ryuusei_jul26", effectiveFrom: "2026-07", hourlyWage: 1250 },
    ],
    createdAt: T,
    updatedAt: T,
  },
];

/** Starter inventory for the demo user so recipe generation works out of the box. */
export const seedInventory: UserInventoryItem[] = [
  {
    id: "inv_demo_earlgrey",
    userId: "user_demo",
    flavorMasterId: "fm_afzal_earl_grey",
    amountGram: 50,
    status: "in_stock",
    source: "manual",
    createdAt: T,
    updatedAt: T,
  },
  {
    id: "inv_demo_pear",
    userId: "user_demo",
    flavorMasterId: "fm_dozaj_pear",
    amountGram: 50,
    status: "in_stock",
    source: "manual",
    createdAt: T,
    updatedAt: T,
  },
  {
    id: "inv_demo_vanilla",
    userId: "user_demo",
    flavorMasterId: "fm_al_fakher_vanilla",
    amountGram: 50,
    status: "in_stock",
    source: "manual",
    createdAt: T,
    updatedAt: T,
  },
  {
    id: "inv_demo_cola",
    userId: "user_demo",
    flavorMasterId: "fm_adalya_cola_dragon",
    amountGram: 50,
    status: "in_stock",
    source: "manual",
    createdAt: T,
    updatedAt: T,
  },
  {
    id: "inv_demo_lime",
    userId: "user_demo",
    flavorMasterId: "fm_al_fakhamah_exotic_lime",
    amountGram: 50,
    status: "in_stock",
    source: "manual",
    createdAt: T,
    updatedAt: T,
  },
  {
    id: "inv_demo_lychee",
    userId: "user_demo",
    flavorMasterId: "fm_afzal_lychee",
    amountGram: 30,
    status: "low",
    source: "manual",
    createdAt: T,
    updatedAt: T,
  },
  {
    id: "inv_demo_mint",
    userId: "user_demo",
    flavorMasterId: "fm_al_fakher_mint",
    amountGram: 50,
    status: "in_stock",
    source: "manual",
    createdAt: T,
    updatedAt: T,
  },
  {
    id: "inv_demo_greentea",
    userId: "user_demo",
    flavorMasterId: "fm_blackburn_green_tea",
    amountGram: 40,
    status: "in_stock",
    source: "manual",
    createdAt: T,
    updatedAt: T,
  },
];
