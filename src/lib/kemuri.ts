/**
 * Kemuri (MakeShop) cart client — pure HTTP, no headless browser.
 *
 * shop.kemuri.site runs on MakeShop. Adding an item to the cart is a single
 * JSON POST to `/api/cart/` with a session cookie; logging in is a three-step
 * form/tempid dance to `/ssl/`. This was reverse-engineered from the live site
 * (system-*.js exposes `POST /api/cart/ {action:'add', item_code, quantity,
 * source, element_index, option_list}`) and verified end-to-end with the real
 * endpoint. Designed to run server-side (Node runtime) on Vercel.
 *
 * Credentials are never hard-coded — callers pass them (sourced from env).
 */

const BASE = "https://shop.kemuri.site";
const UA = "Mozilla/5.0 (compatible; ShishaOS/1.0; +https://shishaos)";
// MakeShop accepts the unresolved entry-url token as `source`; the server maps
// it together with item_code, so we don't need to run the front-end JS.
const CART_SOURCE_TOKEN = "#makeshop-item-cart-entry-url:1";

type Jar = Record<string, string>;

export type CartAddResult = {
  code: string;
  ok: boolean;
  totalQuantity?: number;
  error?: string;
};

export type BulkAddResult = {
  loggedIn: boolean;
  results: CartAddResult[];
  cartUrl: string;
};

function mergeSetCookie(jar: Jar, res: Response): void {
  const headers = res.headers as unknown as { getSetCookie?: () => string[] };
  const cookies = headers.getSetCookie ? headers.getSetCookie() : [];
  for (const c of cookies) {
    const first = c.split(";")[0];
    const eq = first.indexOf("=");
    if (eq > 0) {
      const name = first.slice(0, eq).trim();
      const value = first.slice(eq + 1).trim();
      if (value === "" || value === "deleted") delete jar[name];
      else jar[name] = value;
    }
  }
}

function cookieHeader(jar: Jar): string {
  return Object.entries(jar)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

async function req(jar: Jar, url: string, init: RequestInit = {}): Promise<Response> {
  const res = await fetch(url, {
    ...init,
    redirect: "manual",
    headers: {
      "User-Agent": UA,
      ...(init.headers ?? {}),
      ...(Object.keys(jar).length ? { Cookie: cookieHeader(jar) } : {}),
    },
  });
  mergeSetCookie(jar, res);
  return res;
}

/** Parse `name="value"` from every <input> inside the first matching <form>. */
function formFields(html: string, formName: string): { action: string; fields: Jar } | null {
  const re = new RegExp(`<form[^>]*name=["']${formName}["'][^>]*>([\\s\\S]*?)</form>`, "i");
  const m = re.exec(html);
  if (!m) return null;
  const action = /action=["']([^"']*)["']/i.exec(m[0])?.[1] ?? "";
  const fields: Jar = {};
  for (const tag of m[1].matchAll(/<input\b[^>]*>/gi)) {
    const name = /name=["']([^"']*)["']/i.exec(tag[0])?.[1];
    const value = /value=["']([^"']*)["']/i.exec(tag[0])?.[1] ?? "";
    if (name && name !== "-") fields[name] = value;
  }
  return { action, fields };
}

/**
 * Authenticate as a member so the cart binds to their account. Returns true on
 * apparent success. Cart-add works without login (guest cart), but logging in
 * makes the items appear in the member's own cart.
 */
export async function kemuriLogin(jar: Jar, id: string, password: string): Promise<boolean> {
  // 1) Gateway page auto-submits formMain -> /ssl/slogin/ (carries ssl_tempid).
  const gw = formFields(await (await req(jar, `${BASE}/view/member/login`)).text(), "formMain");
  if (!gw) return false;
  // 2) POST the gateway -> renders the real credential form (login_form).
  const r2 = await req(jar, new URL(gw.action, BASE).toString(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(gw.fields).toString(),
  });
  const lf = formFields(await r2.text(), "login_form");
  if (!lf) return false;
  // 3) Submit credentials (field names: id, passwd) to the form's action.
  const action3 = new URL(lf.action, `${BASE}/ssl/slogin/`).toString();
  const body = { ...lf.fields, id, passwd: password, auto_login: "on" };
  await req(jar, action3, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body).toString(),
  });
  // Verify: mypage no longer shows a password field when logged in.
  const mp = await (await req(jar, `${BASE}/view/member/mypage`)).text();
  return !/type=["']password["']/i.test(mp);
}

/** Add one item (by MakeShop brandcode) to the current session's cart. */
export async function kemuriAddToCart(jar: Jar, code: string, quantity: number): Promise<CartAddResult> {
  const res = await req(jar, `${BASE}/api/cart/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest" },
    body: JSON.stringify({
      action: "add",
      source: CART_SOURCE_TOKEN,
      element_index: 0,
      item_code: code,
      option_list: [],
      quantity,
    }),
  });
  if (!res.ok) return { code, ok: false, error: `HTTP ${res.status}` };
  const data = (await res.json().catch(() => null)) as
    | { result?: boolean; total_quantity?: number; error?: { message?: string } }
    | null;
  if (data?.result) return { code, ok: true, totalQuantity: data.total_quantity };
  return { code, ok: false, error: data?.error?.message || "カート投入に失敗しました" };
}

/**
 * Seed a session, optionally log in, then add each item. Items are added
 * sequentially so `total_quantity` reflects the running cart size.
 */
export async function kemuriBulkAdd(
  items: { code: string; quantity: number }[],
  creds?: { id: string; password: string },
): Promise<BulkAddResult> {
  const jar: Jar = {};
  await req(jar, `${BASE}/`); // obtain session cookies
  let loggedIn = false;
  if (creds?.id && creds?.password) {
    loggedIn = await kemuriLogin(jar, creds.id, creds.password);
  }
  const results: CartAddResult[] = [];
  for (const it of items) {
    results.push(await kemuriAddToCart(jar, it.code, it.quantity));
  }
  return { loggedIn, results, cartUrl: `${BASE}/view/cart` };
}

/** Parse "code:qty code:qty" (qty optional, default 1) into items. */
export function parseCartItems(input: string): { code: string; quantity: number }[] {
  return input
    .split(/[\s,]+/)
    .filter(Boolean)
    .map((tok) => {
      const [code, qty] = tok.split(":");
      const q = Number(qty);
      return { code: code.trim(), quantity: Number.isFinite(q) && q > 0 ? Math.floor(q) : 1 };
    })
    .filter((it) => it.code);
}
