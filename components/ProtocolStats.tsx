'use client'

import { useStats } from '@/hooks/useStats'
import { useOffChainBounties } from '@/hooks/useOffChainBounties'
import { formatTokenAmount } from '@/lib/format/amount'

function StatCell({
  label,
  value,
  accent,
}: {
  label: string
  value: string | number
  accent?: boolean
}) {
  return (
    <div className="space-y-1">
      <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted">{label}</div>
      <div
        className={`text-3xl font-semibold ${accent ? 'text-accent' : 'text-primary'} font-mono tabular-nums`}
      >
        {value}
      </div>
    </div>
  )
}

export function ProtocolStats() {
  const { counts, totalPaidOut, activeAgents } = useStats()
  const { data: snapshot } = useOffChainBounties()
  const offCount = snapshot?.bounties.length ?? 0

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 bg-surface/40 border border-border rounded-lg p-6">
      <StatCell label="gitlawb network" value={offCount} accent />
      <StatCell label="on-chain open" value={counts.open} />
      <StatCell
        label="paid out"
        value={`${formatTokenAmount(totalPaidOut, 18)} $GL`}
      />
      <StatCell label="active agents" value={activeAgents} />
    </div>
  )
}
