import { describe, it, expect } from "vitest";
import { computeHours, summarizePayroll, monthOf } from "./shifts";
import { ShiftEntry, WageEntry } from "@/domain/types";

describe("computeHours", () => {
  it("computes plain shifts", () => {
    expect(computeHours("13:00", "21:00")).toBe(8);
    expect(computeHours("16:00", "21:00")).toBe(5);
    expect(computeHours("13:00", "20:00")).toBe(7);
  });
  it("subtracts break and handles overnight", () => {
    expect(computeHours("13:00", "21:00", 60)).toBe(7);
    expect(computeHours("22:00", "02:00")).toBe(4);
  });
  it("returns 0 on bad/empty input", () => {
    expect(computeHours("21:00", "21:00")).toBe(0);
    expect(computeHours("bad", "21:00")).toBe(0);
  });
});

const SHIFTS: ShiftEntry[] = [
  ["2026-06-06", 8],
  ["2026-06-13", 5],
  ["2026-06-14", 8],
  ["2026-06-20", 8],
  ["2026-06-21", 8],
  ["2026-06-27", 7],
  ["2026-06-28", 8],
].map(([date, hours]) => ({
  id: String(date),
  userId: "u",
  date: date as string,
  start: "13:00",
  end: "21:00",
  hours: hours as number,
  createdAt: "",
  updatedAt: "",
}));

const WAGES: WageEntry[] = [
  { id: "a", effectiveFrom: "2025-01", hourlyWage: 1200 },
  { id: "b", effectiveFrom: "2026-07", hourlyWage: 1250 },
];

describe("summarizePayroll", () => {
  it("totals さおとめ's June: 52h × ¥1,200 = ¥62,400", () => {
    const [june] = summarizePayroll(SHIFTS, WAGES);
    expect(monthOf("2026-06-06")).toBe("2026-06");
    expect(june.month).toBe("2026-06");
    expect(june.shifts).toBe(7);
    expect(june.hours).toBe(52);
    expect(june.wage).toBe(1200);
    expect(june.pay).toBe(62400);
  });

  it("uses July wage for July shifts and sorts newest first", () => {
    const withJuly = [
      ...SHIFTS,
      {
        id: "jul",
        userId: "u",
        date: "2026-07-04",
        start: "13:00",
        end: "21:00",
        hours: 8,
        createdAt: "",
        updatedAt: "",
      },
    ];
    const months = summarizePayroll(withJuly, WAGES);
    expect(months[0].month).toBe("2026-07");
    expect(months[0].pay).toBe(8 * 1250);
  });
});
