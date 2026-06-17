import { NextRequest, NextResponse } from "next/server";
import { Recipe } from "@/domain/types";
import { getCurrentUserId } from "@/lib/auth";
import { getRepositories } from "@/repositories";

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();
  const recipe = (await req.json()) as Recipe;
  if (!recipe || !recipe.id) {
    return NextResponse.json({ error: "invalid_recipe" }, { status: 400 });
  }
  // Force ownership to the current user — never trust the client here.
  const saved = await getRepositories().recipes.create({ ...recipe, userId });
  return NextResponse.json(saved);
}
