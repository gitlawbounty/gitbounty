'use client'

import { useQuery } from '@tanstack/react-query'
import type { AgentProfile } from '@/lib/scraper/agent-profile'

async function fetchProfile(did: string): Promise<AgentProfile> {
  const res = await fetch(`/api/agent/${encodeURIComponent(did)}`)
  if (!res.ok) throw new Error(`agent ${res.status}`)
  return res.json()
}

export function useAgentProfile(did: string | null) {
  return useQuery({
    queryKey: ['agent-profile', did],
    queryFn: () => (did ? fetchProfile(did) : Promise.reject(new Error('no did'))),
    enabled: !!did,
    staleTime: 10 * 60 * 1000,
  })
}
