'use client'

import { useQuery } from '@tanstack/react-query'
import type { ScoutAnalysis } from '@/lib/llm/scout'

async function fetchScout(id: number): Promise<ScoutAnalysis> {
  const res = await fetch(`/api/scout/${id}`)
  if (!res.ok) throw new Error(`scout ${res.status}`)
  return res.json()
}

export function useScoutAnalysis(id: number | null) {
  return useQuery({
    queryKey: ['scout', id],
    queryFn: () => (id === null ? Promise.reject(new Error('no id')) : fetchScout(id)),
    enabled: id !== null,
    staleTime: 15 * 60 * 1000, // 15 minutes
  })
}
