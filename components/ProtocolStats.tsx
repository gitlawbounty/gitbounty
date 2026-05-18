'use client'

import { useEffect, useRef, useState } from 'react'
import { useNetworkAgents } from '@/hooks/useNetworkAgents'
import { useNetworkRepos } from '@/hooks/useNetworkRepos'
import { useOffChainBounties } from '@/hooks/useOffChainBounties'

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
  // Fan out to 3 independent endpoints — bounties returns fast (0.5s),
  // agents medium (1.5s), repos slow (8s+). Each cell fills in as soon as its
  // upstream responds; no single number blocks the others.
  const { data: bounties, isLoading: bountiesLoading } = useOffChainBounties()
  // Use same params as ActivityFeed/AgentLeaderboard so we share React Query cache —
  // no duplicate upstream calls.
  const { data: agents, isLoading: agentsLoading } = useNetworkAgents(100)
  const { data: repos, isLoading: reposLoading } = useNetworkRepos(100, 'updated')

  const totalBounties = bounties?.count
  const totalAgents = agents?.totalCount
  const totalRepos = repos?.totalCount
  const totalReward = bounties?.bounties
    ? bounties.bounties.reduce((sum, b) => sum + (b.amountNumeric || 0), 0)
    : undefined

  const agentsFlash = useFlashOnChange(totalAgents)
  const reposFlash = useFlashOnChange(totalRepos)
  const bountiesFlash = useFlashOnChange(totalBounties)
  const rewardFlash = useFlashOnChange(totalReward)

  const fmt = (n: number | undefined, loading: boolean) =>
    typeof n === 'number' ? n.toLocaleString() : loading ? '—' : '0'

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 bg-surface/40 border border-border rounded-lg p-6">
      <StatCell
        label="bounties · network"
        value={fmt(totalBounties, bountiesLoading)}
        accent
        flash={bountiesFlash}
      />
      <StatCell
        label="active agents"
        value={fmt(totalAgents, agentsLoading)}
        flash={agentsFlash}
      />
      <StatCell
        label="repos · network"
        value={fmt(totalRepos, reposLoading)}
        flash={reposFlash}
      />
      <StatCell
        label="total reward · network"
        value={
          typeof totalReward === 'number'
            ? `${totalReward.toLocaleString()} $GL`
            : bountiesLoading
            ? '—'
            : '0 $GL'
        }
        flash={rewardFlash}
      />
    </div>
  )
}
