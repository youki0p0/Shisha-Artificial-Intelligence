"use client";

import { useState } from "react";
import { Button, Input, Label } from "@/components/ui/primitives";

type AddResult = { code: string; ok: boolean; totalQuantity?: number; error?: string };
type Resp = { loggedIn?: boolean; results?: AddResult[]; cartUrl?: string; error?: string };

const KEMURI_BASE = "https://shop.kemuri.site";
const CART_SOURCE = "#makeshop-item-cart-entry-url:1";

/** Parse "code:qty code:qty" → items (qty optional, default 1). */
function parseCodes(input: string): { code: string; quantity: number }[] {
  return input
    .split(/[\s,]+/)
    .filter(Boolean)
    .map((t) => {
      const [code, qty] = t.split(":");
      const q = Number(qty);
      return { code: code.trim(), quantity: Number.isFinite(q) && q > 0 ? Math.floor(q) : 1 };
    })
    .filter((it) => it.code);
}

/** Admin-only tester: push商品コード(s) into the Kemuri cart. */
export function KemuriCartTester() {
  const [codes, setCodes] = useState("000000000284:1");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [resp, setResp] = useState<Resp | null>(null);
  const [directBusy, setDirectBusy] = useState(false);
  const [directMsg, setDirectMsg] = useState<string | null>(null);

  /**
   * 案1: add to the cart in THIS browser's own Kemuri session. Kemuri's session
   * cookies are SameSite=None and /api/cart/ accepts a text/plain body, so a
   * credentialed no-cors POST runs the add in the user's logged-in session
   * (cross-origin, no server, no creds). The response is opaque, so we just
   * open the cart to confirm. (Browsers that block third-party cookies — e.g.
   * iOS Safari — may not send the session; use the server path below then.)
   */
  async function addInThisBrowser() {
    const items = parseCodes(codes);
    if (items.length === 0) return;
    setDirectBusy(true);
    setDirectMsg(null);
    try {
      for (const { code, quantity } of items) {
        await fetch(`${KEMURI_BASE}/api/cart/`, {
          method: "POST",
          mode: "no-cors",
          credentials: "include",
          headers: { "Content-Type": "text/plain" },
          body: JSON.stringify({
            action: "add",
            source: CART_SOURCE,
            element_index: 0,
            item_code: code,
            option_list: [],
            quantity,
          }),
        }).catch(() => {});
      }
      setDirectMsg(`${items.length}件を送信しました。カートを開いて確認します。`);
      window.open(`${KEMURI_BASE}/view/cart`, "_blank", "noopener");
    } finally {
      setDirectBusy(false);
    }
  }

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

      {/* 案A: open each item page first-party (works on Safari / mobile) */}
      <div className="rounded-sm border p-3 space-y-2">
        <div className="text-sm font-medium">Kemuriで開いて入れる（Safari・スマホ対応・おすすめ）</div>
        <p className="text-[11px] text-muted-foreground">
          各商品ページが <code>shop.kemuri.site</code> 上（first-party）で開くので、その画面の「カートに入れる」をタップすれば
          どのブラウザでも確実にあなたのカートに入ります。先にKemuriにログインしておくと会員カートに入ります。
        </p>
        {parseCodes(codes).length === 0 ? (
          <p className="text-xs text-muted-foreground">商品コードを入力してください。</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {parseCodes(codes).map(({ code, quantity }) => (
              <a
                key={code}
                href={`${KEMURI_BASE}/view/item/${code}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-sm border px-2.5 py-1 text-xs text-foreground hover:border-foreground/40"
              >
                Kemuriで開く: {code}
                {quantity > 1 ? ` ×${quantity}` : ""}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* 案1: cross-site direct add — works on Chrome, blocked by Safari ITP */}
      <details className="rounded-sm border p-3">
        <summary className="cursor-pointer text-sm text-muted-foreground">
          このブラウザに直接入れる（Chrome等のみ・Safari不可）
        </summary>
        <div className="mt-3 space-y-2">
          <p className="text-[11px] text-muted-foreground">
            横断リクエストでこのブラウザのKemuriセッションに直接追加します。Chrome等では反映されますが、
            <strong>iOS/Safari はサードパーティCookieをブロックするため反映されません</strong>（その場合は上の「Kemuriで開いて入れる」を使用）。
            先に <code>shop.kemuri.site</code> にログインしておくと会員カートに入ります。
          </p>
          <Button type="button" onClick={addInThisBrowser} disabled={directBusy}>
            {directBusy ? "送信中…" : "このブラウザに直接入れる（Chrome等）"}
          </Button>
          {directMsg && <p className="text-xs text-foreground">{directMsg}</p>}
        </div>
      </details>

      {/* 案: server-side (member via creds/env, or guest) */}
      <details className="rounded-sm border p-3">
        <summary className="cursor-pointer text-sm text-muted-foreground">
          サーバー経由で入れる（会員/ゲスト・上級者向け）
        </summary>
        <div className="mt-3 space-y-2">
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
          <Button type="button" variant="outline" onClick={submit} disabled={busy}>
            {busy ? "投入中…" : "サーバー経由で入れる"}
          </Button>
          <p className="text-[11px] text-muted-foreground">
            ※ サーバー側の一時セッションに入るため、あなたのブラウザのカートには反映されません（動作確認用）。
          </p>
        </div>
      </details>

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
        ※ スマホ（iOS Safari 含む）では「Kemuriで開いて入れる」が確実です（商品ページを first-party で開いて、その画面のカートボタンをタップ）。
        「直接入れる」は Chrome 等のみ・Safari不可。サーバー経由は動作確認用です。
      </p>
    </div>
  );
}
