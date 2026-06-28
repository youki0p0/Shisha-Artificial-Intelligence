import { getRepositories } from "@/repositories";
import { getCurrentUser, isCuratorOrAdmin } from "@/lib/auth";
import {
  approveSubmissionAction,
  rejectSubmissionAction,
} from "@/app/actions";
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

/**
 * Admin / Curator skeleton. Read-only management lists for master data plus an
 * actionable MasterSubmission review queue. Full CRUD editors are a future step.
 */
export default async function AdminPage() {
  const user = await getCurrentUser();
  const repos = getRepositories();
  const [brands, flavors, tasteWords, synergy, heat, submissions] =
    await Promise.all([
      repos.brands.list(),
      repos.flavors.list(),
      repos.tasteWords.list(),
      repos.synergy.list(),
      repos.heatTemplates.list(),
      repos.masterSubmissions.list(),
    ]);

  if (!isCuratorOrAdmin(user)) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Admin" title="管理 / キュレーター" />
        <Card>
          <CardContent className="py-6 text-sm text-muted-foreground">
            この画面はキュレーター / 管理者のみ利用できます。現在のロール: {user.role}。
            <br />
            デモではクッキー <code>sfos_uid=user_lisso</code> または{" "}
            <code>user_admin</code> を設定すると閲覧できます。
          </CardContent>
        </Card>
      </div>
    );
  }

  const pending = submissions.filter((s) => s.status === "pending");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="管理 / キュレーター"
        description="マスターデータの確認と、ユーザーからの登録申請レビュー。"
      />

      <Card>
        <CardHeader>
          <CardTitle>マスター登録申請（要レビュー: {pending.length}）</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {submissions.length === 0 && <EmptyState title="申請はありません" />}
          {submissions.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between gap-2 border rounded-md px-3 py-2 flex-wrap"
            >
              <div className="text-sm">
                <span className="font-medium">
                  {s.brandName} / {s.flavorName}
                </span>
                {s.memo && (
                  <span className="text-muted-foreground"> — {s.memo}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    s.status === "pending"
                      ? "warn"
                      : s.status === "approved"
                        ? "success"
                        : "muted"
                  }
                >
                  {s.status}
                </Badge>
                {s.status === "pending" && (
                  <>
                    <form action={approveSubmissionAction}>
                      <input type="hidden" name="id" value={s.id} />
                      <Button size="sm" type="submit">
                        承認
                      </Button>
                    </form>
                    <form action={rejectSubmissionAction}>
                      <input type="hidden" name="id" value={s.id} />
                      <Button size="sm" variant="destructive" type="submit">
                        却下
                      </Button>
                    </form>
                  </>
                )}
              </div>
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            ※ 承認してもAIや自動処理は味パラメータを作成しません。FlavorMasterの
            数値は人間（キュレーター）が設定します。
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <ManagementList title={`ブランド (${brands.length})`} items={brands.map((b) => b.name)} />
        <ManagementList
          title={`フレーバーマスター (${flavors.length})`}
          items={flavors.map((f) => `${f.displayNameJa ?? f.name}`)}
        />
        <ManagementList
          title={`テイストワード (${tasteWords.length})`}
          items={tasteWords.map((t) => t.keyword)}
        />
        <ManagementList
          title={`シナジールール (${synergy.length})`}
          items={synergy.map((s) => s.name)}
        />
        <ManagementList
          title={`ヒートテンプレート (${heat.length})`}
          items={heat.map((h) => h.name)}
        />
      </div>
    </div>
  );
}

function ManagementList({ title, items }: { title: string; items: string[] }) {
  // Cap the preview so large master tables (3,000+ flavors) stay snappy.
  const LIMIT = 50;
  const shown = items.slice(0, LIMIT);
  const overflow = items.length - shown.length;
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="text-sm space-y-1 list-disc pl-5 text-muted-foreground">
          {shown.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
        {overflow > 0 && (
          <p className="text-xs text-muted-foreground/70 mt-2">
            ほか {overflow.toLocaleString()} 件
          </p>
        )}
      </CardContent>
    </Card>
  );
}
