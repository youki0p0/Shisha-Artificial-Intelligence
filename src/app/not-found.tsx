import Link from "next/link";
import { Button } from "@/components/ui/primitives";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <div className="lisso-eyebrow">404</div>
      <h1 className="text-2xl font-medium">ページが見つかりません</h1>
      <p className="text-sm text-muted-foreground">
        お探しのページは移動または削除された可能性があります。
      </p>
      <Link href="/">
        <Button>ダッシュボードへ戻る</Button>
      </Link>
    </div>
  );
}
