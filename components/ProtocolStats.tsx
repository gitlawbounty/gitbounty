'use client'

import { Stat } from './ui/Stat'
import { useStats } from '@/hooks/useStats'
import { formatTokenAmount } from '@/lib/format/amount'
import { BlinkingCursor } from './ui/BlinkingCursor'

export function ProtocolStats() {
  const { counts, totalPaidOut, activeAgents, isLoading } = useStats()
  if (isLoading) return <BlinkingCursor label="$ loading stats" />
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        <Stat glyph="◉" label="OPEN" value={counts.open} />
        <Stat glyph="◎" label="CLAIMED" value={counts.claimed + counts.submitted} />
        <Stat glyph="✓" label="DONE" value={counts.completed} />
      </div>
      <div className="text-sm text-muted">
        Σ {formatTokenAmount(totalPaidOut, 18)} $GITLAWB paid · {activeAgents} agents earning
      </div>
    </div>
  )
}
