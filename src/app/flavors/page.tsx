import { getRepositories } from "@/repositories";
import { addManualInventoryAction } from "@/app/actions";
import { TasteBars } from "@/components/TasteBars";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
} from "@/components/ui/primitives";

export default async function FlavorsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const repos = getRepositories();
  const [flavors, brands] = await Promise.all([
    q ? repos.flavors.search(q) : repos.flavors.list(),
    repos.brands.list(),
  ]);
  const brandById = new Map(brands.map((b) => [b.id, b]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">フレーバーマスター検索</h1>
        <p className="text-sm text-muted-foreground">
          ブランド・フレーバー名・タグで検索。味プロファイルを確認して在庫に追加できます。
        </p>
      </div>

      <form className="flex gap-2" method="get">
        <Input name="q" defaultValue={q ?? ""} placeholder="例: tea / コーラ / Al Fakher" />
        <Button type="submit">検索</Button>
      </form>

      <div className="grid gap-4 md:grid-cols-2">
        {flavors.map((f) => (
          <Card key={f.id}>
            <CardHeader>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <CardTitle>
                  {f.displayNameJa ?? f.name}
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    {brandById.get(f.brandId)?.name}
                  </span>
                </CardTitle>
                <Badge
                  variant={f.dataStatus === "verified" ? "success" : "muted"}
                >
                  {f.dataStatus}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{f.description}</p>
              <div className="flex flex-wrap gap-1">
                {f.tags.map((t) => (
                  <Badge key={t} variant="outline">
                    {t}
                  </Badge>
                ))}
              </div>
              <TasteBars flavor={f} />
              <form action={addManualInventoryAction}>
                <input type="hidden" name="flavorMasterId" value={f.id} />
                <input type="hidden" name="status" value="in_stock" />
                <Button size="sm" type="submit">
                  在庫に追加
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
        {flavors.length === 0 && (
          <p className="text-sm text-muted-foreground">該当なし。</p>
        )}
      </div>
    </div>
  );
}
