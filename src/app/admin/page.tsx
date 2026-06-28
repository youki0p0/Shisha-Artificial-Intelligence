import Link from "next/link";
import { getRepositories } from "@/repositories";
import { getCurrentUser, isCuratorOrAdmin } from "@/lib/auth";
import {
  addCurationNoteAction,
  approveSubmissionAction,
  deleteCurationNoteAction,
  rejectSubmissionAction,
  toggleCurationNoteAction,
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
  Textarea,
} from "@/components/ui/primitives";
import { generatedProfiles } from "@/data/seed/flavorProfiles.generated";
import { TasteBars } from "@/components/TasteBars";
import type { FlavorProfile } from "@/data/master/flavorProfile";

/**
 * Curated CSV columns surfaced in the inspector, in reading order. Keys map 1:1
 * to FlavorProfile fields; the label is the Japanese column heading. Derived
 * engine values (TasteVector) are shown separately via <TasteBars />.
 */
const PROFILE_FIELDS: [keyof FlavorProfile, string][] = [
  ["nicotine", "ニコチン"],
  ["intensity", "強度"],
  ["main_notes", "主ノート"],
  ["sub_notes", "副ノート"],
  ["volatility", "揮発性"],
  ["syrup", "シロップ"],
  ["heat_resistance", "耐熱性"],
  ["role", "ロール"],
  ["opening_speed", "立ち上がり"],
  ["peak_time", "ピーク"],
  ["fade_speed", "減衰"],
  ["heat_style", "ヒート特性"],
  ["texture", "テクスチャ"],
  ["nose_finish", "ノーズ/フィニッシュ"],
  ["sweetness_type", "甘味タイプ"],
  ["salinity_type", "塩味タイプ"],
  ["realism", "リアリズム"],
  ["expanded_role", "拡張ロール"],
  ["memo", "メモ"],
  ["notes", "備考"],
  ["confidence", "信頼度"],
  ["source_urls", "出典"],
];

/**
 * Admin / Curator skeleton. Read-only management lists for master data plus an
 * actionable MasterSubmission review queue. Full CRUD editors are a future step.
 */
export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ fq?: string; fid?: string }>;
}) {
  const { fq, fid } = await searchParams;
  const user = await getCurrentUser();
  const repos = getRepositories();
  const [brands, flavors, tasteWords, synergy, heat, submissions, allNotes] =
    await Promise.all([
      repos.brands.list(),
      repos.flavors.list(),
      repos.tasteWords.list(),
      repos.synergy.list(),
      repos.heatTemplates.list(),
      repos.masterSubmissions.list(),
      repos.curationNotes.list(),
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
  const brandById = new Map(brands.map((b) => [b.id, b]));

  // Sensory-parameter inspector + internal notes.
  const searchResults = fq ? (await repos.flavors.search(fq)).slice(0, 24) : [];
  const selected = fid ? flavors.find((f) => f.id === fid) : undefined;
  const selectedProfile: FlavorProfile | undefined = fid ? generatedProfiles[fid] : undefined;
  const selectedNotes = allNotes.filter((n) => n.flavorMasterId === fid);
  const openNotes = allNotes.filter((n) => n.status === "open");
  const inspHref = (params: Record<string, string>) => {
    const sp = new URLSearchParams();
    if (fq) sp.set("fq", fq);
    for (const [k, v] of Object.entries(params)) sp.set(k, v);
    return `/admin?${sp.toString()}`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="管理 / キュレーター"
        description="マスターデータの確認と、ユーザーからの登録申請レビュー。"
      />

      <Card>
        <CardHeader>
          <CardTitle>官能パラメータ確認 ＋ 内部メモ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="flex gap-2" method="get">
            <Input
              name="fq"
              defaultValue={fq ?? ""}
              placeholder="フレーバー検索（例: Al Fakher Mint / コーラ）"
            />
            <Button type="submit">検索</Button>
          </form>

          {searchResults.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {searchResults.map((f) => (
                <Link
                  key={f.id}
                  href={inspHref({ fid: f.id })}
                  className={`rounded-sm border px-2.5 py-1 text-xs transition-colors ${
                    fid === f.id
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:border-foreground/30"
                  }`}
                >
                  {brandById.get(f.brandId)?.name} / {f.displayNameJa ?? f.name}
                </Link>
              ))}
            </div>
          )}

          {selected && (
            <div className="grid gap-4 lg:grid-cols-2 border-t pt-4">
              <div className="space-y-3">
                <div>
                  <div className="lisso-mono text-[11px] text-muted-foreground">
                    {brandById.get(selected.brandId)?.name}
                  </div>
                  <Link href={`/flavors/${selected.id}`} className="text-lg font-medium hover:underline">
                    {selected.displayNameJa ?? selected.name}
                  </Link>
                  <span className="ml-2">
                    <Badge variant={selected.dataStatus === "verified" ? "success" : "muted"}>
                      {selected.dataStatus}
                    </Badge>
                  </span>
                </div>

                {selectedProfile ? (
                  <table className="w-full text-xs">
                    <tbody>
                      {PROFILE_FIELDS.map(([key, label]) => {
                        const v = selectedProfile[key];
                        if (v === null || v === undefined || v === "") return null;
                        return (
                          <tr key={key} className="border-b border-border/40">
                            <td className="py-1 pr-3 lisso-mono text-muted-foreground whitespace-nowrap">
                              {label}
                            </td>
                            <td className="py-1 break-words">{String(v)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    生プロファイル未収録（スタブ等）。導出値のみ表示します。
                  </p>
                )}
                <div className="border-t pt-3">
                  <div className="lisso-mono text-[11px] text-muted-foreground mb-2">
                    導出ベクトル（エンジン入力）
                  </div>
                  <TasteBars flavor={selected} />
                </div>
              </div>

              {/* Internal notes */}
              <div className="space-y-3">
                <div className="lisso-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                  内部メモ（ユーザー非表示）
                </div>
                <div className="space-y-2">
                  {selectedNotes.length === 0 && (
                    <p className="text-xs text-muted-foreground">メモはありません。</p>
                  )}
                  {selectedNotes.map((n) => (
                    <div key={n.id} className="rounded-sm border px-3 py-2 text-sm space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant={n.status === "open" ? "warn" : "success"}>{n.status}</Badge>
                        {n.field && <Badge variant="outline">{n.field}</Badge>}
                        <div className="ml-auto flex gap-1">
                          <form action={toggleCurationNoteAction}>
                            <input type="hidden" name="id" value={n.id} />
                            <input
                              type="hidden"
                              name="status"
                              value={n.status === "open" ? "resolved" : "open"}
                            />
                            <Button size="sm" variant="outline" type="submit">
                              {n.status === "open" ? "解決" : "再開"}
                            </Button>
                          </form>
                          <form action={deleteCurationNoteAction}>
                            <input type="hidden" name="id" value={n.id} />
                            <Button size="sm" variant="ghost" type="submit">
                              削除
                            </Button>
                          </form>
                        </div>
                      </div>
                      <p className="whitespace-pre-wrap">{n.note}</p>
                    </div>
                  ))}
                </div>

                <form action={addCurationNoteAction} className="space-y-2 border-t pt-3">
                  <input type="hidden" name="flavorMasterId" value={selected.id} />
                  <div>
                    <Label>対象パラメータ（任意）</Label>
                    <Input name="field" placeholder="例: nose_finish / nicotine" />
                  </div>
                  <div>
                    <Label>メモ（AIが後で参照して修正します）</Label>
                    <Textarea name="note" placeholder="例: バニラなのにnose_finishがmineral。creamに修正したい。" />
                  </div>
                  <Button size="sm" type="submit">
                    メモを追加
                  </Button>
                </form>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>未解決メモ（{openNotes.length}）</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {openNotes.length === 0 ? (
            <EmptyState title="未解決の内部メモはありません" />
          ) : (
            openNotes.slice(0, 50).map((n) => {
              const f = flavors.find((x) => x.id === n.flavorMasterId);
              return (
                <Link
                  key={n.id}
                  href={inspHref({ fid: n.flavorMasterId })}
                  className="flex items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm lisso-card-hover border border-transparent"
                >
                  <span className="truncate">
                    <span className="text-muted-foreground">{f?.displayNameJa ?? f?.name ?? n.flavorMasterId}</span>
                    {" — "}
                    {n.note}
                  </span>
                  {n.field && <Badge variant="outline">{n.field}</Badge>}
                </Link>
              );
            })
          )}
        </CardContent>
      </Card>

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
