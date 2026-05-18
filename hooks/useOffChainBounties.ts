'use client'

import { useQuery } from '@tanstack/react-query'
import type { ScrapedBountySnapshot } from '@/lib/scraper/types'

async function fetchOffChain(): Promise<ScrapedBountySnapshot> {
  const res = await fetch('/api/bounties-offchain')
  if (!res.ok) throw new Error(`offchain ${res.status}`)
  return res.json()
}

export function useOffChainBounties() {
  return useQuery({
    queryKey: ['bounties-offchain'],
    queryFn: fetchOffChain,
    staleTime: 5 * 60 * 1000, // 5 minutes — matches edge cache
  })
}
