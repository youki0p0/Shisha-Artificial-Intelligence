import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Shisha Flavor OS",
  description:
    "シーシャ（水たばこ）のフレーバー在庫管理とレシピ生成サービス。OCRとデータベース主導の設計。",
};

const NAV = [
  { href: "/", label: "ダッシュボード" },
  { href: "/inventory", label: "在庫" },
  { href: "/photo-import", label: "写真取込" },
  { href: "/flavors", label: "フレーバー検索" },
  { href: "/recipes/new", label: "レシピ生成" },
  { href: "/admin", label: "管理" },
];

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  return (
    <html lang="ja">
      <body>
        <div className="min-h-screen flex flex-col">
          <header className="border-b bg-card">
            <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-4 flex-wrap">
              <Link href="/" className="font-bold text-lg text-primary">
                🌬️ Shisha Flavor OS
              </Link>
              <nav className="flex gap-1 flex-wrap text-sm">
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="px-3 py-1.5 rounded-md hover:bg-secondary"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="ml-auto text-sm text-muted-foreground">
                {user.displayName}（{user.role}）
              </div>
            </div>
          </header>
          <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-6">
            {children}
          </main>
          <footer className="border-t bg-card text-xs text-muted-foreground">
            <div className="mx-auto max-w-6xl px-4 py-4 space-y-1">
              <p>
                ※ 20歳未満の利用はできません。喫煙には健康リスクがあります。本サービスは健康効果を主張しません。
              </p>
              <p>
                OCR・AI・Web検索の結果は不確実です。必ず手動で確認してから在庫・レシピに反映してください。
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
