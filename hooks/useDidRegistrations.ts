'use client'

import { useQuery } from '@tanstack/react-query'

export interface DidRegistration {
  kind: 'DIDRegistered'
  did: string
  owner: `0x${string}`
  txHash: `0x${string}`
  blockNumber: string
}

interface Resp {
  events: DidRegistration[]
  count: number
}

export function useDidRegistrations() {
  return useQuery<Resp>({
    queryKey: ['did-registrations'],
    queryFn: async () => {
      const res = await fetch('/api/did-registrations')
      if (!res.ok) throw new Error(`did ${res.status}`)
      return res.json()
    },
    staleTime: 60_000,
  })
}
