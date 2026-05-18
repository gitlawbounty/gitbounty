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
    staleTime: 10_000,
    refetchInterval: 10_000, // poll every 10s — feels live
  })
}
