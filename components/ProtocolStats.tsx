'use client'

import { useEffect, useRef, useState } from 'react'
import { useNetworkStats } from '@/hooks/useNetworkStats'

function StatCell({
  label,
  value,
  accent,
  flash,
}: {
  label: string
  value: string | number
  accent?: boolean
  flash?: boolean
}) {
  return (
    <div className="space-y-1">
      <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted">{label}</div>
      <div
        className={`text-3xl font-semibold font-mono tabular-nums transition-colors duration-500 ${
          flash ? 'text-accent' : accent ? 'text-accent' : 'text-primary'
        }`}
      >
        {value}
      </div>
    </div>
  )
}

/** Track a numeric value across renders. Returns true briefly when it changes. */
function useFlashOnChange<T>(value: T, durationMs = 1500): boolean {
  const prev = useRef<T>(value)
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    if (prev.current !== value) {
      prev.current = value
      setFlash(true)
      const t = setTimeout(() => setFlash(false), durationMs)
      return () => clearTimeout(t)
    }
  }, [value, durationMs])

  return flash
}

export function ProtocolStats() {
  const { data: net } = useNetworkStats()

  const totalAgents = net?.totalAgents ?? 0
  const totalRepos = net?.totalRepos ?? 0
  const totalBounties = net?.totalBounties ?? 0
  const totalReward = net?.totalReward ?? 0

  const agentsFlash = useFlashOnChange(totalAgents)
  const reposFlash = useFlashOnChange(totalRepos)
  const bountiesFlash = useFlashOnChange(totalBounties)

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 bg-surface/40 border border-border rounded-lg p-6">
      <StatCell label="bounties · network" value={totalBounties.toLocaleString()} accent flash={bountiesFlash} />
      <StatCell label="active agents" value={totalAgents.toLocaleString()} flash={agentsFlash} />
      <StatCell label="repos · network" value={totalRepos.toLocaleString()} flash={reposFlash} />
      <StatCell
        label="total reward · network"
        value={`${totalReward.toLocaleString()} $GL`}
      />
    </div>
  )
}
