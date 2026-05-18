interface Props {
  title?: string
  children: React.ReactNode
}

export function TerminalBox({ title, children }: Props) {
  return (
    <div className="border border-border bg-base">
      {title && (
        <div className="border-b border-border px-3 py-2 text-muted text-xs uppercase tracking-wider">
          ┌─ {title}
        </div>
      )}
      <div className="p-3">{children}</div>
    </div>
  )
}
