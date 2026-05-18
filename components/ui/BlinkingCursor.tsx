export function BlinkingCursor({ label }: { label?: string }) {
  return (
    <span className="text-muted">
      {label && <span>{label} </span>}
      <span className="cursor-blink" />
    </span>
  )
}
