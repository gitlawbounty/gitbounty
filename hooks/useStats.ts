'use client'

import { useMemo } from 'react'
import { useBounties } from './useBounties'
import { BountyStatus } from '@/lib/bounty/types'

export function useStats() {
  const { data: bounties = [], isLoading } = useBounties()

  return useMemo(() => {
    const counts = {
      open: 0,
      claimed: 0,
      submitted: 0,
      completed: 0,
      cancelled: 0,
      disputed: 0,
    }
    let totalPaidOut = 0n
    const agents = new Set<string>()

    for (const b of bounties) {
      if (b.status === BountyStatus.Open) counts.open++
      else if (b.status === BountyStatus.Claimed) counts.claimed++
      else if (b.status === BountyStatus.Submitted) counts.submitted++
      else if (b.status === BountyStatus.Completed) {
        counts.completed++
        totalPaidOut += b.amount
        if (b.claimantDid) agents.add(b.claimantDid)
      } else if (b.status === BountyStatus.Cancelled) counts.cancelled++
      else if (b.status === BountyStatus.Disputed) counts.disputed++
    }

    return {
      counts,
      totalBounties: bounties.length,
      totalPaidOut,
      activeAgents: agents.size,
      isLoading,
    }
  }, [bounties, isLoading])
}
