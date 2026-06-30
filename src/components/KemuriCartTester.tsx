"use client";

import { useState } from "react";
import { Button, Input } from "@/components/ui/primitives";

type AddResult = { code: string; ok: boolean; totalQuantity?: number; error?: string };
type Resp = { loggedIn?: boolean; results?: AddResult[]; cartUrl?: string; error?: string };

/** Admin-only tester: push商品コード(s) into the Kemuri cart via /api/kemuri/add. */
export function KemuriCartTester() {
  const [codes, setCodes] = useState("000000000284:1");
  const [busy, setBusy] = useState(false);
  const [resp, setResp] = useState<Resp | null>(null);

  async function submit() {
    setBusy(true);
    setResp(null);
    try {
      const r = await fetch("/api/kemuri/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: codes }),
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
      <div className="flex flex-wrap items-end gap-2">
        <div className="flex-1 min-w-[220px]">
          <Input
            value={codes}
            onChange={(e) => setCodes(e.target.value)}
            placeholder="商品コード（例: 000000000284:1 000000002088:2）"
          />
        </div>
        <Button type="button" onClick={submit} disabled={busy}>
          {busy ? "投入中…" : "カートに入れる"}
        </Button>
      </div>

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
        ※ ヘッドレスブラウザ不要のHTTP方式。会員カートに紐づけるには Vercel 環境変数に
        KEMURI_EMAIL / KEMURI_PASS を設定してください（未設定ならゲストカート）。
      </p>
    </div>
  );
}
