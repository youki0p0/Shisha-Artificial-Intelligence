import { randomUUID } from "node:crypto";

/** Generate a prefixed, sortable-ish id. */
export function newId(prefix: string): string {
  return `${prefix}_${randomUUID().slice(0, 12)}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

/** Short share id for public recipes (URL friendly). */
export function newShareId(): string {
  return randomUUID().replace(/-/g, "").slice(0, 10);
}
