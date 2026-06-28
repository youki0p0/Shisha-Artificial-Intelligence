import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getRepositories } from "@/repositories";
import { getCurrentUserId } from "@/lib/auth";
import { flavorToVector } from "@/domain/taste";
import { RecipeView } from "@/components/RecipeView";
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  PageHeader,
} from "@/components/ui/primitives";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ shareId: string }>;
}): Promise<Metadata> {
  const { shareId } = await params;
  const recipe = await getRepositories().recipes.getByShareId(shareId);
  if (!recipe) return { title: "共有レシピ" };
  return {
    title: recipe.title,
    description: recipe.concept || "ShishaOS で生成された共有レシピ。",
    openGraph: {
      title: recipe.title,
      description: recipe.concept || "ShishaOS の共有レシピ",
      type: "article",
    },
  };
}

/**
 * Shared recipe view. Compares the shared recipe against the *current* user's
 * inventory: shows owned vs missing flavors and suggests local substitutes.
 *
 * NOTE: full "save adjusted recipe" is a future step; the data model + route
 * are in place. This page implements the comparison + substitution display.
 */
export default async function SharedRecipePage({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const { shareId } = await params;
  const repos = getRepositories();
  const recipe = await repos.recipes.getByShareId(shareId);
  if (!recipe || recipe.visibility === "private") {
    // For the MVP we still show private recipes by share link for convenience,
    // but real visibility enforcement plugs in here.
  }
  if (!recipe) notFound();

  const userId = await getCurrentUserId();
  const [inventory, flavors] = await Promise.all([
    repos.inventory.listByUser(userId),
    repos.flavors.list(),
  ]);
  const flavorById = new Map(flavors.map((f) => [f.id, f]));
  const ownedIds = new Set(
    inventory
      .filter((i) => i.flavorMasterId && i.status !== "out")
      .map((i) => i.flavorMasterId!),
  );

  const owned = recipe.items.filter(
    (i) => i.flavorMasterId && ownedIds.has(i.flavorMasterId),
  );
  const missing = recipe.items.filter(
    (i) => !i.flavorMasterId || !ownedIds.has(i.flavorMasterId),
  );

  const ownedFlavors = inventory
    .map((i) => (i.flavorMasterId ? flavorById.get(i.flavorMasterId) : undefined))
    .filter((f): f is NonNullable<typeof f> => Boolean(f));

  const substitutes = missing.map((item) => {
    const target = item.flavorMasterId ? flavorById.get(item.flavorMasterId) : undefined;
    if (!target) return { item, suggestions: [] as string[] };
    const tv = flavorToVector(target);
    const suggestions = ownedFlavors
      .map((f) => ({
        name: f.displayNameJa ?? f.name,
        dist: dist(tv, flavorToVector(f)),
      }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 2)
      .map((x) => x.name);
    return { item, suggestions };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Shared Recipe"
        title={recipe.title}
        description="あなたの在庫と照合しています。"
      />

      <Card>
        <CardHeader>
          <CardTitle>在庫マッチ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="font-medium mb-1">所持（{owned.length}）</p>
            <div className="flex flex-wrap gap-1">
              {owned.map((i, idx) => (
                <Badge key={idx} variant="success">
                  {i.displayName}
                </Badge>
              ))}
              {owned.length === 0 && <span className="text-muted-foreground">なし</span>}
            </div>
          </div>
          <div>
            <p className="font-medium mb-1">不足（{missing.length}）</p>
            <div className="space-y-1">
              {substitutes.map((s, idx) => (
                <div key={idx}>
                  <Badge variant="warn">{s.item.displayName}</Badge>{" "}
                  {s.suggestions.length > 0 ? (
                    <span className="text-muted-foreground">
                      在庫の代替候補: {s.suggestions.join(" / ")}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">代替候補なし</span>
                  )}
                </div>
              ))}
              {missing.length === 0 && (
                <span className="text-muted-foreground">すべて所持しています！</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <RecipeView recipe={recipe} />
    </div>
  );
}

function dist(a: ReturnType<typeof flavorToVector>, b: ReturnType<typeof flavorToVector>) {
  let d = 0;
  for (const k of Object.keys(a) as (keyof typeof a)[]) d += (a[k] - b[k]) ** 2;
  return Math.sqrt(d);
}
