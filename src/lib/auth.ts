/**
 * Authentication abstraction.
 *
 * The MVP uses a MOCK current user. Public multi-user auth (email/OAuth, e.g.
 * Supabase Auth or Auth.js) plugs in here later: implement `getCurrentUserId`
 * to read the real session, and the rest of the app is unaffected because it
 * always goes through `getCurrentUser()`.
 *
 * For demo/dev convenience, the current user can be switched via the
 * `sfos_uid` cookie (e.g. to view curator/admin screens).
 */
import { cookies } from "next/headers";
import { UserProfile } from "@/domain/types";
import { getRepositories } from "@/repositories";

export const DEFAULT_USER_ID = "user_demo";
export const USER_COOKIE = "sfos_uid";

export async function getCurrentUserId(): Promise<string> {
  try {
    const store = await cookies();
    return store.get(USER_COOKIE)?.value ?? DEFAULT_USER_ID;
  } catch {
    // Outside a request context (e.g. scripts) — fall back to default.
    return DEFAULT_USER_ID;
  }
}

export async function getCurrentUser(): Promise<UserProfile> {
  const id = await getCurrentUserId();
  const repos = getRepositories();
  const user = await repos.users.getById(id);
  if (user) return user;
  // Fall back to the default demo user if the cookie points at nothing.
  const fallback = await repos.users.getById(DEFAULT_USER_ID);
  if (!fallback) throw new Error("No users seeded");
  return fallback;
}

export function isCuratorOrAdmin(user: UserProfile): boolean {
  return user.role === "curator" || user.role === "admin";
}
