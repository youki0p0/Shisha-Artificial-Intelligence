import Link from "next/link";
import { notFound } from "next/navigation";
import { getRepositories } from "@/repositories";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/primitives";
import { PrintButton } from "@/components/PrintButton";
import { formatMonth, formatYen, isMonthKey, wageForMonth } from "@/lib/wages";
import { formatDate, monthOf } from "@/lib/shifts";

/**
 * Employee pay statement (給与明細) for one staff member and one month.
 * Viewable by the employee themselves or an admin. Print-friendly (Save as PDF).
 */
export default async function PayslipPage({
  params,
}: {
  params: Promise<{ userId: string; month: string }>;
}) {
  const { userId, month } = await params;
  if (!isMonthKey(month)) notFound();

  const repos = getRepositories();
  const viewer = await getCurrentUser();
  const staff = await repos.users.getById(userId);
  if (!staff) notFound();

  // Access: the employee themselves, or an admin.
  if (viewer.id !== userId && !isAdmin(viewer)) {
    return (
      <div className="max-w-2xl mx-auto py-10">
        <Card>
          <CardContent className="py-6 text-sm text-muted-foreground">
            この給与明細を表示する権限がありません。本人または管理者のみ閲覧できます。
          </CardContent>
        </Card>
      </div>
    );
  }

  const shifts = (await repos.shifts.listByUser(userId))
    .filter((s) => monthOf(s.date) === month)
    .sort((a, b) => a.date.localeCompare(b.date));
  const totalHours =
    Math.round(shifts.reduce((sum, s) => sum + s.hours, 0) * 100) / 100;
  const wage = wageForMonth(staff.wages, month);
  const gross = wage === undefined ? undefined : Math.round(totalHours * wage);

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-4 print:py-0">
      <div className="flex items-center justify-between print:hidden">
        <Link href="/admin" className="text-sm text-muted-foreground hover:underline">
          ← 管理画面へ戻る
        </Link>
        <PrintButton />
      </div>

      <Card className="print:border-0 print:shadow-none">
        <CardContent className="py-8 space-y-6">
          <header className="flex items-end justify-between border-b pb-4">
            <div>
              <div className="lisso-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                ShishaOS
              </div>
              <h1 className="text-xl font-semibold">給与明細</h1>
            </div>
            <div className="text-right text-sm">
              <div className="font-medium">{formatMonth(month)}分</div>
              <div className="text-muted-foreground lisso-mono text-xs">{month}</div>
            </div>
          </header>

          <div className="flex items-center gap-2">
            <span className="text-lg font-medium">{staff.displayName}</span>
            {staff.handle && (
              <span className="lisso-mono text-xs text-muted-foreground">
                @{staff.handle}
              </span>
            )}
            <span className="ml-2 text-sm text-muted-foreground">様</span>
          </div>

          <div>
            <div className="lisso-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground mb-1">
              勤務内訳
            </div>
            {shifts.length === 0 ? (
              <p className="text-sm text-muted-foreground">この月の勤務記録はありません。</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-xs">
                    <th className="py-1 text-left font-normal">日付</th>
                    <th className="py-1 text-left font-normal">時間</th>
                    <th className="py-1 text-right font-normal">休憩</th>
                    <th className="py-1 text-right font-normal">勤務時間</th>
                  </tr>
                </thead>
                <tbody>
                  {shifts.map((s) => (
                    <tr key={s.id} className="border-b border-border/40">
                      <td className="py-1 lisso-mono text-muted-foreground">
                        {formatDate(s.date)}
                      </td>
                      <td className="py-1 tabular-nums">
                        {s.start}–{s.end}
                      </td>
                      <td className="py-1 text-right tabular-nums text-muted-foreground">
                        {s.breakMinutes ? `${s.breakMinutes}分` : "—"}
                      </td>
                      <td className="py-1 text-right tabular-nums font-medium">
                        {s.hours}h
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="border-t pt-4 space-y-1.5 text-sm">
            <Row label="勤務日数" value={`${shifts.length} 日`} />
            <Row label="合計勤務時間" value={`${totalHours} 時間`} />
            <Row
              label="時給"
              value={wage !== undefined ? formatYen(wage) : "未設定"}
            />
            <div className="flex items-center justify-between border-t pt-2 mt-1">
              <span className="font-medium">支給額（総支給）</span>
              <span className="text-lg font-semibold tabular-nums">
                {gross !== undefined ? formatYen(gross) : "—"}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground">
            ※ 本明細は総支給額（控除前）です。合計勤務時間 × 時給で算出しています。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
