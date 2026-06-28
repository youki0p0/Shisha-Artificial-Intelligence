"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = { href: string; label: string; jp: string };

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", jp: "ダッシュボード" },
  { href: "/inventory", label: "Inventory", jp: "在庫" },
  { href: "/photo-import", label: "Photo", jp: "写真取込" },
  { href: "/flavors", label: "Flavors", jp: "フレーバー" },
  { href: "/recipes/new", label: "Mix", jp: "ミックス" },
  { href: "/admin", label: "Admin", jp: "管理" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function Nav({
  user,
  loggedIn,
  supabaseMode,
}: {
  user: { displayName: string; role: string };
  loggedIn: boolean;
  supabaseMode: boolean;
}) {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);

  const AuthArea = (
    <div className="flex items-center gap-3 lisso-mono text-xs text-muted-foreground">
      {supabaseMode && !loggedIn ? (
        <Link
          href="/login"
          className="rounded-sm bg-foreground text-background px-3 py-1.5 font-medium hover:opacity-90"
        >
          ログイン
        </Link>
      ) : (
        <>
          <span className="truncate max-w-[12rem]">
            {user.displayName}
            <span className="text-foreground/40"> · {user.role}</span>
          </span>
          {supabaseMode && loggedIn && (
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="text-muted-foreground/70 hover:text-foreground transition-colors"
              >
                ログアウト
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-14 items-center gap-5">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <span className="text-base font-medium tracking-[0.28em] pl-0.5">LISSO</span>
            <span className="lisso-mark" aria-hidden="true" />
            <span className="lisso-eyebrow ml-1 hidden sm:inline">ShishaOS</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5 text-sm">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`px-3 py-1.5 rounded-sm transition-colors ${
                    active
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto hidden md:block">{AuthArea}</div>

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="メニュー"
            aria-expanded={open}
            className="ml-auto md:hidden inline-flex h-9 w-9 items-center justify-center rounded-sm border text-muted-foreground hover:text-foreground"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? (
                <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
              ) : (
                <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t py-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center justify-between rounded-sm px-3 py-2 text-sm transition-colors ${
                    active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/60"
                  }`}
                >
                  <span>{item.label}</span>
                  <span className="lisso-mono text-[11px] text-muted-foreground/60">{item.jp}</span>
                </Link>
              );
            })}
            <div className="pt-2 px-3 border-t mt-2">{AuthArea}</div>
          </div>
        )}
      </div>
    </header>
  );
}
