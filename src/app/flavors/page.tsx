import Link from "next/link";
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
  EmptyState,
  Input,
  PageHeader,
} from "@/components/ui/primitives";

const PAGE_SIZE = 48;

export default async function FlavorsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page: pageParam } = await searchParams;
  const repos = getRepositories();
  const [matched, brands] = await Promise.all([
    q ? repos.flavors.search(q) : repos.flavors.list(),
    repos.brands.list(),
  ]);
  const brandById = new Map(brands.map((b) => [b.id, b]));

  // Master data lives in memory (fast), but we only render one page at a time so
  // the 3,000+ catalogue stays snappy instead of rendering every card at once.
  const total = matched.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(pageParam) || 1), totalPages);
  const start = (page - 1) * PAGE_SIZE;
  const flavors = matched.slice(start, start + PAGE_SIZE);

  const pageHref = (p: number) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (p > 1) sp.set("page", String(p));
    const s = sp.toString();
    return s ? `/flavors?${s}` : "/flavors";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Flavor Master"
        title="フレーバー検索"
        description="ブランド・フレーバー名・タグで検索。味プロファイルを確認して在庫に追加できます。"
      />

      <form className="flex gap-2" method="get">
        <Input name="q" defaultValue={q ?? ""} placeholder="例: tea / コーラ / Al Fakher" />
        <Button type="submit">検索</Button>
      </form>

      <p className="text-sm text-muted-foreground">
        {total.toLocaleString()}件{q ? `（「${q}」で絞り込み）` : ""}
        {total > 0 && ` · ${start + 1}–${start + flavors.length}件目を表示`}
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {flavors.map((f) => (
          <Card key={f.id} className="lisso-card-hover">
            <CardHeader>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <CardTitle>
                  <Link href={`/flavors/${f.id}`} className="hover:underline">
                    {f.displayNameJa ?? f.name}
                  </Link>
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
      </div>

      {flavors.length === 0 && (
        <EmptyState
          title="該当するフレーバーがありません"
          description={q ? `「${q}」に一致する項目は見つかりませんでした。` : undefined}
        />
      )}

      {totalPages > 1 && (
        <nav className="flex items-center justify-between gap-2 pt-2">
          <PageLink href={pageHref(page - 1)} disabled={page <= 1}>
            ← 前へ
          </PageLink>
          <span className="lisso-mono text-xs text-muted-foreground">
            {page} / {totalPages}
          </span>
          <PageLink href={pageHref(page + 1)} disabled={page >= totalPages}>
            次へ →
          </PageLink>
        </nav>
      )}
    </div>
  );
}

function PageLink({
  href,
  disabled,
  children,
}: {
  href: string;
  disabled: boolean;
  children: React.ReactNode;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 h-8 px-3 text-sm rounded-sm border font-medium transition-colors";
  if (disabled) {
    return (
      <span className={`${base} border-border text-muted-foreground/40 pointer-events-none`}>
        {children}
      </span>
    );
  }
  return (
    <a
      href={href}
      className={`${base} border-border hover:border-foreground/40 hover:text-foreground`}
    >
      {children}
    </a>
  );
}
