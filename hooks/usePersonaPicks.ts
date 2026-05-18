'use client'

import { useQuery } from '@tanstack/react-query'
import type { PersonaName } from '@/lib/llm/personas'
import type { PersonaPicksResult } from '@/lib/llm/personas'

async function fetchPicks(name: PersonaName): Promise<PersonaPicksResult> {
  const res = await fetch(`/api/persona/${name}/picks`)
  if (!res.ok) throw new Error(`picks ${res.status}`)
  return res.json()
}

export function usePersonaPicks(name: PersonaName | null) {
  return useQuery({
    queryKey: ['persona-picks', name],
    queryFn: () => (name === null ? Promise.reject(new Error('no persona')) : fetchPicks(name)),
    enabled: name !== null,
    staleTime: 60 * 60 * 1000, // 1 hour
  })
}
