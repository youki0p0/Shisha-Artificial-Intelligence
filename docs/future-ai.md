# Future: connecting an optional AI fallback

AI is **off by default** and is never on the happy path. It may only *refine a
low-confidence `TasteIntent`* (or, separately, correct badly-failed OCR). It must
never build a recipe, create/edit `FlavorMaster`, set authoritative taste
parameters, or confirm inventory.

## Where it plugs in

- Interface: `AiFallbackAdapter` in `src/domain/types.ts`.
- Default: `DisabledAiAdapter` (`src/adapters/ai.ts`) returns `{}`.
- Gate: `isAiEnabled()` returns true only when
  `AI_FALLBACK_ENABLED=true` **and** `AI_API_KEY` is set.
- Call site: `src/services/recipeService.ts` calls the adapter **only** when
  `intent.shouldUseAiFallback === true` **and** `isAiEnabled()`.

## Implementing a real adapter (e.g. Claude)

When building on the Claude API, default to the latest model
(`claude-opus-4-8` for highest capability, or `claude-haiku-4-5-20251001` for
cheap/fast classification). Constrain the model with a strict output schema and
validate with Zod; discard anything outside the allowed fields.

```ts
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { AiFallbackAdapter, TasteIntent } from "@/domain/types";

const refineSchema = z.object({
  preferredTags: z.array(z.string()).max(8).optional(),
  conceptTags: z.array(z.string()).max(8).optional(),
  unknownTerms: z.array(z.string()).optional(), // resolved/cleared terms
});

export class ClaudeIntentAdapter implements AiFallbackAdapter {
  private client = new Anthropic({ apiKey: process.env.AI_API_KEY! });

  async refineIntent(input: string, draft: TasteIntent): Promise<Partial<TasteIntent>> {
    const msg = await this.client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system:
        "You map shisha flavor requests to TAGS ONLY. You never invent flavor " +
        "data, never choose a recipe, never output taste numbers. Return JSON " +
        "matching the given schema.",
      messages: [{ role: "user", content: buildPrompt(input, draft) }],
    });
    const json = extractJson(msg);
    const parsed = refineSchema.safeParse(json);
    if (!parsed.success) return {};
    return parsed.data; // merged over the local intent by the service
  }
}
```

## Guardrails to keep

- Only merge whitelisted fields (tags / concept / cleared unknown terms).
- Never let AI output taste-vector numbers, gram amounts, or master records.
- Log when AI was used (the UI already shows an "AI使用: あり/なし" badge).
- Keep all tests AI-free so CI never depends on a key or network.
