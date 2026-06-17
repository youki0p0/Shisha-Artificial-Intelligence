import { NextRequest, NextResponse } from "next/server";
import { recipeRequestSchema } from "@/domain/schemas";
import { getCurrentUserId } from "@/lib/auth";
import { generateRecipeForUser } from "@/services/recipeService";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = recipeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const userId = await getCurrentUserId();
  const result = await generateRecipeForUser({
    userId,
    input: parsed.data.input,
    mode: parsed.data.mode,
    totalGram: parsed.data.totalGram,
  });
  return NextResponse.json(result);
}
