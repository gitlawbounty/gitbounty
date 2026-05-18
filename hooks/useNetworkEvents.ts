'use client'

import { useQuery } from '@tanstack/react-query'
import type { NetworkEventsSnapshot } from '@/lib/scraper/network-events'

export function useNetworkEvents() {
  return useQuery<NetworkEventsSnapshot>({
    queryKey: ['network-events'],
    queryFn: async () => {
      const res = await fetch('/api/network-events')
      if (!res.ok) throw new Error(`network-events ${res.status}`)
      return res.json()
    },
    staleTime: 60_000,
    refetchInterval: 60_000, // poll every minute for "live" feel
  })
}
