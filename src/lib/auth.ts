/**
 * Authentication.
 *
 * Two modes (see src/lib/supabase/env.ts):
 *  - **Supabase mode** — the current user is the logged-in Supabase Auth user;
 *    their profile row (auto-created on signup) carries display name + role.
 *  - **JSON mode** (no Supabase env) — a mock current user, switchable via the
 *    `sfos_uid` cookie, for local dev and tests.
 *
 * The rest of the app is unaffected because it always goes through
 * `getCurrentUserId()` / `getCurrentUser()`.
 */
import { cookies } from "next/headers";
import { UserProfile } from "@/domain/types";
import { getRepositories } from "@/repositories";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getServerSupabase } from "@/lib/supabase/server";

export const DEFAULT_USER_ID = "user_demo";
export const USER_COOKIE = "sfos_uid";

/** The logged-in Supabase user id, or null when not signed in / JSON mode. */
export async function getAuthUserId(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const sb = await getServerSupabase();
    const { data } = await sb.auth.getUser();
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}

export async function getCurrentUserId(): Promise<string> {
  const authId = await getAuthUserId();
  if (authId) return authId;
  if (isSupabaseConfigured()) return DEFAULT_USER_ID; // signed-out in Supabase mode
  try {
    const store = await cookies();
    return store.get(USER_COOKIE)?.value ?? DEFAULT_USER_ID;
  } catch {
    return DEFAULT_USER_ID;
  }
}

export async function getCurrentUser(): Promise<UserProfile> {
  const repos = getRepositories();

  if (isSupabaseConfigured()) {
    const sb = await getServerSupabase();
    const { data } = await sb.auth.getUser();
    const authUser = data.user;
    if (!authUser) return anonProfile(); // pages should gate on isLoggedIn()
    const profile = await repos.users.getById(authUser.id);
    if (profile) return profile;
    // Profile row not yet visible (e.g. just signed up) — synthesize from auth.
    const now = new Date().toISOString();
    return {
      id: authUser.id,
      displayName:
        (authUser.user_metadata?.display_name as string) ??
        authUser.email?.split("@")[0] ??
        "User",
      role: "user",
      createdAt: now,
      updatedAt: now,
    };
  }

  // JSON mode: cookie-switchable mock user.
  const id = await getCurrentUserId();
  const user = await repos.users.getById(id);
  if (user) return user;
  const fallback = await repos.users.getById(DEFAULT_USER_ID);
  if (!fallback) throw new Error("No users seeded");
  return fallback;
}

/** True when a real Supabase user is signed in. */
export async function isLoggedIn(): Promise<boolean> {
  return (await getAuthUserId()) !== null;
}

export function isCuratorOrAdmin(user: UserProfile): boolean {
  return user.role === "curator" || user.role === "admin";
}

function anonProfile(): UserProfile {
  const now = new Date().toISOString();
  return {
    id: "anon",
    displayName: "ゲスト",
    role: "user",
    createdAt: now,
    updatedAt: now,
  };
}
