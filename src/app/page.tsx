import Link from "next/link";
import { getRepositories } from "@/repositories";
import { getCurrentUserId } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@/components/ui/primitives";

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="lisso-eyebrow mb-2">Flavor OS · Dashboard</div>
          <h1 className="text-2xl font-medium">ダッシュボード</h1>
          <p className="text-muted-foreground text-sm">
            在庫からあなただけのレシピを生成しましょう。
          </p>
        </div>
        <Link href="/recipes/new">
          <Button>クイックレシピ生成</Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="在庫フレーバー" value={inventory.length} sub={`在庫あり ${inStock}`} />
        <Stat label="保存レシピ" value={recipes.length} />
        <Stat label="要レビュー" value={pendingReview.length} sub="写真取込" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>最近のレシピ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recipes.length === 0 && (
              <p className="text-sm text-muted-foreground">
                まだレシピがありません。<Link className="text-primary underline" href="/recipes/new">生成してみる</Link>
              </p>
            )}
            {recipes.slice(-5).reverse().map((r) => (
              <div key={r.id} className="flex items-center justify-between text-sm">
                <span>{r.title}</span>
                <Badge variant="muted">score {r.score}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>在庫わずか</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {low.length === 0 && (
              <p className="text-sm text-muted-foreground">在庫わずかの品はありません。</p>
            )}
            {low.map((i) => (
              <div key={i.id} className="flex items-center justify-between text-sm">
                <span>
                  {i.flavorMasterId
                    ? flavorById.get(i.flavorMasterId)?.displayNameJa ??
                      flavorById.get(i.flavorMasterId)?.name
                    : i.customName}
                </span>
                <Badge variant="warn">low</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>写真取込セッション</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {sessions.length === 0 && (
            <p className="text-sm text-muted-foreground">
              写真から在庫を取り込めます。<Link className="text-primary underline" href="/photo-import">写真取込へ</Link>
            </p>
          )}
          {sessions.slice(-5).reverse().map((s) => (
            <div key={s.id} className="flex items-center justify-between text-sm">
              <Link className="text-primary underline" href={`/photo-import/${s.id}`}>
                {s.id}
              </Link>
              <Badge variant={s.status === "review_required" ? "warn" : "muted"}>
                {s.status}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="lisso-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </div>
        <div className="font-display text-3xl font-medium mt-1.5">{value}</div>
        {sub && (
          <div className="lisso-mono text-[11px] text-muted-foreground mt-1">{sub}</div>
        )}
      </CardContent>
    </Card>
  );
}
