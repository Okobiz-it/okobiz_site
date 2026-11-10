/**
 * Lightweight, zero-dependency date formatting utility.
 * Replaces date-fns format() for quotation dates.
 */
export function format(date: Date | string | number | null | undefined, formatStr: string): string {
  if (!date) return "N/A";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "N/A";

  const monthsShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthsFull = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const day = d.getDate();
  const dayPad = String(day).padStart(2, "0");
  const monthIdx = d.getMonth();
  const year = d.getFullYear();

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";
  const AMPM = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  const hoursPad = String(hours).padStart(2, "0");

  return formatStr
    .replace("dd", dayPad)
    .replace(/\bd\b/, String(day))
    .replace("MMMM", monthsFull[monthIdx])
    .replace("MMM", monthsShort[monthIdx])
    .replace("yyyy", String(year))
    .replace("hh", hoursPad)
    .replace("mm", minutes)
    .replace("a", AMPM);
}

