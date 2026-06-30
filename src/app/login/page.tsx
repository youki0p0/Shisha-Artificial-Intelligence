"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { AUTH_PASSWORD_ONLY, isSupabaseConfigured } from "@/lib/supabase/env";

type Mode = "signin" | "signup" | "magic";

/** Read a safe in-app `?next=` redirect target (defaults to "/"). */
function nextTarget(): string {
  if (typeof window === "undefined") return "/";
  const n = new URLSearchParams(window.location.search).get("next");
  // Only allow same-site absolute paths to avoid open redirects.
  return n && n.startsWith("/") && !n.startsWith("//") ? n : "/";
}

/** Reject after `ms` so a hung auth request can never freeze the button. */
function withTimeout<T>(p: Promise<T>, ms = 20000): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error("タイムアウトしました。通信環境やSupabase設定をご確認ください。")),
        ms,
      ),
    ),
  ]);
}

/**
 * Map common Supabase Auth errors to actionable Japanese guidance. The raw
 * message is still shown (small) so config issues are diagnosable.
 */
function describeAuthError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  const m = raw.toLowerCase();
  if (m.includes("rate limit") || m.includes("too many") || m.includes("429")) {
    return "短時間に送りすぎです。数分おいてから再度お試しください。";
  }
  if (m.includes("redirect") && (m.includes("not allowed") || m.includes("invalid"))) {
    return "リダイレクトURLが許可されていません。Supabase の Authentication → URL Configuration に、このサイトの /auth/callback を追加してください。";
  }
  if (m.includes("sending") || m.includes("smtp") || m.includes("email") && m.includes("error")) {
    return "メールの送信に失敗しました。Supabase の Authentication → Email/SMTP 設定（カスタムSMTP）をご確認ください。";
  }
  if (m.includes("signups not allowed") || m.includes("signup is disabled")) {
    return "新規登録が無効になっています。Supabase の Authentication → Providers でメール登録を有効にしてください。";
  }
  if (m.includes("invalid login credentials")) {
    return "メールアドレスまたはパスワードが違います。";
  }
  if (m.includes("email not confirmed")) {
    return "メールアドレスが未確認です。届いた確認リンクを開いてください。";
  }
  return `エラー: ${raw}`;
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      // Guard first: with no Supabase env (e.g. a preview deploy missing the
      // vars) createBrowserClient throws synchronously — surface it instead of
      // hanging on "処理中…".
      if (!isSupabaseConfigured()) {
        throw new Error(
          "この環境にSupabaseの接続情報が設定されていません。Vercelの環境変数 NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY を（Preview含め）設定してください。",
        );
      }
      const sb = getBrowserSupabase();
      const next = nextTarget();
      const redirectTo = `${location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
      if (mode === "magic") {
        const { error } = await withTimeout(
          sb.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } }),
        );
        if (error) throw error;
        setMessage("ログイン用リンクをメールに送りました。メールを確認してください。");
        return;
      }
      if (mode === "signup") {
        const { error } = await withTimeout(
          sb.auth.signUp({ email, password, options: { emailRedirectTo: redirectTo } }),
        );
        if (error) throw error;
        setMessage("確認メールを送りました。リンクを開くと登録が完了します。");
        return;
      }
      const { error } = await withTimeout(
        sb.auth.signInWithPassword({ email, password }),
      );
      if (error) throw error;
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(describeAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm w-full py-12">
      <div className="lisso-eyebrow mb-2">ShishaOS</div>
      <h1 className="text-2xl font-medium mb-1">ログイン</h1>
      <p className="text-sm text-muted-foreground mb-6">
        ログインすると、在庫とレシピがあなた専用に保存されます。
      </p>

      {!AUTH_PASSWORD_ONLY && (
        <div className="flex gap-1 mb-5 text-sm">
          {(
            [
              ["signin", "パスワード"],
              ["signup", "新規登録"],
              ["magic", "メールリンク"],
            ] as [Mode, string][]
          ).map(([m, label]) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setError(null);
                setMessage(null);
              }}
              className={`px-3 py-1.5 rounded-sm transition-colors ${
                mode === m
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block text-sm">
          <span className="text-muted-foreground">メールアドレス</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-sm border bg-background px-3 py-2"
            autoComplete="email"
          />
        </label>

        {mode !== "magic" && (
          <label className="block text-sm">
            <span className="text-muted-foreground">パスワード</span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-sm border bg-background px-3 py-2"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
            />
          </label>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-sm bg-foreground text-background py-2 font-medium disabled:opacity-50"
        >
          {busy
            ? "処理中…"
            : mode === "signup"
              ? "登録する"
              : mode === "magic"
                ? "リンクを送る"
                : "ログイン"}
        </button>
      </form>

      {message && <p className="mt-4 text-sm text-foreground">{message}</p>}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
    </div>
  );
}
