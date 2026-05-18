export function Stat({
  glyph,
  label,
  value,
}: {
  glyph: string
  label: string
  value: string | number
}) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-accent">{glyph}</span>
      <span className="text-xl">{value}</span>
      <span className="text-muted text-xs uppercase tracking-wider">{label}</span>
    </div>
  )
}
