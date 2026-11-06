import { describe, expect, it } from "vitest";
import { DateRangeError, validateTripDates } from "@/domain/dates";
import { getEligibleFixtures } from "@/domain/fixtures";
import { selectRandomFixture } from "@/domain/random";
import { createShareToken, drawExpiresAt } from "@/domain/draw";

describe("trip dates", () => {
  it("allows a one-day and seven-day inclusive range", () => {
    expect(validateTripDates({ startDate: "2026-08-01", endDate: "2026-08-01" })).toBeTruthy();
    expect(validateTripDates({ startDate: "2026-08-01", endDate: "2026-08-07" })).toBeTruthy();
  });
  it("rejects eight days, reverse ranges, and invalid dates", () => {
    expect(() => validateTripDates({ startDate: "2026-08-01", endDate: "2026-08-08" })).toThrow(DateRangeError);
    expect(() => validateTripDates({ startDate: "2026-08-07", endDate: "2026-08-01" })).toThrow(DateRangeError);
    expect(() => validateTripDates({ startDate: "2026-02-29", endDate: "2026-03-01" })).toThrow(DateRangeError);
  });
});

describe("draw persistence primitives", () => {
  it("creates opaque unique tokens and expires exactly seven days later", () => {
    expect(createShareToken()).toMatch(/^[A-Za-z0-9_-]{32}$/);
    expect(createShareToken()).not.toBe(createShareToken());
    expect(drawExpiresAt(new Date("2026-08-01T12:00:00Z")).toISOString()).toBe("2026-08-08T12:00:00.000Z");
  });
});

describe("fixture eligibility and selection", () => {
  const valid = { id: "1", kickoffDate: "2026-08-03", status: "confirmed" as const, competition: { gender: "men" as const, region: "Europe", format: "club" as const } };
  it("includes only confirmed European men's club fixtures in range", () => {
    const fixtures = [valid, { ...valid, id: "2", status: "tentative" as const }, { ...valid, id: "3", competition: { ...valid.competition, gender: "women" as const } }, { ...valid, id: "4", kickoffDate: "2026-08-08" }];
    expect(getEligibleFixtures(fixtures, "2026-08-01", "2026-08-07").map((x) => x.id)).toEqual(["1"]);
  });
  it("selects with the supplied uniform index and handles no fixtures", () => {
    expect(selectRandomFixture(["a", "b", "c"], () => 2)).toBe("c");
    expect(selectRandomFixture([])).toBeUndefined();
  });
});
