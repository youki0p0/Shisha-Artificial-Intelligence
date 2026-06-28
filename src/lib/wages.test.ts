import { describe, it, expect } from "vitest";
import { wageForMonth, currentWage, sortWages, isMonthKey } from "./wages";
import { WageEntry } from "@/domain/types";

const SCHEDULE: WageEntry[] = [
  { id: "a", effectiveFrom: "2025-01", hourlyWage: 1200 },
  { id: "b", effectiveFrom: "2026-07", hourlyWage: 1250 },
];

describe("staff wage schedule", () => {
  it("applies ¥1,200 through June 2026 and ¥1,250 from July", () => {
    expect(wageForMonth(SCHEDULE, "2026-06")).toBe(1200);
    expect(wageForMonth(SCHEDULE, "2026-07")).toBe(1200 + 50);
    expect(wageForMonth(SCHEDULE, "2026-12")).toBe(1250);
  });

  it("returns undefined before any entry is effective", () => {
    expect(wageForMonth(SCHEDULE, "2024-12")).toBeUndefined();
    expect(wageForMonth([], "2026-07")).toBeUndefined();
    expect(currentWage(undefined)).toBeUndefined();
  });

  it("picks the latest effective entry regardless of input order", () => {
    const shuffled = [SCHEDULE[1], SCHEDULE[0]];
    expect(wageForMonth(shuffled, "2026-08")).toBe(1250);
    expect(sortWages(shuffled).map((w) => w.effectiveFrom)).toEqual([
      "2025-01",
      "2026-07",
    ]);
  });

  it("validates month keys", () => {
    expect(isMonthKey("2026-07")).toBe(true);
    expect(isMonthKey("2026-13")).toBe(false);
    expect(isMonthKey("2026-7")).toBe(false);
    expect(isMonthKey("")).toBe(false);
  });
});
