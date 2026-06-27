/**
 * ShishaOS — Derivation spec contract.
 *
 * The council/judge workflow produces a `DerivationSpec` (committed as
 * `derivation_spec.json`). It is a transparent, hand-tunable description of how
 * the curated CSV sensory columns project into the engine's numeric fields,
 * roles and tags. Keeping it as data (not code) means a curator can retune the
 * mapping without touching engine logic, and the projection stays 100%
 * deterministic — no AI at runtime.
 */
import { FlavorRole } from "@/domain/types";
import { CsvRole } from "./flavorProfile";

/** Additive contribution model for one derived numeric field (clamped 0..10). */
export type FieldTerm = {
  base?: number;
  /** coefficient applied to the raw nicotine value (1.5..3.5) */
  perNicotine?: number;
  /** coefficient applied to the raw intensity value (2.0..4.5) */
  perIntensity?: number;
  volatility?: Partial<Record<"low" | "medium" | "high", number>>;
  syrup?: Partial<Record<"low" | "medium" | "high", number>>;
  heat_resistance?: Partial<Record<"medium" | "high", number>>;
  opening_speed?: Partial<Record<"very fast" | "fast" | "medium" | "slow", number>>;
  peak_time?: Partial<
    Record<"opening" | "opening-middle" | "middle" | "middle-late" | "late", number>
  >;
  fade_speed?: Partial<
    Record<"fast" | "fast-medium" | "medium" | "medium-slow" | "slow", number>
  >;
  realism?: Partial<Record<string, number>>;
  role?: Partial<Record<CsvRole, number>>;
  /** keyword bonuses matched against the concatenated descriptor text */
  keywords?: { anyOf: string[]; add: number }[];
};

export type DerivedFieldName =
  | "sweetness"
  | "sourness"
  | "cooling"
  | "bitterness"
  | "body"
  | "wetness"
  | "freshness"
  | "luxury"
  | "heaviness"
  | "aftertaste"
  | "structure"
  | "heatTolerance"
  | "aromaStrength"
  | "beginnerFriendly"
  | "soloUsability"
  | "layerTop"
  | "layerMiddle"
  | "layerBottom";

export type TagRule = { contains: string[]; tag: string };

export type DerivationSpec = {
  rationale?: string;
  numericDerivation: Partial<Record<DerivedFieldName, FieldTerm>>;
  /** CSV role token → engine FlavorRole[] */
  roleMapping: Record<string, FlavorRole[]>;
  tagRules: TagRule[];
};
