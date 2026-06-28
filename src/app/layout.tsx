import type { Metadata } from "next";
import "./globals.css";
import { getCurrentUser, isLoggedIn } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { Nav } from "@/components/ui/Nav";

export const metadata: Metadata = {
  metadataBase: new URL("https://shisha-artificial-intelligence.vercel.app"),
  title: {
    default: "ShishaOS — シーシャ・ミクソロジー",
    template: "%s · ShishaOS",
  },
  description:
    "在庫からあなただけのシーシャMIXを設計。OCR・データベース主導の、AIに依存しないミクソロジーエンジン。",
  openGraph: {
    title: "ShishaOS",
    description: "在庫からあなただけのシーシャMIXを設計するミクソロジーエンジン。",
    siteName: "ShishaOS",
    locale: "ja_JP",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const supabaseMode = isSupabaseConfigured();
  const loggedIn = supabaseMode ? await isLoggedIn() : false;

  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@500;600;700&family=Zen+Kaku+Gothic+New:wght@400;500;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="min-h-screen flex flex-col">
          <Nav
            user={{ displayName: user.displayName, role: user.role }}
            loggedIn={loggedIn}
            supabaseMode={supabaseMode}
          />
          <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-8 sm:py-10">{children}</main>
          <footer className="border-t bg-card/40">
            <div className="mx-auto max-w-6xl px-4 py-7 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
              <div className="space-y-1.5 lisso-mono text-[11px] tracking-wide text-muted-foreground/80">
                <p>※ 20歳未満の利用はできません。喫煙には健康リスクがあります。本サービスは健康効果を主張しません。</p>
                <p>OCR・AI・Web検索の結果は不確実です。必ず手動で確認してから在庫・レシピに反映してください。</p>
              </div>
              <div className="flex items-center gap-2 sm:justify-end">
                <span className="lisso-mark" aria-hidden="true" />
                <span className="lisso-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground/60">
                  © 2026 合同会社 LISSO · For 20+
                </span>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
