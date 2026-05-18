'use client'

import { useQuery } from '@tanstack/react-query'

export interface NetworkAgentDTO {
  did: string
  fullDid: string
  capabilities: string[]
  trustScore: number
  registeredAt: string
  registeredAgo: string
  lastSeen: string | null
  profileUrl: string
}

export interface NetworkAgentsSnapshot {
  agents: NetworkAgentDTO[]
  count: number
  totalCount: number
  offset: number
  limit: number
  fetchedAt: string
  error?: string
}

export function useNetworkAgents(limit = 100) {
  return useQuery<NetworkAgentsSnapshot>({
    queryKey: ['network-agents', limit],
    queryFn: async () => {
      const res = await fetch(`/api/network-agents?limit=${limit}`)
      if (!res.ok) throw new Error(`network-agents ${res.status}`)
      return res.json()
    },
    staleTime: 10_000,
    refetchInterval: 10_000, // poll every 10s — feels live
  })
}
