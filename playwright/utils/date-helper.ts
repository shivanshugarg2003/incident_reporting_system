/**
 * Return today's date as YYYY-MM-DD in local timezone.
 */
export function today(): string {
  return formatDate(new Date());
}

/**
 * Return yesterday's date as YYYY-MM-DD.
 */
export function yesterday(): string {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return formatDate(date);
}

/**
 * Return tomorrow's date as YYYY-MM-DD.
 */
export function tomorrow(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return formatDate(date);
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
