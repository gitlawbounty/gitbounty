'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { fetchBountyIdsFromEvents, fetchBounties, publicClient } from '@/lib/bounty/read'
import { getLastSeenBlock, setLastSeenBlock, getCachedBounties, setCachedBounties } from '@/lib/bounty/cache'
import { addresses } from '@/lib/contracts/addresses'
import { bountyAbi } from '@/lib/contracts/bounty-abi'
import { env } from '@/lib/env'
import type { Bounty } from '@/lib/bounty/types'

export function useBounties() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['bounties'],
    queryFn: async (): Promise<Bounty[]> => {
      const fromBlock = getLastSeenBlock(env.NEXT_PUBLIC_DEPLOY_BLOCK)
      const cached = getCachedBounties()
      const newIds = await fetchBountyIdsFromEvents(fromBlock)
      const cachedIds = new Set(cached.map((b) => b.id))
      const toFetch = Array.from(new Set([...cachedIds, ...newIds]))
      const fresh = await fetchBounties(toFetch)
      const latest = await publicClient.getBlockNumber()
      setLastSeenBlock(latest)
      setCachedBounties(fresh)
      return fresh
    },
    staleTime: 15_000,
  })

  useEffect(() => {
    const unwatch = publicClient.watchContractEvent({
      address: addresses.bounty,
      abi: bountyAbi,
      onLogs: () => queryClient.invalidateQueries({ queryKey: ['bounties'] }),
    })
    return () => unwatch()
  }, [queryClient])

  return query
}
