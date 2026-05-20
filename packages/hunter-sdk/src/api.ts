// Tiny client for gitlawbounty.xyz API. CORS-open + no auth.

import type { Bounty, ScoutAnalysis, NetworkStats } from './types.js'

export interface ApiClient {
  baseUrl: string
  listBounties(): Promise<Bounty[]>
  scoutBounty(uuid: string): Promise<ScoutAnalysis>
  networkStats(): Promise<NetworkStats>
}

export function createApiClient(baseUrl = 'https://gitlawbounty.xyz'): ApiClient {
  async function get<T>(path: string): Promise<T> {
    const res = await fetch(`${baseUrl}${path}`, {
      headers: {
        'User-Agent': '@gitbounty/hunter-sdk/0.1',
        Accept: 'application/json',
      },
    })
    if (!res.ok) throw new Error(`${path} ${res.status}`)
    return res.json() as Promise<T>
  }

  return {
    baseUrl,

    async listBounties() {
      const res = await get<{ bounties: Bounty[] }>('/api/bounties-offchain')
      return res.bounties
    },

    async scoutBounty(uuid: string) {
      return get<ScoutAnalysis>(`/api/scout/offchain/${encodeURIComponent(uuid)}`)
    },

    async networkStats() {
      return get<NetworkStats>('/api/network-stats')
    },
  }
}
