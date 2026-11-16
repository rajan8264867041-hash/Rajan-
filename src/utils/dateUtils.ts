export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayISO(): string {
  return toISODate(new Date());
}

export function shiftISODate(isoDate: string, deltaDays: number): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + deltaDays);
  return toISODate(dt);
}

export function getRecentDateRange(days: number, endIso: string = getTodayISO()): string[] {
  const result: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    result.push(shiftISODate(endIso, -i));
  }
  return result;
}

export function formatShortDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatDisplayDate(isoDate: string): string {
  const today = getTodayISO();
  if (isoDate === today) return 'Today';
  if (isoDate === shiftISODate(today, -1)) return 'Yesterday';
  if (isoDate === shiftISODate(today, 1)) return 'Tomorrow';
  const [y, m, d] = isoDate.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function generateId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}
