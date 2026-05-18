'use client'

import { useQuery } from '@tanstack/react-query'

export interface NetworkRepoDTO {
  id: string
  name: string
  owner: string
  fullOwnerDid: string
  description: string
  starCount: number
  isPublic: boolean
  defaultBranch: string
  cloneUrl: string
  forkedFrom: string | null
  createdAt: string
  createdAgo: string
  updatedAt: string
  updatedAgo: string
  profileUrl: string
}

export interface NetworkReposSnapshot {
  repos: NetworkRepoDTO[]
  count: number
  totalCount: number
  offset: number
  limit: number
  sortBy: 'updated_at' | 'created_at'
  fetchedAt: string
  error?: string
}

export function useNetworkRepos(limit = 100, sort: 'updated' | 'created' = 'updated') {
  return useQuery<NetworkReposSnapshot>({
    queryKey: ['network-repos', limit, sort],
    queryFn: async () => {
      const res = await fetch(`/api/network-repos?limit=${limit}&sort=${sort}`)
      if (!res.ok) throw new Error(`network-repos ${res.status}`)
      return res.json()
    },
    staleTime: 10_000,
    refetchInterval: 10_000, // poll every 10s — feels live
  })
}
