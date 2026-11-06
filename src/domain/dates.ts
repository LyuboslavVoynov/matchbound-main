export const MAX_TRIP_CALENDAR_DAYS = 7;

export type TripDates = Readonly<{ startDate: string; endDate: string }>;

export class DateRangeError extends Error {}

/** Validates canonical YYYY-MM-DD dates and an inclusive calendar range. */
export function validateTripDates(input: TripDates): TripDates {
  const start = parseCalendarDate(input.startDate, "startDate");
  const end = parseCalendarDate(input.endDate, "endDate");
  const calendarDays = Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1;

  if (calendarDays < 1) throw new DateRangeError("endDate must be on or after startDate");
  if (calendarDays > MAX_TRIP_CALENDAR_DAYS) {
    throw new DateRangeError(`A trip can span at most ${MAX_TRIP_CALENDAR_DAYS} calendar days`);
  }
  return input;
}

function parseCalendarDate(value: string, field: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new DateRangeError(`${field} must use YYYY-MM-DD`);
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new DateRangeError(`${field} is not a real calendar date`);
  }
  return parsed;
}
