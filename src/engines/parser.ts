/**
 * LocalIntentParser — converts a (Japanese) free-text request into a
 * structured TasteIntent WITHOUT calling any AI.
 *
 * Strategy:
 *  1. Match TasteWord.keyword + aliases as substrings of the input.
 *  2. Detect degree modifiers (すごく / ちょっと ...) to scale effects.
 *  3. Apply effects (additive) and merge constraints (higher priority wins).
 *  4. Collect preferred/avoid roles & tags, concept tags.
 *  5. Extract leftover "unknown terms".
 *  6. Compute a confidence score and decide whether AI fallback *could* help.
 *
 * The parser is a pure function: (input, tasteWords) => TasteIntent.
 */
import {
  FlavorRole,
  TasteConstraints,
  TasteIntent,
  TasteVector,
  TasteWord,
} from "@/domain/types";
import { addVector, clampVector, zeroVector } from "@/domain/taste";
import { normalizeText } from "@/lib/utils";

const DEGREE_BOOST: Array<{ words: string[]; factor: number }> = [
  { words: ["すごく", "すっごく", "めっちゃ", "超", "かなり", "とても", "激"], factor: 1.4 },
  { words: ["ちょっと", "少し", "ややか", "やや", "微", "ほんのり", "控えめ"], factor: 0.6 },
];

// Japanese particles / filler that are never "unknown product names".
const STOPWORDS = new Set(
  [
    "やつ",
    "もの",
    "感じ",
    "系",
    "風",
    "っぽい",
    "ような",
    "よう",
    "ください",
    "ほしい",
    "欲しい",
    "作って",
    "作りたい",
    "おすすめ",
    "ミックス",
    "レシピ",
    "活かした",
    "活かして",
    "活かす",
    "使った",
    "使って",
    "で",
    "が",
    "を",
    "の",
    "に",
    "は",
    "と",
    "も",
    "な",
    "て",
    "し",
    "た",
    "い",
    "一番",
    "うまい",
    "美味しい",
    "おいしい",
    "在庫",
    "だけ",
    "作れる",
  ].map(normalizeText),
);

function detectDegreeFactor(input: string): number {
  const n = normalizeText(input);
  for (const { words, factor } of DEGREE_BOOST) {
    if (words.some((w) => n.includes(normalizeText(w)))) return factor;
  }
  return 1;
}

function mergeConstraints(
  base: TasteConstraints,
  add: TasteConstraints,
): TasteConstraints {
  const out = { ...base };
  for (const key of Object.keys(add) as (keyof TasteConstraints)[]) {
    const v = add[key];
    if (v === undefined) continue;
    if (key.endsWith("Max")) {
      // tighter (smaller) max wins
      out[key] = out[key] === undefined ? v : Math.min(out[key]!, v);
    } else {
      // tighter (larger) min wins
      out[key] = out[key] === undefined ? v : Math.max(out[key]!, v);
    }
  }
  return out;
}

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function extractUnknownTerms(input: string, matchedSurfaces: string[]): string[] {
  // Remove matched surface forms from the original input, then split the
  // remainder into rough tokens and drop stopwords / particles.
  let remainder = input;
  for (const surface of matchedSurfaces) {
    if (!surface) continue;
    remainder = remainder.split(surface).join(" ");
  }
  const tokens = remainder
    .split(/[\s　、。,.\/「」（）()！!？?・]+/)
    .map((t) => t.trim())
    .filter(Boolean);

  const unknown: string[] = [];
  for (const tok of tokens) {
    const n = normalizeText(tok);
    if (!n) continue;
    if (STOPWORDS.has(n)) continue;
    // Drop very short fragments (1 char) — usually leftover particles.
    if (n.length < 2) continue;
    unknown.push(tok);
  }
  return uniq(unknown);
}

export function parseIntent(
  input: string,
  tasteWords: TasteWord[],
): TasteIntent {
  const normInput = normalizeText(input);
  const degree = detectDegreeFactor(input);

  // Match words, highest priority first so dominant words apply last-wins where needed.
  const ordered = [...tasteWords].sort((a, b) => b.priority - a.priority);

  let vector: TasteVector = zeroVector();
  let constraints: TasteConstraints = {};
  const matchedKeywords: string[] = [];
  const matchedSurfaces: string[] = [];
  const preferredRoles: FlavorRole[] = [];
  const avoidRoles: FlavorRole[] = [];
  const preferredTags: string[] = [];
  const avoidTags: string[] = [];
  const conceptTags: string[] = [];

  for (const word of ordered) {
    const surfaces = [word.keyword, ...word.aliases];
    const hitSurface = surfaces.find((s) => normInput.includes(normalizeText(s)));
    if (!hitSurface) continue;

    matchedKeywords.push(word.keyword);
    matchedSurfaces.push(hitSurface);
    conceptTags.push(word.keyword);

    // Apply effects scaled by degree (constraints are NOT scaled).
    const scaled: Partial<TasteVector> = {};
    for (const dim of Object.keys(word.effects) as (keyof TasteVector)[]) {
      scaled[dim] = (word.effects[dim] as number) * degree;
    }
    vector = addVector(vector, scaled);

    if (word.constraints) {
      constraints = mergeConstraints(constraints, word.constraints);
    }

    preferredRoles.push(...word.preferredRoles);
    avoidRoles.push(...word.avoidRoles);
    preferredTags.push(...word.preferredTags);
    avoidTags.push(...word.avoidTags);
  }

  // Avoid roles/tags take precedence: strip them from preferred lists.
  const avoidRoleSet = new Set(avoidRoles);
  const avoidTagSet = new Set(avoidTags);
  const cleanPreferredRoles = uniq(preferredRoles).filter(
    (r) => !avoidRoleSet.has(r),
  );
  const cleanPreferredTags = uniq(preferredTags).filter(
    (t) => !avoidTagSet.has(t),
  );

  vector = clampVector(vector, -10, 10);
  // Negative dims (from light/さっぱり) are clamped to 0 for "desired" purposes
  // but constraints (e.g. bodyMax) carry the "less of this" intent.
  const desiredVector = clampVector(vector, 0, 10);

  const unknownTerms = extractUnknownTerms(input, matchedSurfaces);

  const { confidence, mainTasteDetected } = computeConfidence(
    desiredVector,
    constraints,
    matchedKeywords,
    unknownTerms,
  );

  const { shouldUseAiFallback, fallbackReason } = decideFallback(
    confidence,
    mainTasteDetected,
    unknownTerms,
    matchedKeywords,
  );

  return {
    originalInput: input,
    vector: desiredVector,
    constraints,
    matchedKeywords: uniq(matchedKeywords),
    unknownTerms,
    preferredRoles: cleanPreferredRoles,
    avoidRoles: uniq(avoidRoles),
    preferredTags: cleanPreferredTags,
    avoidTags: uniq(avoidTags),
    conceptTags: uniq(conceptTags),
    confidence,
    shouldUseAiFallback,
    fallbackReason,
  };
}

function computeConfidence(
  vector: TasteVector,
  constraints: TasteConstraints,
  matchedKeywords: string[],
  unknownTerms: string[],
): { confidence: number; mainTasteDetected: boolean } {
  const strongDims = Object.values(vector).filter((v) => v >= 4).length;
  const hasConstraints = Object.keys(constraints).length > 0;
  const mainTasteDetected =
    strongDims >= 1 || hasConstraints || matchedKeywords.length >= 2;

  if (matchedKeywords.length === 0) {
    return { confidence: 0.2, mainTasteDetected: false };
  }

  let score = 0.4;
  score += Math.min(matchedKeywords.length, 3) * 0.15; // up to +0.45
  if (strongDims >= 1) score += 0.1;
  if (hasConstraints) score += 0.1;
  // Each unmatched substantial term erodes confidence a little.
  score -= Math.min(unknownTerms.length, 3) * 0.08;

  const confidence = Math.max(0, Math.min(1, Number(score.toFixed(2))));
  return { confidence, mainTasteDetected };
}

function decideFallback(
  confidence: number,
  mainTasteDetected: boolean,
  unknownTerms: string[],
  matchedKeywords: string[],
): { shouldUseAiFallback: boolean; fallbackReason?: string } {
  // Rule: confidence >= 0.8 => never call AI.
  if (confidence >= 0.8) return { shouldUseAiFallback: false };

  // Rule: confidence >= 0.5 AND main taste detected => do not call AI.
  if (confidence >= 0.5 && mainTasteDetected) {
    return { shouldUseAiFallback: false };
  }

  // Rule: only unknown *mood* words and we still understood taste => no AI.
  // (Heuristic: we matched at least one keyword and main taste detected.)
  if (mainTasteDetected && matchedKeywords.length >= 1) {
    return { shouldUseAiFallback: false };
  }

  // Rule: unknown product / drink / food names with low confidence => AI may help.
  if (unknownTerms.length > 0) {
    return {
      shouldUseAiFallback: true,
      fallbackReason: `low_confidence_unknown_terms: ${unknownTerms.join(", ")}`,
    };
  }

  // Low confidence, nothing matched at all.
  return {
    shouldUseAiFallback: true,
    fallbackReason: "low_confidence_no_match",
  };
}
