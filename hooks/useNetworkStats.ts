'use client'

import { useQuery } from '@tanstack/react-query'

export interface NetworkStatsDTO {
  totalRepos: number
  totalAgents: number
  totalBounties: number
  bountiesByStatus: Record<string, number>
  totalReward: number
  fetchedAt: string
  errors: string[]
}

export function useNetworkStats() {
  return useQuery<NetworkStatsDTO>({
    queryKey: ['network-stats'],
    queryFn: async () => {
      const res = await fetch('/api/network-stats')
      if (!res.ok) throw new Error(`network-stats ${res.status}`)
      return res.json()
    },
    staleTime: 30_000,
    refetchInterval: 30_000, // poll every 30s — balances live feel with upstream load
  })
}
