'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { createPublicClient, webSocket } from 'viem'
import { fetchBountyIdsFromEvents, fetchBounties, publicClient } from '@/lib/bounty/read'
import {
  getLastSeenBlock,
  setLastSeenBlock,
  getCachedBounties,
  setCachedBounties,
} from '@/lib/bounty/cache'
import { addresses } from '@/lib/contracts/addresses'
import { bountyAbi } from '@/lib/contracts/bounty-abi'
import { activeChain } from '@/lib/chains'
import { env } from '@/lib/env'
import type { Bounty } from '@/lib/bounty/types'

// Browser-only WebSocket client for real-time event push. Falls back to polling if WSS fails.
const wssClient =
  typeof window !== 'undefined' && env.NEXT_PUBLIC_WSS_URL.startsWith('wss')
    ? createPublicClient({
        chain: activeChain,
        transport: webSocket(env.NEXT_PUBLIC_WSS_URL, { retryCount: 3 }),
      })
    : null

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
    const invalidate = () => queryClient.invalidateQueries({ queryKey: ['bounties'] })

    // Prefer WebSocket subscription for low-latency push, fall back to polling.
    if (wssClient) {
      const unwatch = wssClient.watchContractEvent({
        address: addresses.bounty,
        abi: bountyAbi,
        onLogs: invalidate,
        onError: () => {
          // WSS failed — fall back to polling
          const interval = setInterval(invalidate, 15_000)
          return () => clearInterval(interval)
        },
      })
      return () => unwatch()
    }

    // No WSS available — pure polling
    const interval = setInterval(invalidate, 15_000)
    return () => clearInterval(interval)
  }, [queryClient])

  return query
}
