/**
 * ShishaOS — deterministic projection of a curated CSV FlavorProfile into the
 * engine's FlavorMaster (11-dim TasteVector + roles/tags/layers/derived fields).
 *
 * Pure + deterministic: same CSV + same spec ⇒ same FlavorMaster, always.
 * No AI, no randomness, no I/O. The numbers come entirely from `DerivationSpec`.
 */
import { ALL_FLAVOR_ROLES, Brand, FlavorMaster, FlavorRole } from "@/domain/types";
import {
  DerivationSpec,
  DerivedFieldName,
  FieldTerm,
} from "./derivationSpec";
import {
  descriptorText,
  FlavorProfile,
  isProfiled,
} from "./flavorProfile";

const clamp10 = (n: number) => Math.max(0, Math.min(10, n));
/** Round to 1 decimal so the stored vectors stay readable and stable. */
const round1 = (n: number) => Math.round(n * 10) / 10;

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Keyword match anchored to a word START (so stems still match — "roast" hits
 * "roasted", "syrup" hits "syrupy" — but a keyword can never match mid-word:
 * "ice" must NOT fire on "ju[ice]"/"sp[ice]"). Multi-word phrases ("green tea")
 * are matched as-is at a word boundary.
 */
function matchesKeyword(text: string, kw: string): boolean {
  return new RegExp(`(?:^|[^a-z])${escapeRe(kw.toLowerCase())}`).test(text);
}

/** Evaluate one additive field term against a profile. */
export function evalField(p: FlavorProfile, term: FieldTerm | undefined): number {
  if (!term) return 0;
  let v = term.base ?? 0;
  if (term.perNicotine && p.nicotine != null) v += term.perNicotine * p.nicotine;
  if (term.perIntensity && p.intensity != null) v += term.perIntensity * p.intensity;

  const pick = <K extends string>(
    map: Partial<Record<K, number>> | undefined,
    key: K | null,
  ) => {
    if (map && key != null && map[key] != null) v += map[key] as number;
  };
  pick(term.volatility, p.volatility);
  pick(term.syrup, p.syrup);
  pick(term.heat_resistance, p.heat_resistance);
  pick(term.opening_speed, p.opening_speed);
  pick(term.peak_time, p.peak_time);
  pick(term.fade_speed, p.fade_speed);
  pick(term.realism, p.realism);
  pick(term.role, p.role);

  if (term.keywords && term.keywords.length) {
    const text = descriptorText(p);
    for (const rule of term.keywords) {
      if (rule.anyOf.some((kw) => matchesKeyword(text, kw))) v += rule.add;
    }
  }
  return clamp10(round1(v));
}

const field = (p: FlavorProfile, spec: DerivationSpec, name: DerivedFieldName) =>
  evalField(p, spec.numericDerivation[name]);

const ROLE_SET = new Set<string>(ALL_FLAVOR_ROLES);

/**
 * Roles from the CSV `role` + `expanded_role` tokens via the spec mapping, plus
 * identity roles inferred from tags: per knowledge.md a flavor's `role` is its
 * *function/identity*, so a flavor tagged `cola`/`tea`/`citrus`/`mint`/`cream`…
 * also plays that role (this is what lets a "コーラ系" request — preferredRoles
 * ["cola"] — actually surface the cola flavor in scoring).
 */
export function deriveRoles(
  p: FlavorProfile,
  spec: DerivationSpec,
  tags: string[],
): FlavorRole[] {
  const out = new Set<FlavorRole>();
  const tokens: string[] = [];
  if (p.role) tokens.push(p.role);
  if (p.expanded_role) {
    for (const t of p.expanded_role.toLowerCase().split(/[\s/]+/)) tokens.push(t);
  }
  for (const [csvToken, roles] of Object.entries(spec.roleMapping)) {
    if (tokens.some((t) => t === csvToken)) roles.forEach((r) => out.add(r));
  }
  if (p.role && spec.roleMapping[p.role]) {
    spec.roleMapping[p.role].forEach((r) => out.add(r));
  }
  // Tag → identity role (only tags that name a real FlavorRole).
  for (const tag of tags) {
    if (ROLE_SET.has(tag)) out.add(tag as FlavorRole);
  }
  return [...out];
}

/** Tags from keyword rules over the descriptor text. */
export function deriveTags(p: FlavorProfile, spec: DerivationSpec): string[] {
  const text = descriptorText(p);
  const out = new Set<string>();
  for (const rule of spec.tagRules) {
    if (rule.contains.some((kw) => matchesKeyword(text, kw))) out.add(rule.tag);
  }
  return [...out];
}

export type BrandResolver = (brandName: string) => Pick<Brand, "id" | "name">;

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

/** Build the full FlavorMaster record for one curated profile. */
export function deriveFlavorMaster(
  p: FlavorProfile,
  spec: DerivationSpec,
  resolveBrand: BrandResolver,
  timestamp: string,
): FlavorMaster {
  const brand = resolveBrand(p.brand);
  const profiled = isProfiled(p);
  const tags = deriveTags(p, spec);
  const roles = deriveRoles(p, spec, tags);
  const category = p.role ? [p.role] : [];

  return {
    id: `fm_${slug(p.brand)}_${slug(p.flavor)}`,
    brandId: brand.id,
    name: p.flavor,
    aliases: [],
    category,
    roles,
    tags,
    nicotineLevel: p.nicotine ?? undefined,
    aromaStrength: field(p, spec, "aromaStrength"),
    sweetness: field(p, spec, "sweetness"),
    sourness: field(p, spec, "sourness"),
    cooling: field(p, spec, "cooling"),
    bitterness: field(p, spec, "bitterness"),
    body: field(p, spec, "body"),
    wetness: field(p, spec, "wetness"),
    freshness: field(p, spec, "freshness"),
    luxury: field(p, spec, "luxury"),
    heaviness: field(p, spec, "heaviness"),
    aftertaste: field(p, spec, "aftertaste"),
    structure: field(p, spec, "structure"),
    layerAffinity: {
      top: field(p, spec, "layerTop"),
      middle: field(p, spec, "layerMiddle"),
      bottom: field(p, spec, "layerBottom"),
    },
    heatTolerance: field(p, spec, "heatTolerance"),
    beginnerFriendly: field(p, spec, "beginnerFriendly"),
    soloUsability: field(p, spec, "soloUsability"),
    description: p.memo ?? undefined,
    notes: p.notes ?? undefined,
    // CSV is the curated LISSO master ⇒ verified when profiled, pending when stub.
    dataStatus: profiled ? "verified" : "pending",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}
