import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getRepositories } from "@/repositories";
import { getCurrentUserId } from "@/lib/auth";
import { flavorToVector } from "@/domain/taste";
import { TasteBars } from "@/components/TasteBars";
import { addManualInventoryAction } from "@/app/actions";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  PageHeader,
} from "@/components/ui/primitives";
import { FlavorMaster } from "@/domain/types";

function vdist(a: ReturnType<typeof flavorToVector>, b: ReturnType<typeof flavorToVector>) {
  let d = 0;
  for (const k of Object.keys(a) as (keyof typeof a)[]) d += (a[k] - b[k]) ** 2;
  return Math.sqrt(d);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const flavor = await getRepositories().flavors.getById(id);
  if (!flavor) return { title: "フレーバー" };
  const name = flavor.displayNameJa ?? flavor.name;
  return {
    title: name,
    description: flavor.description ?? `${name} の味プロファイルと類似フレーバー。`,
  };
}

export default async function FlavorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const repos = getRepositories();
  const userId = await getCurrentUserId();
  const [flavor, flavors, brands, recipes] = await Promise.all([
    repos.flavors.getById(id),
    repos.flavors.list(),
    repos.brands.list(),
    repos.recipes.listByUser(userId),
  ]);
  if (!flavor) notFound();

  const brandById = new Map(brands.map((b) => [b.id, b]));
  const brandName = brandById.get(flavor.brandId)?.name ?? "—";
  const name = flavor.displayNameJa ?? flavor.name;

  // Similar flavors by taste-vector distance (prefer fully profiled records).
  const tv = flavorToVector(flavor);
  const similar = flavors
    .filter((f) => f.id !== flavor.id && f.dataStatus === "verified")
    .map((f) => ({ f, dist: vdist(tv, flavorToVector(f)) }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 8)
    .map((x) => x.f);

  // Recipes (the current user's) that feature this flavor.
  const usedIn = recipes.filter((r) =>
    r.items.some((it) => it.flavorMasterId === flavor.id),
  );

  const facts: { label: string; value: string }[] = [
    { label: "ニコチン", value: flavor.nicotineLevel != null ? `${flavor.nicotineLevel}` : "—" },
    { label: "アロマ強度", value: flavor.aromaStrength != null ? `${flavor.aromaStrength}/10` : "—" },
    { label: "耐熱", value: `${flavor.heatTolerance}/10` },
    { label: "初心者向け", value: `${flavor.beginnerFriendly}/10` },
    { label: "単体使用", value: `${flavor.soloUsability}/10` },
    {
      label: "レイヤー (上/中/下)",
      value: `${flavor.layerAffinity.top}/${flavor.layerAffinity.middle}/${flavor.layerAffinity.bottom}`,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={brandName}
        title={name}
        description={flavor.description ?? undefined}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant={flavor.dataStatus === "verified" ? "success" : "muted"}>
              {flavor.dataStatus}
            </Badge>
            <form action={addManualInventoryAction}>
              <input type="hidden" name="flavorMasterId" value={flavor.id} />
              <input type="hidden" name="status" value="in_stock" />
              <Button size="sm" type="submit">
                在庫に追加
              </Button>
            </form>
          </div>
        }
      />

      <Link href="/flavors" className="lisso-mono text-xs text-muted-foreground hover:text-foreground">
        ← フレーバー一覧へ
      </Link>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>味プロファイル</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <TasteBars flavor={flavor} />
            <div className="flex flex-wrap gap-1">
              {flavor.roles.map((r) => (
                <Badge key={r} variant="outline">
                  {r}
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-1">
              {flavor.tags.map((t) => (
                <Badge key={t} variant="muted">
                  {t}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>スペック</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
              {facts.map((f) => (
                <div key={f.label}>
                  <dt className="lisso-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                    {f.label}
                  </dt>
                  <dd className="font-display text-lg tabular-nums">{f.value}</dd>
                </div>
              ))}
            </dl>
            {flavor.notes && (
              <p className="mt-4 text-sm text-muted-foreground border-t pt-3">{flavor.notes}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>類似フレーバー</CardTitle>
        </CardHeader>
        <CardContent>
          {similar.length === 0 ? (
            <EmptyState title="類似フレーバーが見つかりません" />
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {similar.map((f) => (
                <SimilarCard key={f.id} flavor={f} brand={brandById.get(f.brandId)?.name} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>このフレーバーを使ったレシピ（{usedIn.length}）</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {usedIn.length === 0 ? (
            <EmptyState
              title="まだ採用レシピがありません"
              description="このフレーバーを軸にレシピを生成できます。"
              action={
                <Link href="/recipes/new">
                  <Button size="sm" variant="outline">
                    レシピを生成
                  </Button>
                </Link>
              }
            />
          ) : (
            usedIn.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-2 px-2 py-1.5 text-sm">
                <span className="truncate">{r.title}</span>
                <Badge variant="muted">score {r.score}</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SimilarCard({ flavor, brand }: { flavor: FlavorMaster; brand?: string }) {
  return (
    <Link
      href={`/flavors/${flavor.id}`}
      className="block rounded-md border bg-card p-3 lisso-card-hover"
    >
      <div className="text-sm font-medium truncate">{flavor.displayNameJa ?? flavor.name}</div>
      <div className="lisso-mono text-[11px] text-muted-foreground truncate">{brand}</div>
      <div className="mt-2 flex flex-wrap gap-1">
        {flavor.tags.slice(0, 3).map((t) => (
          <Badge key={t} variant="outline">
            {t}
          </Badge>
        ))}
      </div>
    </Link>
  );
}
