"use client";

import { useState } from "react";
import { Button, Input, Label } from "@/components/ui/primitives";

type AddResult = { code: string; ok: boolean; totalQuantity?: number; error?: string };
type Resp = { loggedIn?: boolean; results?: AddResult[]; cartUrl?: string; error?: string };

/** Admin-only tester: push商品コード(s) into the Kemuri cart via /api/kemuri/add. */
export function KemuriCartTester() {
  const [codes, setCodes] = useState("000000000284:1");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [resp, setResp] = useState<Resp | null>(null);

  async function submit() {
    setBusy(true);
    setResp(null);
    try {
      const r = await fetch("/api/kemuri/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: codes,
          email: email || undefined,
          password: password || undefined,
        }),
      });
      setResp((await r.json()) as Resp);
    } catch (err) {
      setResp({ error: err instanceof Error ? err.message : "リクエスト失敗" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <Label>商品コード（code:数量 をスペース区切り）</Label>
        <Input
          value={codes}
          onChange={(e) => setCodes(e.target.value)}
          placeholder="000000000284:1 000000002088:2"
        />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div>
          <Label>Kemuriログイン メール（任意）</Label>
          <Input
            type="email"
            autoComplete="off"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="未入力ならゲストカート / env優先"
          />
        </div>
        <div>
          <Label>Kemuriログイン パスワード（任意）</Label>
          <Input
            type="password"
            autoComplete="off"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="会員カートに入れる場合のみ"
          />
        </div>
      </div>

      <Button type="button" onClick={submit} disabled={busy}>
        {busy ? "投入中…" : "カートに入れる"}
      </Button>

      {resp && (
        <div className="rounded-sm border p-3 text-sm space-y-1.5">
          {resp.error ? (
            <p className="text-red-600">エラー: {resp.error}</p>
          ) : (
            <>
              <p className="text-muted-foreground">
                ログイン: {resp.loggedIn ? "会員として投入" : "ゲストカート（KEMURI_EMAIL/PASS未設定）"}
              </p>
              <ul className="space-y-0.5">
                {resp.results?.map((r) => (
                  <li key={r.code} className="lisso-mono text-xs">
                    {r.ok ? "✅" : "❌"} {r.code}
                    {r.ok
                      ? ` — カート合計 ${r.totalQuantity}`
                      : ` — ${r.error}`}
                  </li>
                ))}
              </ul>
              {resp.cartUrl && (
                <a
                  href={resp.cartUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs underline text-muted-foreground hover:text-foreground"
                >
                  Kemuriのカートを開く
                </a>
              )}
            </>
          )}
        </div>
      )}
      <p className="text-[11px] text-muted-foreground">
        ※ ヘッドレスブラウザ不要のHTTP方式。会員カートに入れるには上のログイン欄（任意）に
        Kemuriの認証情報を入れるか、Vercel 環境変数 KEMURI_EMAIL / KEMURI_PASS を設定してください。
        どちらも未設定ならゲストカートに入ります。入力値は保存しません。
      </p>
    </div>
  );
}
