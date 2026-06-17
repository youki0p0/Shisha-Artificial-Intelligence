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
];

/** Starter inventory for the demo user so recipe generation works out of the box. */
export const seedInventory: UserInventoryItem[] = [
  {
    id: "inv_demo_earlgrey",
    userId: "user_demo",
    flavorMasterId: "fm_deus_earlgrey",
    amountGram: 50,
    status: "in_stock",
    source: "manual",
    createdAt: T,
    updatedAt: T,
  },
  {
    id: "inv_demo_pear",
    userId: "user_demo",
    flavorMasterId: "fm_adalya_pear",
    amountGram: 50,
    status: "in_stock",
    source: "manual",
    createdAt: T,
    updatedAt: T,
  },
  {
    id: "inv_demo_vanilla",
    userId: "user_demo",
    flavorMasterId: "fm_alfakher_vanilla",
    amountGram: 50,
    status: "in_stock",
    source: "manual",
    createdAt: T,
    updatedAt: T,
  },
  {
    id: "inv_demo_cola",
    userId: "user_demo",
    flavorMasterId: "fm_blackburn_coladragon",
    amountGram: 50,
    status: "in_stock",
    source: "manual",
    createdAt: T,
    updatedAt: T,
  },
  {
    id: "inv_demo_lime",
    userId: "user_demo",
    flavorMasterId: "fm_serbetli_exoticlime",
    amountGram: 50,
    status: "in_stock",
    source: "manual",
    createdAt: T,
    updatedAt: T,
  },
  {
    id: "inv_demo_lychee",
    userId: "user_demo",
    flavorMasterId: "fm_dozaj_lychee",
    amountGram: 30,
    status: "low",
    source: "manual",
    createdAt: T,
    updatedAt: T,
  },
  {
    id: "inv_demo_mint",
    userId: "user_demo",
    flavorMasterId: "fm_alfakher_mint",
    amountGram: 50,
    status: "in_stock",
    source: "manual",
    createdAt: T,
    updatedAt: T,
  },
  {
    id: "inv_demo_greentea",
    userId: "user_demo",
    flavorMasterId: "fm_alfakher_greentea",
    amountGram: 40,
    status: "in_stock",
    source: "manual",
    createdAt: T,
    updatedAt: T,
  },
];
