/** Taste-vector helpers shared by the parser, scoring and recipe engines. */
import {
  FlavorMaster,
  TASTE_DIMENSIONS,
  TasteConstraints,
  TasteVector,
} from "./types";

export function zeroVector(): TasteVector {
  return {
    sweetness: 0,
    sourness: 0,
    cooling: 0,
    bitterness: 0,
    body: 0,
    wetness: 0,
    freshness: 0,
    luxury: 0,
    heaviness: 0,
    aftertaste: 0,
    structure: 0,
  };
}

/** Pull the 11-dim taste vector out of a (flattened) FlavorMaster record. */
export function flavorToVector(flavor: FlavorMaster): TasteVector {
  return {
    sweetness: flavor.sweetness,
    sourness: flavor.sourness,
    cooling: flavor.cooling,
    bitterness: flavor.bitterness,
    body: flavor.body,
    wetness: flavor.wetness,
    freshness: flavor.freshness,
    luxury: flavor.luxury,
    heaviness: flavor.heaviness,
    aftertaste: flavor.aftertaste,
    structure: flavor.structure,
  };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function addVector(
  base: TasteVector,
  delta: Partial<TasteVector>,
): TasteVector {
  const out = { ...base };
  for (const dim of TASTE_DIMENSIONS) {
    if (delta[dim] !== undefined) {
      out[dim] = out[dim] + (delta[dim] as number);
    }
  }
  return out;
}

export function clampVector(v: TasteVector, min = 0, max = 10): TasteVector {
  const out = { ...v };
  for (const dim of TASTE_DIMENSIONS) {
    out[dim] = clamp(out[dim], min, max);
  }
  return out;
}

/**
 * Similarity of a candidate flavor's vector to the desired intent vector.
 * Only dimensions where the intent expresses a preference (non-zero) count,
 * so a neutral intent does not penalise anything. Returns 0..1.
 */
export function vectorMatch(
  intent: TasteVector,
  candidate: TasteVector,
): number {
  let weightSum = 0;
  let distanceSum = 0;
  for (const dim of TASTE_DIMENSIONS) {
    const desired = intent[dim];
    if (desired <= 0) continue; // no expressed preference on this dim
    const weight = desired;
    const diff = Math.abs(desired - candidate[dim]) / 10;
    distanceSum += weight * diff;
    weightSum += weight;
  }
  if (weightSum === 0) return 0.5; // neutral request — everything is "okay"
  return clamp(1 - distanceSum / weightSum, 0, 1);
}

/** How many constraints a candidate vector violates, and by how much (0..1 each). */
export function constraintViolation(
  constraints: TasteConstraints,
  candidate: TasteVector,
): number {
  let violation = 0;
  const checks: Array<[number | undefined, number, "min" | "max"]> = [
    [constraints.sweetnessMax, candidate.sweetness, "max"],
    [constraints.sweetnessMin, candidate.sweetness, "min"],
    [constraints.sournessMax, candidate.sourness, "max"],
    [constraints.sournessMin, candidate.sourness, "min"],
    [constraints.coolingMax, candidate.cooling, "max"],
    [constraints.coolingMin, candidate.cooling, "min"],
    [constraints.bodyMax, candidate.body, "max"],
    [constraints.bodyMin, candidate.body, "min"],
    [constraints.heavinessMax, candidate.heaviness, "max"],
    [constraints.heavinessMin, candidate.heaviness, "min"],
  ];
  for (const [bound, value, kind] of checks) {
    if (bound === undefined) continue;
    if (kind === "max" && value > bound) violation += (value - bound) / 10;
    if (kind === "min" && value < bound) violation += (bound - value) / 10;
  }
  return violation;
}
