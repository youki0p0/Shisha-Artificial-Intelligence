import Link from "next/link";
import { getRepositories } from "@/repositories";
import { getCurrentUserId } from "@/lib/auth";
import { startPhotoImportAction } from "@/app/actions";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from "@/components/ui/primitives";

export default async function PhotoImportPage() {
  const userId = await getCurrentUserId();
  const repos = getRepositories();
  const sessions = await repos.photoImport.listSessionsByUser(userId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">写真取込</h1>
        <p className="text-sm text-muted-foreground">
          棚・パッケージ・ラベル・販売リスト・スクショなどの写真からOCRで在庫候補を抽出します。
          MVPではOCRはモック実装です（後で実OCRに差し替え可能）。
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>画像をアップロード（モック）</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={startPhotoImportAction} className="space-y-3">
            <div>
              <Label>画像URL（任意・モックではダミーでOK）</Label>
              <Input name="imageUrl" placeholder="mock://uploaded-shelf.jpg" />
            </div>
            <p className="text-xs text-muted-foreground">
              ※ OCRと照合の結果は確定在庫にはなりません。次のレビュー画面で確認・修正して承認します。
            </p>
            <Button type="submit">OCRを実行してレビューへ</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>過去のセッション</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {sessions.length === 0 && (
            <p className="text-sm text-muted-foreground">まだセッションがありません。</p>
          )}
          {sessions.slice().reverse().map((s) => (
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
