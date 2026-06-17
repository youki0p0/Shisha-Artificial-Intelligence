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
  Input,
  Label,
  Select,
} from "@/components/ui/primitives";

const STATUS_VARIANT: Record<string, "success" | "warn" | "muted" | "outline"> = {
  in_stock: "success",
  low: "warn",
  out: "muted",
  planned: "outline",
};

export default async function InventoryPage() {
  const userId = await getCurrentUserId();
  const repos = getRepositories();
  const [inventory, flavors, brands] = await Promise.all([
    repos.inventory.listByUser(userId),
    repos.flavors.list(),
    repos.brands.list(),
  ]);
  const flavorById = new Map(flavors.map((f) => [f.id, f]));
  const brandById = new Map(brands.map((b) => [b.id, b]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold">マイ在庫</h1>
        <Link href="/photo-import">
          <Button variant="outline">写真から取込</Button>
        </Link>
      </div>

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

      <Card>
        <CardHeader>
          <CardTitle>在庫一覧（{inventory.length}）</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {inventory.length === 0 && (
            <p className="text-sm text-muted-foreground">在庫がありません。</p>
          )}
          {inventory.map((item) => {
            const fm = item.flavorMasterId ? flavorById.get(item.flavorMasterId) : undefined;
            const name = fm
              ? `${brandById.get(fm.brandId)?.name ?? ""} / ${fm.displayNameJa ?? fm.name}`
              : `${item.customBrand ?? "カスタム"} / ${item.customName ?? "(無名)"}`;
            return (
              <div
                key={item.id}
                className="flex items-center justify-between gap-2 border rounded-md px-3 py-2 flex-wrap"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{name}</span>
                  {item.amountGram != null && (
                    <Badge variant="muted">{item.amountGram}g</Badge>
                  )}
                  <Badge variant={STATUS_VARIANT[item.status] ?? "muted"}>
                    {item.status}
                  </Badge>
                  <Badge variant="outline">{item.source}</Badge>
                  {!fm && <Badge variant="warn">custom</Badge>}
                </div>
                <div className="flex items-center gap-2">
                  <form action={updateInventoryStatusAction} className="flex items-center gap-1">
                    <input type="hidden" name="id" value={item.id} />
                    <Select name="status" defaultValue={item.status} className="h-8 w-28">
                      <option value="in_stock">在庫あり</option>
                      <option value="low">わずか</option>
                      <option value="out">切れ</option>
                      <option value="planned">予定</option>
                    </Select>
                    <Button size="sm" variant="outline" type="submit">
                      更新
                    </Button>
                  </form>
                  <form action={removeInventoryAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <Button size="sm" variant="destructive" type="submit">
                      削除
                    </Button>
                  </form>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
