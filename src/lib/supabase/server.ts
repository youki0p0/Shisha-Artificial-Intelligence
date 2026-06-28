/**
 * Request-scoped Supabase client for Server Components, Route Handlers and
 * Server Actions. Reads/writes the auth cookies via Next's cookie store so the
 * logged-in session is available on the server.
 */
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./env";

export async function getServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // `setAll` called from a Server Component — safe to ignore when the
          // session is refreshed by middleware instead.
        }
      },
    },
  });
}
