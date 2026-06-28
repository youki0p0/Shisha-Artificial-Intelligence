/**
 * Effective-dated hourly-wage helpers (staff payroll).
 *
 * A staff member's wage schedule is a list of {effectiveFrom, hourlyWage}
 * entries. The wage for a given month is the entry with the greatest
 * `effectiveFrom` (a "YYYY-MM" key) that is still <= that month. This makes
 * "¥1,200 until June, ¥1,250 from July" a two-row schedule rather than a
 * per-month table.
 */
import { WageEntry } from "@/domain/types";

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

/** True for a valid "YYYY-MM" month key. */
export function isMonthKey(s: string): boolean {
  return MONTH_RE.test(s);
}

/** Current month as "YYYY-MM" (UTC). */
export function currentMonth(now: Date = new Date()): string {
  return now.toISOString().slice(0, 7);
}

/** Wage entries sorted by effective month, oldest first. */
export function sortWages(wages: WageEntry[]): WageEntry[] {
  return [...wages].sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom));
}

/**
 * The hourly wage in effect for `month` ("YYYY-MM"), or undefined if no entry
 * is effective yet by then.
 */
export function wageForMonth(
  wages: WageEntry[] | undefined,
  month: string,
): number | undefined {
  if (!wages || wages.length === 0) return undefined;
  let chosen: WageEntry | undefined;
  for (const w of wages) {
    if (w.effectiveFrom <= month && (!chosen || w.effectiveFrom > chosen.effectiveFrom)) {
      chosen = w;
    }
  }
  return chosen?.hourlyWage;
}

/** The wage in effect this month. */
export function currentWage(
  wages: WageEntry[] | undefined,
  now: Date = new Date(),
): number | undefined {
  return wageForMonth(wages, currentMonth(now));
}

/** Format JPY without decimals, e.g. 1250 -> "¥1,250". */
export function formatYen(n: number): string {
  return `¥${Math.round(n).toLocaleString("en-US")}`;
}

/** Format a "YYYY-MM" key as "YYYY年M月". */
export function formatMonth(month: string): string {
  const [y, m] = month.split("-");
  return `${y}年${Number(m)}月`;
}
