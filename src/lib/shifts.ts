/**
 * Staff timecard + payroll helpers.
 *
 * Worked hours come from start/end (minus break). Monthly pay is the month's
 * total hours times the hourly wage in effect that month (see lib/wages.ts).
 */
import { ShiftEntry, WageEntry } from "@/domain/types";
import { wageForMonth } from "./wages";

const TIME_RE = /^([01]?\d|2[0-3]):[0-5]\d$/;
const DATE_RE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

export function isTime(s: string): boolean {
  return TIME_RE.test(s);
}

export function isDate(s: string): boolean {
  return DATE_RE.test(s);
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/**
 * Worked hours between start and end (overnight allowed by wrapping past
 * midnight), minus break minutes. Rounded to 2 decimals. Returns 0 on bad
 * input or non-positive duration.
 */
export function computeHours(
  start: string,
  end: string,
  breakMinutes = 0,
): number {
  if (!isTime(start) || !isTime(end)) return 0;
  let mins = toMinutes(end) - toMinutes(start);
  if (mins < 0) mins += 24 * 60; // overnight
  mins -= Math.max(0, breakMinutes);
  if (mins <= 0) return 0;
  return Math.round((mins / 60) * 100) / 100;
}

/** Month key "YYYY-MM" from a "YYYY-MM-DD" date. */
export function monthOf(date: string): string {
  return date.slice(0, 7);
}

export type MonthlyPay = {
  month: string; // "YYYY-MM"
  shifts: number;
  hours: number;
  /** Hourly wage in effect that month (undefined if unset). */
  wage: number | undefined;
  /** hours * wage, or undefined when no wage is set for the month. */
  pay: number | undefined;
};

/**
 * Group shifts by month and compute hours + pay per month, newest month first.
 */
export function summarizePayroll(
  shifts: ShiftEntry[],
  wages: WageEntry[] | undefined,
): MonthlyPay[] {
  const byMonth = new Map<string, { shifts: number; hours: number }>();
  for (const s of shifts) {
    const m = monthOf(s.date);
    const cur = byMonth.get(m) ?? { shifts: 0, hours: 0 };
    cur.shifts += 1;
    cur.hours += s.hours;
    byMonth.set(m, cur);
  }
  return [...byMonth.entries()]
    .map(([month, { shifts: n, hours }]) => {
      const roundedHours = Math.round(hours * 100) / 100;
      const wage = wageForMonth(wages, month);
      return {
        month,
        shifts: n,
        hours: roundedHours,
        wage,
        pay: wage === undefined ? undefined : Math.round(roundedHours * wage),
      };
    })
    .sort((a, b) => b.month.localeCompare(a.month));
}

/** Format a "YYYY-MM-DD" date as "M/D". */
export function formatDate(date: string): string {
  const [, m, d] = date.split("-");
  return `${Number(m)}/${Number(d)}`;
}
