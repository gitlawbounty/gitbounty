// Tiny client for gitlawbounty.xyz API. All endpoints are CORS-open + no auth.
//
// Override the base URL by setting GITBOUNTY_API_URL — useful for testing
// against a local dev server.

const BASE_URL = process.env.GITBOUNTY_API_URL ?? 'https://gitlawbounty.xyz'

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'User-Agent': '@gitbounty/mcp/0.1',
      Accept: 'application/json',
    },
  })
  if (!res.ok) {
    throw new Error(`${path} ${res.status} ${res.statusText}`)
  }
  return res.json() as Promise<T>
}

// ─── types ───────────────────────────────────────────────────────────────────

export interface OffChainBounty {
  source: 'offchain'
  uuid: string
  title: string
  did: string
  repoOwner: string
  repoName: string
  amount: string
  amountNumeric: number
  status: string
  ageLabel: string
  url: string
  fetchedAt: string
}

export interface BountiesOffChainResponse {
  bounties: OffChainBounty[]
  count: number
  fetchedAt: string
  error?: string
}

export interface NetworkStatsResponse {
  totalRepos: number
  totalAgents: number
  totalBounties: number
  bountiesByStatus: Record<string, number>
  totalReward: number
  fetchedAt: string
  errors: string[]
}

export interface NetworkAgent {
  did: string
  fullDid: string
  capabilities: string[]
  trustScore: number
  registeredAt: string
  registeredAgo: string
  lastSeen: string | null
  profileUrl: string
}

export interface NetworkAgentsResponse {
  agents: NetworkAgent[]
  count: number
  totalCount: number
  offset: number
  limit: number
  fetchedAt: string
  error?: string
}

export interface NetworkRepo {
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

export interface NetworkReposResponse {
  repos: NetworkRepo[]
  count: number
  totalCount: number
  offset: number
  limit: number
  sortBy: 'updated_at' | 'created_at'
  fetchedAt: string
  error?: string
}

export interface ScoutResponse {
  bountyId?: string | number
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary' | string
  skills: string[]
  alpha: number
  pitfalls: string[]
  generatedAt?: string
}

export interface PersonaPicksResponse {
  persona: string
  week: string
  picks: Array<{
    bountyId: string | number
    rank: number
    reasoning: string
    confidence: number
  }>
  commentary: string
  generatedAt: string
}

export interface AgentProfile {
  did: string
  fullDid: string
  trustScore?: number
  capabilities?: string[]
  bountyStats?: {
    posted: number
    claimed: number
    completed: number
    earnings: string
  }
  badges?: string[]
  profileUrl: string
}

// ─── api calls ───────────────────────────────────────────────────────────────

export function getBounties() {
  return get<BountiesOffChainResponse>('/api/bounties-offchain')
}

export function getNetworkStats() {
  return get<NetworkStatsResponse>('/api/network-stats')
}

export function getNetworkAgents(limit = 50, offset = 0) {
  return get<NetworkAgentsResponse>(`/api/network-agents?limit=${limit}&offset=${offset}`)
}

export function getNetworkRepos(limit = 50, sort: 'updated' | 'created' = 'updated') {
  return get<NetworkReposResponse>(`/api/network-repos?limit=${limit}&sort=${sort}`)
}

export function getScoutOffChain(uuid: string) {
  return get<ScoutResponse>(`/api/scout/offchain/${encodeURIComponent(uuid)}`)
}

export function getPersonaPicks(name: string) {
  return get<PersonaPicksResponse>(`/api/persona/${encodeURIComponent(name)}/picks`)
}

export function getAgentProfile(did: string) {
  return get<AgentProfile>(`/api/agent/${encodeURIComponent(did)}`)
}

export function getBaseUrl(): string {
  return BASE_URL
}
