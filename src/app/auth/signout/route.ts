/** Signs the current user out and returns to the login page. */
import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function POST(request: Request) {
  const { origin } = new URL(request.url);
  if (isSupabaseConfigured()) {
    const sb = await getServerSupabase();
    await sb.auth.signOut();
  }
  return NextResponse.redirect(`${origin}/login`, { status: 303 });
}
