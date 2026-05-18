import type { ReactNode } from 'react'

export function EmptyState({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="border border-dashed border-border p-6 text-center text-muted space-y-3">
      <div className="lowercase">{children}</div>
      {action && <div>{action}</div>}
    </div>
  )
}
