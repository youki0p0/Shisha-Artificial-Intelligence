import Link from "next/link";
import { getRepositories } from "@/repositories";
import { getCurrentUserId } from "@/lib/auth";
import {
  addManualInventoryAction,
  removeInventoryAction,
  updateInventoryStatusAction,
} from "@/app/actions";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  Input,
  Label,
  PageHeader,
  Select,
} from "@/components/ui/primitives";

const STATUS_VARIANT: Record<string, "success" | "warn" | "muted" | "outline"> = {
  in_stock: "success",
  low: "warn",
  out: "muted",
  planned: "outline",
};

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string }>;
}) {
  const { brand: brandFilter } = await searchParams;
  const userId = await getCurrentUserId();
  const repos = getRepositories();
  const [inventory, flavors, brands] = await Promise.all([
    repos.inventory.listByUser(userId),
    repos.flavors.list(),
    repos.brands.list(),
  ]);
  const flavorById = new Map(flavors.map((f) => [f.id, f]));
  const brandById = new Map(brands.map((b) => [b.id, b]));

  const itemBrand = (item: (typeof inventory)[number]) => {
    const fm = item.flavorMasterId ? flavorById.get(item.flavorMasterId) : undefined;
    return fm ? brandById.get(fm.brandId)?.name ?? "—" : item.customBrand ?? "カスタム";
  };
  const presentBrands = [...new Set(inventory.map(itemBrand))].sort((a, b) =>
    a.localeCompare(b),
  );
  const filtered = brandFilter
    ? inventory.filter((i) => itemBrand(i) === brandFilter)
    : inventory;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Inventory"
        title="マイ在庫"
        description="手持ちのフレーバーを登録すると、在庫内だけでMIXを設計できます。"
        actions={
          <Link href="/photo-import">
            <Button variant="outline">写真から取込</Button>
          </Link>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>手動で追加</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={addManualInventoryAction} className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>マスターから選択（任意）</Label>
              <Select name="flavorMasterId" defaultValue="">
                <option value="">— マスターを選択しない（カスタム入力） —</option>
                {flavors.map((f) => (
                  <option key={f.id} value={f.id}>
                    {brandById.get(f.brandId)?.name} / {f.displayNameJa ?? f.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>カスタムブランド（マスター未選択時）</Label>
              <Input name="customBrand" placeholder="例: 新ブランド" />
            </div>
            <div>
              <Label>カスタムフレーバー名</Label>
              <Input name="customName" placeholder="例: マンゴーミルク" />
            </div>
            <div>
              <Label>量 (g)</Label>
              <Input name="amountGram" type="number" min="0" placeholder="50" />
            </div>
            <div>
              <Label>状態</Label>
              <Select name="status" defaultValue="in_stock">
                <option value="in_stock">在庫あり</option>
                <option value="low">わずか</option>
                <option value="out">切れ</option>
                <option value="planned">購入予定</option>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label>購入URL（任意）</Label>
              <Input name="purchaseUrl" placeholder="https://..." />
            </div>
            <div className="sm:col-span-2">
              <Label>メモ（任意）</Label>
              <Input name="memo" placeholder="お気に入り / 開封日など" />
            </div>
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input type="checkbox" name="submitMaster" />
              マスターに未登録の場合、登録申請する（キュレーター承認制）
            </label>
            <div className="sm:col-span-2">
              <Button type="submit">在庫に追加</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h2 className="font-display text-lg">
            在庫一覧
            <span className="ml-2 lisso-mono text-sm text-muted-foreground">
              {filtered.length}/{inventory.length}
            </span>
          </h2>
        </div>

        {presentBrands.length > 1 && (
          <div className="flex flex-wrap gap-1.5">
            <BrandChip label="すべて" href="/inventory" active={!brandFilter} />
            {presentBrands.map((b) => (
              <BrandChip
                key={b}
                label={b}
                href={`/inventory?brand=${encodeURIComponent(b)}`}
                active={brandFilter === b}
              />
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <EmptyState
            title={inventory.length === 0 ? "在庫がありません" : "この絞り込みに一致する在庫はありません"}
            description={inventory.length === 0 ? "上のフォーム、または写真取込から追加してください。" : undefined}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => {
              const fm = item.flavorMasterId ? flavorById.get(item.flavorMasterId) : undefined;
              const brand = itemBrand(item);
              const flavorName = fm
                ? fm.displayNameJa ?? fm.name
                : item.customName ?? "(無名)";
              return (
                <Card key={item.id} className="lisso-card-hover">
                  <CardContent className="py-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="lisso-mono text-[11px] text-muted-foreground truncate">
                          {brand}
                        </div>
                        {fm ? (
                          <Link
                            href={`/flavors/${fm.id}`}
                            className="text-sm font-medium hover:underline break-words"
                          >
                            {flavorName}
                          </Link>
                        ) : (
                          <span className="text-sm font-medium break-words">{flavorName}</span>
                        )}
                      </div>
                      <Badge variant={STATUS_VARIANT[item.status] ?? "muted"}>{item.status}</Badge>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {item.amountGram != null && <Badge variant="muted">{item.amountGram}g</Badge>}
                      <Badge variant="outline">{item.source}</Badge>
                      {!fm && <Badge variant="warn">custom</Badge>}
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t">
                      <form
                        action={updateInventoryStatusAction}
                        className="flex items-center gap-1 mt-2"
                      >
                        <input type="hidden" name="id" value={item.id} />
                        <Select name="status" defaultValue={item.status} className="h-8 w-24">
                          <option value="in_stock">在庫あり</option>
                          <option value="low">わずか</option>
                          <option value="out">切れ</option>
                          <option value="planned">予定</option>
                        </Select>
                        <Button size="sm" variant="outline" type="submit">
                          更新
                        </Button>
                      </form>
                      <form action={removeInventoryAction} className="mt-2 ml-auto">
                        <input type="hidden" name="id" value={item.id} />
                        <Button size="sm" variant="destructive" type="submit">
                          削除
                        </Button>
                      </form>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function BrandChip({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-sm border px-2.5 py-1 text-xs transition-colors ${
        active
          ? "bg-secondary text-foreground border-border"
          : "text-muted-foreground hover:text-foreground hover:border-foreground/30"
      }`}
    >
      {label}
    </Link>
  );
}
