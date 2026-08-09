export function formatDate(
  value: string,
  opts?: Intl.DateTimeFormatOptions,
): string {
  const date = new Date(value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return value || "";
  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    ...opts,
  }).format(date);
}

export function formatTime(value: string): string {
  const match = /^(\d{2}):(\d{2})/.exec(value);
  if (!match) return value || "";
  return `${match[1]}:${match[2]}`;
}

export function formatDateTime(value: string): string {
  return `${formatDate(value)} · ${formatTime(value)}`;
}

export function relativeDays(value: string): number {
  const target = new Date(value.replace(" ", "T")).getTime();
  const now = Date.now();
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

export function normalizeEventPhone(phone?: string): string {
  return (phone ?? "").replace(/[^\d]/g, "");
}