const UTC_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

// Shown in UTC, the same as the PDF, so the screen and the document agree.
export function formatUtc(value: string | Date | null | undefined): string {
  if (!value) return "time not recorded";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "time not recorded";
  return `${UTC_FORMAT.format(date)} UTC`;
}
