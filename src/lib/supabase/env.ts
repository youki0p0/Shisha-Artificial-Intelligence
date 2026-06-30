/**
 * Supabase environment resolution.
 *
 * ShishaOS runs in two modes:
 *  - **JSON mode** (default, no env): the in-memory seed + mock user. Great for
 *    local dev and the test suite — zero external dependencies.
 *  - **Supabase mode** (env set): real Supabase Auth login + per-user Postgres
 *    persistence. Enabled automatically once the URL + anon key are present.
 */
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.SUPABASE_ANON_KEY ??
  process.env.SUPABASE_KEY ??
  "";

/** True when both the URL and a publishable/anon key are configured. */
export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

/**
 * When true, the login screen only offers password sign-in (magic-link and
 * sign-up tabs are hidden). Handy when email delivery isn't configured.
 * Set NEXT_PUBLIC_AUTH_PASSWORD_ONLY=true to enable.
 */
export const AUTH_PASSWORD_ONLY =
  process.env.NEXT_PUBLIC_AUTH_PASSWORD_ONLY === "true";
