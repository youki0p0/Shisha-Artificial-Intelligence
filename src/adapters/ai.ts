/**
 * AI fallback adapter — OPTIONAL and DISABLED by default.
 *
 * Hard rules (enforced by keeping this a thin, optional adapter):
 *  - AI must NOT create final recipes.
 *  - AI must NOT create / edit FlavorMaster records.
 *  - AI must NOT create taste parameters that become authoritative.
 *  - AI must NOT confirm inventory.
 *  - AI is only allowed to *suggest* a refined TasteIntent (or OCR correction),
 *    and that suggestion is still subject to the same DB-first pipeline + review.
 *
 * The MVP runs entirely without AI. `isAiEnabled()` is false unless an
 * explicit env flag + key are present.
 */
import { AiFallbackAdapter, TasteIntent } from "@/domain/types";

export function isAiEnabled(): boolean {
  return process.env.AI_FALLBACK_ENABLED === "true" && !!process.env.AI_API_KEY;
}

/** No-op adapter: returns no changes. Safe default for the MVP. */
export class DisabledAiAdapter implements AiFallbackAdapter {
  async refineIntent(
    _input: string,
    _draft: TasteIntent,
  ): Promise<Partial<TasteIntent>> {
    return {};
  }
}

/**
 * Skeleton for a real adapter (e.g. Claude). NOT wired up. It must only ever
 * return a *partial* TasteIntent refinement (extra tags / softened unknowns),
 * never a recipe or master data.
 *
 * export class ClaudeIntentAdapter implements AiFallbackAdapter {
 *   async refineIntent(input, draft) {
 *     // Call the model with a strict schema; validate with Zod; return
 *     // only allowed fields (conceptTags, preferredTags, unknownTerms...).
 *   }
 * }
 */

export function getAiAdapter(): AiFallbackAdapter {
  return new DisabledAiAdapter();
}
