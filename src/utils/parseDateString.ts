/**
 * Parses a date value that may be a date-only string (without time component).
 *
 * Date-only strings from Astro content collections are parsed as local dates
 * without timezone info. Appending `T12:00:00` ensures consistent comparison
 * regardless of timezone.
 *
 * @param date - A Date object or date string
 * @returns Unix timestamp in milliseconds
 */
export function parse_date_timestamp(date: Date | string): number {
  const date_str = date.toString();
  return date_str.includes("T")
    ? new Date(date_str).getTime()
    : new Date(`${date_str}T12:00:00`).getTime();
}
