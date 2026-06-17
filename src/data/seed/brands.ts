import { Brand } from "@/domain/types";

const T = "2025-01-01T00:00:00.000Z";

/** Curated brand master. LISSO acts as the initial curator. */
export const seedBrands: Brand[] = [
  {
    id: "brand_alfakher",
    name: "Al Fakher",
    aliases: ["alfakher", "アルファーヘル", "アルファーケル"],
    country: "AE",
    notes: "Classic, widely available, beginner-friendly.",
    createdAt: T,
    updatedAt: T,
  },
  {
    id: "brand_adalya",
    name: "Adalya",
    aliases: ["アダリヤ", "アダルヤ"],
    country: "TR",
    notes: "Sweet, aromatic, popular mixing base.",
    createdAt: T,
    updatedAt: T,
  },
  {
    id: "brand_blackburn",
    name: "Blackburn",
    aliases: ["ブラックバーン", "blackburn tobacco"],
    country: "RU",
    notes: "Strong, dark-leaf, bold flavors.",
    createdAt: T,
    updatedAt: T,
  },
  {
    id: "brand_deus",
    name: "Deus",
    aliases: ["デウス", "deus tabak"],
    country: "GB",
    notes: "Premium, refined profiles, 'hotel-kei' friendly.",
    createdAt: T,
    updatedAt: T,
  },
  {
    id: "brand_bonche",
    name: "Bonche",
    aliases: ["ボンチェ", "bon che"],
    country: "RU",
    notes: "Dark-leaf, intense, low cloud but strong taste.",
    createdAt: T,
    updatedAt: T,
  },
  {
    id: "brand_serbetli",
    name: "Serbetli",
    aliases: ["シェルベトリ", "sherbetli", "şerbetli"],
    country: "TR",
    notes: "Big clouds, sweet candy-like flavors.",
    createdAt: T,
    updatedAt: T,
  },
  {
    id: "brand_dozaj",
    name: "Dozaj",
    aliases: ["ドザジ", "dozaj tobacco"],
    country: "TR",
    notes: "Balanced fruit and dessert profiles.",
    createdAt: T,
    updatedAt: T,
  },
];
