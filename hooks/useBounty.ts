'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchBounties } from '@/lib/bounty/read'

export function useBounty(id: number | null) {
  return useQuery({
    queryKey: ['bounty', id],
    queryFn: async () => {
      if (id === null) return null
      const [b] = await fetchBounties([id])
      return b ?? null
    },
    enabled: id !== null,
    staleTime: 15_000,
  })
}
