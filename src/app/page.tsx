import Link from "next/link";
import { getRepositories } from "@/repositories";
import { getCurrentUserId } from "@/lib/auth";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  Stat,
} from "@/components/ui/primitives";

export default async function DashboardPage() {
  const userId = await getCurrentUserId();
  const repos = getRepositories();
  const [inventory, recipes, sessions, flavors] = await Promise.all([
    repos.inventory.listByUser(userId),
    repos.recipes.listByUser(userId),
    repos.photoImport.listSessionsByUser(userId),
    repos.flavors.list(),
  ]);
  const flavorById = new Map(flavors.map((f) => [f.id, f]));

  const inStock = inventory.filter((i) => i.status === "in_stock").length;
  const low = inventory.filter((i) => i.status === "low");
  const pendingReview = sessions.filter((s) => s.status === "review_required");
  const flavorName = (id?: string) =>
    id ? flavorById.get(id)?.displayNameJa ?? flavorById.get(id)?.name : undefined;

  return (
    <div className="space-y-8">
      <section className="lisso-panel rounded-lg p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <div className="lisso-eyebrow">ShishaOS · Mixology</div>
            <h1 className="text-2xl sm:text-3xl font-medium leading-tight">
              在庫から、あなただけの一杯を設計する
            </h1>
            <p className="text-sm text-muted-foreground">
              {flavors.length.toLocaleString()}種のフレーバーDBと重み付けエンジンで、
              空間・温度・余韻まで設計したMIXを提案します。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/recipes/new">
              <Button>レシピを生成</Button>
            </Link>
            <Link href="/flavors">
              <Button variant="outline">フレーバーを探す</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Stat label="在庫フレーバー" value={inventory.length} sub={`在庫あり ${inStock}`} accent />
        <Stat label="保存レシピ" value={recipes.length} />
        <Stat label="要レビュー" value={pendingReview.length} sub="写真取込" />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>最近のレシピ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {recipes.length === 0 ? (
              <EmptyState
                title="まだレシピがありません"
                description="在庫が無くても、欲しい雰囲気を言葉で入力すれば生成できます。"
                action={
                  <Link href="/recipes/new">
                    <Button size="sm">生成してみる</Button>
                  </Link>
                }
              />
            ) : (
              recipes
                .slice(-6)
                .reverse()
                .map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between gap-2 rounded-sm px-2 py-1.5 lisso-card-hover border border-transparent"
                  >
                    <span className="text-sm truncate">{r.title}</span>
                    <Badge variant="muted">score {r.score}</Badge>
                  </div>
                ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>在庫わずか</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {low.length === 0 ? (
              <EmptyState title="在庫わずかの品はありません" />
            ) : (
              low.map((i) => (
                <div key={i.id} className="flex items-center justify-between text-sm px-2 py-1.5">
                  <span className="truncate">{flavorName(i.flavorMasterId) ?? i.customName}</span>
                  <Badge variant="warn">low</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>写真取込セッション</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {sessions.length === 0 ? (
              <EmptyState
                title="写真から在庫を取り込めます"
                description="フレーバー棚を撮影すると、OCRで在庫候補を抽出します。"
                action={
                  <Link href="/photo-import">
                    <Button size="sm" variant="outline">
                      写真取込へ
                    </Button>
                  </Link>
                }
              />
            ) : (
              sessions
                .slice(-6)
                .reverse()
                .map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between gap-2 text-sm px-2 py-1.5"
                  >
                    <Link
                      className="text-primary hover:underline truncate lisso-mono text-xs"
                      href={`/photo-import/${s.id}`}
                    >
                      {s.id}
                    </Link>
                    <Badge variant={s.status === "review_required" ? "warn" : "muted"}>
                      {s.status}
                    </Badge>
                  </div>
                ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
