import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { kemuriBulkAdd, parseCartItems } from "@/lib/kemuri";

// Needs Node APIs (cookie jar via fetch getSetCookie) — not Edge.
export const runtime = "nodejs";

/**
 * Admin-only: push items into the Kemuri (MakeShop) cart over plain HTTP.
 *
 * Body: { items: "000000000284:1 000000002088:2" }  (or an array of
 * { code, quantity }). Credentials come from KEMURI_EMAIL / KEMURI_PASS in the
 * server env (never from the client); if unset, items go into a guest cart.
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!isAdmin(user)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as
    | { items?: string | { code: string; quantity?: number }[] }
    | null;
  if (!body?.items) {
    return NextResponse.json({ error: "items_required" }, { status: 400 });
  }

  const items =
    typeof body.items === "string"
      ? parseCartItems(body.items)
      : body.items
          .filter((i) => i && i.code)
          .map((i) => ({ code: String(i.code).trim(), quantity: Number(i.quantity) || 1 }));
  if (items.length === 0) {
    return NextResponse.json({ error: "no_valid_items" }, { status: 400 });
  }

  const id = process.env.KEMURI_EMAIL;
  const password = process.env.KEMURI_PASS;
  const creds = id && password ? { id, password } : undefined;

  try {
    const result = await kemuriBulkAdd(items, creds);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "kemuri_error" },
      { status: 502 },
    );
  }
}
