"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase/client";

type Mode = "signin" | "signup" | "magic";

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
    const sb = getBrowserSupabase();
    try {
      if (mode === "magic") {
        const { error } = await sb.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${location.origin}/auth/callback` },
        });
        if (error) throw error;
        setMessage("ログイン用リンクをメールに送りました。メールを確認してください。");
        return;
      }
      if (mode === "signup") {
        const { error } = await sb.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${location.origin}/auth/callback` },
        });
        if (error) throw error;
        setMessage("確認メールを送りました。リンクを開くと登録が完了します。");
        return;
      }
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ログインに失敗しました。");
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
