import { describe, expect, it } from "vitest";
import { addCalendarDays, calendarDayCount, monthCalendarDays, shiftCalendarMonth } from "@/domain/calendar";
describe("trip calendar civil dates", () => {
  it("counts inclusive ranges across month/year boundaries and daylight saving", () => {
    expect(calendarDayCount("2026-11-27", "2026-12-03")).toBe(7);
    expect(calendarDayCount("2026-12-31", "2027-01-01")).toBe(2);
    expect(calendarDayCount("2026-03-28", "2026-03-30")).toBe(3);
    expect(addCalendarDays("2028-02-27", 2)).toBe("2028-02-29");
    expect(calendarDayCount("2026-11-27", "2026-11-27")).toBe(1);
  });
  it("clamps month navigation without skipping February or December", () => {
    expect(shiftCalendarMonth("2026-01-31", 1)).toBe("2026-02-28");
    expect(shiftCalendarMonth("2028-01-31", 1)).toBe("2028-02-29");
    expect(shiftCalendarMonth("2026-12-31", 1)).toBe("2027-01-31");
  });
  it("lays out complete Monday-first weeks for Sunday and Monday month starts", () => {
    const november = monthCalendarDays("2026-11");
    expect(november).toHaveLength(42); expect(november[0]).toBe("2026-10-26"); expect(november[6]).toBe("2026-11-01");
    expect(monthCalendarDays("2026-06")[0]).toBe("2026-06-01");
  });
});
