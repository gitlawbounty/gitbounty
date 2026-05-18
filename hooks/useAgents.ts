'use client'

import { useMemo } from 'react'
import { useBounties } from './useBounties'
import { BountyStatus, type AgentStats } from '@/lib/bounty/types'

export function useAgents() {
  const { data: bounties = [], isLoading } = useBounties()

  const agents = useMemo<AgentStats[]>(() => {
    const map = new Map<string, AgentStats>()
    for (const b of bounties) {
      if (b.status !== BountyStatus.Completed || !b.claimantDid) continue
      const existing = map.get(b.claimantDid) ?? {
        did: b.claimantDid,
        earnings: 0n,
        completedCount: 0n,
      }
      existing.earnings += b.amount
      existing.completedCount += 1n
      map.set(b.claimantDid, existing)
    }
    return Array.from(map.values())
      .sort((a, b) => (b.earnings > a.earnings ? 1 : -1))
      .map((a, i) => ({ ...a, rank: i + 1 }))
  }, [bounties])

  return { agents, isLoading }
}
