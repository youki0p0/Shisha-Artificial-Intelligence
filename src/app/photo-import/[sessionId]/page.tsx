import { notFound } from "next/navigation";
import { getRepositories } from "@/repositories";
import {
  approveDetectedItemAction,
  ignoreDetectedItemAction,
} from "@/app/actions";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Select,
} from "@/components/ui/primitives";

export default async function PhotoReviewPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const repos = getRepositories();
  const session = await repos.photoImport.getSession(sessionId);
  if (!session) notFound();

  const [items, flavors, brands] = await Promise.all([
    repos.photoImport.listItemsBySession(sessionId),
    repos.flavors.list(),
    repos.brands.list(),
  ]);
  const brandById = new Map(brands.map((b) => [b.id, b]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">写真取込レビュー</h1>
        <p className="text-sm text-muted-foreground">
          OCRと照合の結果は不確実です。各項目を確認・修正してから承認してください。
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>アップロード画像</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video rounded-md bg-muted flex items-center justify-center text-muted-foreground text-sm">
              {session.imageUrl}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              OCR信頼度: {session.ocrConfidence ?? "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>OCR生テキスト</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs whitespace-pre-wrap text-muted-foreground">
              {session.detectedText ?? "(なし)"}
            </pre>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>検出された候補（{items.length}）</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="border rounded-md p-3 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <code className="text-sm">{item.rawText}</code>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      item.matchConfidence >= 0.7
                        ? "success"
                        : item.matchConfidence >= 0.4
                          ? "warn"
                          : "muted"
                    }
                  >
                    一致 {Math.round(item.matchConfidence * 100)}%
                  </Badge>
                  <Badge variant="outline">{item.status}</Badge>
                </div>
              </div>

              {item.status === "pending" ? (
                <form
                  action={approveDetectedItemAction}
                  className="grid gap-2 sm:grid-cols-4 items-end"
                >
                  <input type="hidden" name="itemId" value={item.id} />
                  <input type="hidden" name="sessionId" value={sessionId} />
                  <div className="sm:col-span-2">
                    <label className="text-xs text-muted-foreground">マスター候補</label>
                    <Select
                      name="matchedFlavorMasterId"
                      defaultValue={item.matchedFlavorMasterId ?? ""}
                    >
                      <option value="">— マスターなし（カスタム） —</option>
                      {flavors.map((f) => (
                        <option key={f.id} value={f.id}>
                          {brandById.get(f.brandId)?.name} / {f.displayNameJa ?? f.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">ブランド</label>
                    <Input name="detectedBrand" defaultValue={item.detectedBrand ?? ""} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">フレーバー</label>
                    <Input
                      name="detectedFlavorName"
                      defaultValue={item.detectedFlavorName ?? ""}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">量 (g)</label>
                    <Input
                      name="detectedAmountGram"
                      type="number"
                      defaultValue={item.detectedAmountGram ?? ""}
                    />
                  </div>
                  <div className="flex gap-2 sm:col-span-3">
                    <Button size="sm" type="submit">
                      承認して在庫へ
                    </Button>
                  </div>
                  <div />
                </form>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {item.detectedBrand} / {item.detectedFlavorName}{" "}
                  {item.detectedAmountGram ? `${item.detectedAmountGram}g` : ""}
                </p>
              )}

              {item.status === "pending" && (
                <form action={ignoreDetectedItemAction}>
                  <input type="hidden" name="itemId" value={item.id} />
                  <input type="hidden" name="sessionId" value={sessionId} />
                  <Button size="sm" variant="ghost" type="submit">
                    無視する
                  </Button>
                </form>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
