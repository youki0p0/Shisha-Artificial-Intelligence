import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "LISSO ShishaOS",
  description:
    "シーシャ（水たばこ）のフレーバー在庫管理とレシピ生成サービス。OCRとデータベース主導の設計。",
};

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/inventory", label: "Inventory" },
  { href: "/photo-import", label: "Photo" },
  { href: "/flavors", label: "Flavors" },
  { href: "/recipes/new", label: "Mix" },
  { href: "/admin", label: "Admin" },
];

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@500;600;700&family=Zen+Kaku+Gothic+New:wght@400;500;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="min-h-screen flex flex-col">
          <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
            <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-5 flex-wrap">
              <Link href="/" className="flex items-center gap-2.5">
                <span className="text-base font-medium tracking-[0.28em] pl-1">
                  LISSO
                </span>
                <span className="lisso-mark" aria-hidden="true" />
                <span className="lisso-eyebrow ml-1.5 hidden sm:inline">
                  ShishaOS
                </span>
              </Link>
              <nav className="flex gap-0.5 flex-wrap text-sm">
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="px-3 py-1.5 rounded-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="ml-auto lisso-mono text-xs text-muted-foreground">
                {user.displayName}
                <span className="text-foreground/40"> · {user.role}</span>
              </div>
            </div>
          </header>
          <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-8">
            {children}
          </main>
          <footer className="border-t bg-background">
            <div className="mx-auto max-w-6xl px-4 py-6 space-y-1.5 lisso-mono text-[11px] tracking-wide text-muted-foreground/80">
              <p>
                ※ 20歳未満の利用はできません。喫煙には健康リスクがあります。本サービスは健康効果を主張しません。
              </p>
              <p>
                OCR・AI・Web検索の結果は不確実です。必ず手動で確認してから在庫・レシピに反映してください。
              </p>
              <p className="pt-1 uppercase tracking-[0.18em] text-muted-foreground/60">
                © 2026 合同会社 LISSO · For 20+ · Drink responsibly
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
