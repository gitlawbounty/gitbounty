/** Current ISO week string, e.g. "2026-W21". Single source of truth for week keys. */
export function isoWeek(d: Date = new Date()): string {
  const start = new Date(d.getFullYear(), 0, 1)
  const diff = (d.getTime() - start.getTime()) / 86_400_000
  const week = Math.ceil((diff + start.getDay() + 1) / 7)
  return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`
}
