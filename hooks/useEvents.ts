'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchRecentEvents, publicClient } from '@/lib/bounty/read'
import { env } from '@/lib/env'

export function useEvents(limit = 20) {
  return useQuery({
    queryKey: ['events', limit],
    queryFn: async () => {
      const latest = await publicClient.getBlockNumber()
      const window = 10_000n
      const fromBlock =
        latest - window > env.NEXT_PUBLIC_DEPLOY_BLOCK
          ? latest - window
          : env.NEXT_PUBLIC_DEPLOY_BLOCK
      return fetchRecentEvents(fromBlock, limit)
    },
    staleTime: 15_000,
  })
}
