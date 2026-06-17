/**
 * Recipe service — orchestrates repositories + engines to generate a recipe
 * for a user. This is the boundary the UI / server actions call.
 *
 * Flow: parse intent (local) -> [optional AI refine if low confidence] ->
 * gather data -> run pure RecipeEngine -> return result. No AI in the happy path.
 */
import { RecipeMode, TasteIntent } from "@/domain/types";
import { getRepositories } from "@/repositories";
import { parseIntent } from "@/engines/parser";
import { generateRecipe, GeneratedRecipe } from "@/engines/recipe";
import { getAiAdapter, isAiEnabled } from "@/adapters/ai";

export type RecipeServiceInput = {
  userId: string;
  input: string;
  mode: RecipeMode;
  totalGram: number;
};

export type RecipeServiceResult = GeneratedRecipe & {
  intent: TasteIntent;
  aiUsed: boolean;
};

export async function generateRecipeForUser(
  params: RecipeServiceInput,
): Promise<RecipeServiceResult> {
  const repos = getRepositories();
  const [tasteWords, allFlavors, synergyRules, heatTemplates, troubleshootingRules, inventory] =
    await Promise.all([
      repos.tasteWords.list(),
      repos.flavors.list(),
      repos.synergy.list(),
      repos.heatTemplates.list(),
      repos.troubleshooting.list(),
      repos.inventory.listByUser(params.userId),
    ]);

  // 1. Local parse (no AI).
  let intent = parseIntent(params.input, tasteWords);
  let aiUsed = false;

  // 2. Optional AI fallback — ONLY when the parser flags it AND AI is enabled.
  //    The AI may only *refine* the intent; it never builds the recipe.
  if (intent.shouldUseAiFallback && isAiEnabled()) {
    const patch = await getAiAdapter().refineIntent(params.input, intent);
    if (patch && Object.keys(patch).length > 0) {
      intent = { ...intent, ...patch };
      aiUsed = true;
    }
  }

  // 3. Inventory ids (flavors the user actually owns and isn't out of).
  const inventoryIds = new Set(
    inventory
      .filter((i) => i.flavorMasterId && i.status !== "out")
      .map((i) => i.flavorMasterId!),
  );

  // 4. Pure recipe engine.
  const generated = generateRecipe({
    userId: params.userId,
    intent,
    allFlavors,
    inventoryIds,
    mode: params.mode,
    totalGram: params.totalGram,
    synergyRules,
    heatTemplates,
    troubleshootingRules,
  });

  return { ...generated, intent, aiUsed };
}
