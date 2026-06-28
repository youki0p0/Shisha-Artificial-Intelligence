import Link from "next/link";
import { getRepositories } from "@/repositories";
import { getCurrentUser, isAdmin, isCuratorOrAdmin } from "@/lib/auth";
import {
  addCurationNoteAction,
  addShiftAction,
  addWageEntryAction,
  approveSubmissionAction,
  deleteCurationNoteAction,
  deleteShiftAction,
  deleteWageEntryAction,
  rejectSubmissionAction,
  renameUserAction,
  toggleCurationNoteAction,
} from "@/app/actions";
import {
  currentMonth,
  currentWage,
  formatMonth,
  formatYen,
  isMonthKey,
  sortWages,
  wageForMonth,
} from "@/lib/wages";
import { formatDate, monthOf, summarizePayroll } from "@/lib/shifts";
import type { ShiftEntry } from "@/domain/types";
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
  searchParams: Promise<{ fq?: string; fid?: string; pm?: string }>;
}) {
  const { fq, fid, pm } = await searchParams;
  const user = await getCurrentUser();
  const repos = getRepositories();
  const [brands, flavors, tasteWords, synergy, heat, submissions, allNotes, users] =
    await Promise.all([
      repos.brands.list(),
      repos.flavors.list(),
      repos.tasteWords.list(),
      repos.synergy.list(),
      repos.heatTemplates.list(),
      repos.masterSubmissions.list(),
      repos.curationNotes.list(),
      repos.users.list(),
    ]);

  // Shift logs (admin-only payroll). Fetch per user in parallel.
  const shiftsByUser: Record<string, ShiftEntry[]> = {};
  if (isAdmin(user)) {
    const entries = await Promise.all(
      users.map(
        async (u) => [u.id, await repos.shifts.listByUser(u.id)] as const,
      ),
    );
    for (const [id, list] of entries) shiftsByUser[id] = list;
  }

  // Cross-staff payroll roster for one month (for handing out pay).
  const payrollMonth = pm && isMonthKey(pm) ? pm : currentMonth();
  const roster = users
    .map((u) => {
      const monthShifts = (shiftsByUser[u.id] ?? []).filter(
        (s) => monthOf(s.date) === payrollMonth,
      );
      const hours =
        Math.round(monthShifts.reduce((a, s) => a + s.hours, 0) * 100) / 100;
      const wage = wageForMonth(u.wages, payrollMonth);
      const pay = wage === undefined ? undefined : Math.round(hours * wage);
      return { u, count: monthShifts.length, hours, wage, pay };
    })
    // Only real staff: anyone with a wage schedule or shifts that month.
    .filter((r) => r.count > 0 || (r.u.wages?.length ?? 0) > 0);
  const rosterTotal = roster.reduce((a, r) => a + (r.pay ?? 0), 0);

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

      {isAdmin(user) && (
        <Card>
          <CardHeader>
            <CardTitle>月次給与一覧 / 給料渡し用（管理者専用）</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <form className="flex items-end gap-2" method="get">
              <div>
                <Label>対象月</Label>
                <Input type="month" name="pm" defaultValue={payrollMonth} />
              </div>
              <Button type="submit" variant="outline" size="sm">
                表示
              </Button>
            </form>

            {roster.length === 0 ? (
              <EmptyState title={`${formatMonth(payrollMonth)}の対象スタッフはいません`} />
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-xs">
                    <th className="py-1 text-left font-normal">スタッフ</th>
                    <th className="py-1 text-right font-normal">勤務</th>
                    <th className="py-1 text-right font-normal">時間</th>
                    <th className="py-1 text-right font-normal">時給</th>
                    <th className="py-1 text-right font-normal">支給額</th>
                    <th className="py-1 text-right font-normal">明細</th>
                  </tr>
                </thead>
                <tbody>
                  {roster.map((r) => (
                    <tr key={r.u.id} className="border-b border-border/40">
                      <td className="py-1.5">
                        {r.u.displayName}
                        {r.u.handle && (
                          <span className="ml-1.5 lisso-mono text-[11px] text-muted-foreground">
                            @{r.u.handle}
                          </span>
                        )}
                      </td>
                      <td className="py-1.5 text-right tabular-nums text-muted-foreground">
                        {r.count}日
                      </td>
                      <td className="py-1.5 text-right tabular-nums">{r.hours}h</td>
                      <td className="py-1.5 text-right tabular-nums text-muted-foreground">
                        {r.wage !== undefined ? formatYen(r.wage) : "未設定"}
                      </td>
                      <td className="py-1.5 text-right tabular-nums font-medium">
                        {r.pay !== undefined ? formatYen(r.pay) : "—"}
                      </td>
                      <td className="py-1.5 text-right">
                        <Link
                          href={`/payslip/${r.u.id}/${payrollMonth}`}
                          className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                        >
                          明細
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t">
                    <td className="py-1.5 font-medium" colSpan={4}>
                      合計支給額（{formatMonth(payrollMonth)}）
                    </td>
                    <td className="py-1.5 text-right font-semibold tabular-nums">
                      {formatYen(rosterTotal)}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            )}
            <p className="text-[11px] text-muted-foreground">
              ※ 総支給額（控除前）。各行の「明細」から従業員に渡す給与明細を開けます。時給の変更・勤務追加は下の「ユーザー管理」から行えます。
            </p>
          </CardContent>
        </Card>
      )}

      {isAdmin(user) && (
        <Card>
          <CardHeader>
            <CardTitle>ユーザー管理 / スタッフ時給（管理者専用）</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">
              氏名の変更と、スタッフの時給を「何月から」で設定できます。各月の時給は、その月以前で最も新しい設定が適用されます（例: 6月まで ¥1,200・7月から ¥1,250）。
            </p>
            <div className="space-y-3">
              {users.map((u) => {
                const wages = sortWages(u.wages ?? []);
                const eff = currentWage(u.wages);
                const shifts = shiftsByUser[u.id] ?? [];
                const payroll = summarizePayroll(shifts, u.wages);
                return (
                  <div key={u.id} className="rounded-md border p-3 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{u.displayName}</span>
                      {u.handle && (
                        <span className="lisso-mono text-[11px] text-muted-foreground">
                          @{u.handle}
                        </span>
                      )}
                      <Badge variant={u.role === "admin" ? "success" : "muted"}>
                        {u.role}
                      </Badge>
                      <span className="ml-auto text-sm">
                        今月の時給:{" "}
                        {eff !== undefined ? (
                          <span className="font-medium">{formatYen(eff)}</span>
                        ) : (
                          <span className="text-muted-foreground">未設定</span>
                        )}
                      </span>
                    </div>

                    {/* Rename */}
                    <form action={renameUserAction} className="flex flex-wrap items-end gap-2">
                      <input type="hidden" name="id" value={u.id} />
                      <div className="flex-1 min-w-[180px]">
                        <Label>表示名</Label>
                        <Input name="displayName" defaultValue={u.displayName} />
                      </div>
                      <Button size="sm" variant="outline" type="submit">
                        氏名を保存
                      </Button>
                    </form>

                    {/* Wage schedule */}
                    <div className="space-y-1.5">
                      <div className="lisso-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                        時給スケジュール
                      </div>
                      {wages.length === 0 ? (
                        <p className="text-xs text-muted-foreground">未設定です。</p>
                      ) : (
                        <ul className="text-sm space-y-1">
                          {wages.map((w) => (
                            <li key={w.id} className="flex items-center gap-2">
                              <span className="lisso-mono text-muted-foreground w-28">
                                {formatMonth(w.effectiveFrom)}〜
                              </span>
                              <span className="font-medium">{formatYen(w.hourlyWage)}</span>
                              <form action={deleteWageEntryAction} className="ml-auto">
                                <input type="hidden" name="userId" value={u.id} />
                                <input type="hidden" name="wageId" value={w.id} />
                                <Button size="sm" variant="ghost" type="submit">
                                  削除
                                </Button>
                              </form>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Add wage */}
                    <form
                      action={addWageEntryAction}
                      className="flex flex-wrap items-end gap-2 border-t pt-3"
                    >
                      <input type="hidden" name="userId" value={u.id} />
                      <div>
                        <Label>適用開始月</Label>
                        <Input type="month" name="effectiveFrom" defaultValue={currentMonth()} />
                      </div>
                      <div>
                        <Label>時給（円）</Label>
                        <Input
                          type="number"
                          name="hourlyWage"
                          min={0}
                          step={10}
                          placeholder="1250"
                        />
                      </div>
                      <Button size="sm" type="submit">
                        時給を追加
                      </Button>
                    </form>

                    {/* Payroll summary by month */}
                    {payroll.length > 0 && (
                      <div className="space-y-1.5 border-t pt-3">
                        <div className="lisso-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                          月次給与（勤務時間 × 時給）
                        </div>
                        <table className="w-full text-sm">
                          <tbody>
                            {payroll.map((p) => (
                              <tr key={p.month} className="border-b border-border/40">
                                <td className="py-1 lisso-mono text-muted-foreground">
                                  {formatMonth(p.month)}
                                </td>
                                <td className="py-1 text-right tabular-nums">
                                  {p.hours}h
                                </td>
                                <td className="py-1 text-right text-muted-foreground tabular-nums">
                                  {p.wage !== undefined ? `× ${formatYen(p.wage)}` : "時給未設定"}
                                </td>
                                <td className="py-1 text-right font-medium tabular-nums">
                                  {p.pay !== undefined ? formatYen(p.pay) : "—"}
                                </td>
                                <td className="py-1 text-right">
                                  <Link
                                    href={`/payslip/${u.id}/${p.month}`}
                                    className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                                  >
                                    明細
                                  </Link>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Shift log */}
                    <details className="border-t pt-3">
                      <summary className="cursor-pointer text-sm text-muted-foreground">
                        勤務記録（{shifts.length}件）
                      </summary>
                      <div className="mt-2 space-y-1.5">
                        {shifts.length === 0 ? (
                          <p className="text-xs text-muted-foreground">記録はありません。</p>
                        ) : (
                          <ul className="text-sm space-y-1">
                            {shifts.map((s) => (
                              <li key={s.id} className="flex items-center gap-2">
                                <span className="lisso-mono text-muted-foreground w-14">
                                  {formatDate(s.date)}
                                </span>
                                <span className="tabular-nums text-muted-foreground">
                                  {s.start}–{s.end}
                                </span>
                                <span className="tabular-nums font-medium">{s.hours}h</span>
                                <form action={deleteShiftAction} className="ml-auto">
                                  <input type="hidden" name="id" value={s.id} />
                                  <Button size="sm" variant="ghost" type="submit">
                                    削除
                                  </Button>
                                </form>
                              </li>
                            ))}
                          </ul>
                        )}

                        {/* Add shift */}
                        <form
                          action={addShiftAction}
                          className="flex flex-wrap items-end gap-2 border-t pt-3"
                        >
                          <input type="hidden" name="userId" value={u.id} />
                          <div>
                            <Label>日付</Label>
                            <Input type="date" name="date" />
                          </div>
                          <div>
                            <Label>開始</Label>
                            <Input type="time" name="start" defaultValue="13:00" />
                          </div>
                          <div>
                            <Label>終了</Label>
                            <Input type="time" name="end" defaultValue="21:00" />
                          </div>
                          <div className="w-24">
                            <Label>休憩(分)</Label>
                            <Input type="number" name="breakMinutes" min={0} step={5} defaultValue={0} />
                          </div>
                          <Button size="sm" type="submit">
                            勤務を追加
                          </Button>
                        </form>
                      </div>
                    </details>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

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
