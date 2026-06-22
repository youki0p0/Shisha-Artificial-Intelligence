/**
 * Supabase admin client (server-only).
 *
 * Used by the Supabase-backed repository implementation. Connects with the
 * service-role key, so it must never be imported into client components.
 * User scoping is enforced in the repository queries (and, once real auth
 * lands, by Row Level Security — see supabase/migrations).
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY " +
        "(and DB_DRIVER=supabase) to use the Supabase repository driver.",
    );
  }

  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
