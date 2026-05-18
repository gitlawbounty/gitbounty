'use client'

import { useQuery } from '@tanstack/react-query'
import type { RepoEntry } from '@/lib/scraper/repos-list'

interface ReposResponse {
  repos: RepoEntry[]
  count: number
  generatedAt: string
}

export function useRepos() {
  return useQuery<ReposResponse>({
    queryKey: ['repos'],
    queryFn: async () => {
      const res = await fetch('/api/repos')
      if (!res.ok) throw new Error(`repos ${res.status}`)
      return res.json()
    },
    staleTime: 10_000,
    refetchInterval: 10_000, // real-time: poll every 10s
  })
}
