// Direct client for node.gitlawb.com/api/v1/* — the official gitlawb node JSON API.
// This is the SAME source @Gitlawbterminal uses. Full firehose, not HTML scraping.

const NODE_BASE = 'https://node.gitlawb.com/api/v1'

// ───────────────────────── types ─────────────────────────

export interface NodeBounty {
  id: string
  title: string
  amount: number
  creator_did: string
  claimant_did: string | null
  claimant_wallet: string | null
  repo_owner: string
  repo_name: string
  issue_id: string | null
  pr_id: string | null
  status: 'open' | 'claimed' | 'submitted' | 'completed' | 'cancelled' | 'disputed' | string
  deadline_secs: number
  created_at: string
  claimed_at: string | null
  submitted_at: string | null
  completed_at: string | null
  tx_hash: string | null
}

export interface NodeAgent {
  did: string
  capabilities: string[]
  registered_at: string
  last_seen: string | null
  trust_score: number
}

export interface NodeRepo {
  id: string
  name: string
  owner_did: string
  description: string
  is_public: boolean
  default_branch: string
  clone_url: string
  star_count: number
  created_at: string
  updated_at: string
  forked_from: string | null
}

export interface NodeEvent {
  // Schema TBD — endpoint currently returns empty. We support array | object envelope.
  type?: string
  did?: string
  repo?: string
  commit?: string
  timestamp?: string
  [k: string]: unknown
}

// ───────────────────────── fetch helpers ─────────────────────────

const COMMON_HEADERS = {
  'User-Agent': 'gitbounty-terminal/0.1 (+https://github.com/gitlawbounty)',
  Accept: 'application/json',
}

async function fetchJson<T>(path: string, revalidate = 60): Promise<T> {
  const res = await fetch(`${NODE_BASE}${path}`, {
    headers: COMMON_HEADERS,
    next: { revalidate },
  })
  if (!res.ok) throw new Error(`node ${path} ${res.status}`)
  return res.json() as Promise<T>
}

// ───────────────────────── public api ─────────────────────────

export interface BountiesSnapshot {
  bounties: NodeBounty[]
  count: number
  fetchedAt: string
  error?: string
}

export async function fetchNodeBounties(): Promise<BountiesSnapshot> {
  const fetchedAt = new Date().toISOString()
  try {
    const data = await fetchJson<{ bounties: NodeBounty[] }>('/bounties', 60)
    const bounties = data.bounties ?? []
    return { bounties, count: bounties.length, fetchedAt }
  } catch (err) {
    return { bounties: [], count: 0, fetchedAt, error: String(err).slice(0, 200) }
  }
}

export interface AgentsSnapshot {
  agents: NodeAgent[]
  count: number
  fetchedAt: string
  error?: string
}

export async function fetchNodeAgents(): Promise<AgentsSnapshot> {
  const fetchedAt = new Date().toISOString()
  try {
    const data = await fetchJson<{ agents: NodeAgent[] }>('/agents', 60)
    const agents = data.agents ?? []
    return { agents, count: agents.length, fetchedAt }
  } catch (err) {
    return { agents: [], count: 0, fetchedAt, error: String(err).slice(0, 200) }
  }
}

export interface ReposSnapshot {
  repos: NodeRepo[]
  count: number
  fetchedAt: string
  error?: string
}

export async function fetchNodeRepos(): Promise<ReposSnapshot> {
  const fetchedAt = new Date().toISOString()
  try {
    const data = await fetchJson<NodeRepo[] | { repos: NodeRepo[] }>('/repos', 60)
    const repos = Array.isArray(data) ? data : (data.repos ?? [])
    return { repos, count: repos.length, fetchedAt }
  } catch (err) {
    return { repos: [], count: 0, fetchedAt, error: String(err).slice(0, 200) }
  }
}

export interface EventsSnapshot {
  events: NodeEvent[]
  count: number
  fetchedAt: string
  error?: string
}

export async function fetchNodeEvents(): Promise<EventsSnapshot> {
  const fetchedAt = new Date().toISOString()
  try {
    const data = await fetchJson<NodeEvent[] | { events: NodeEvent[] }>('/events', 30)
    const events = Array.isArray(data) ? data : (data.events ?? [])
    return { events, count: events.length, fetchedAt }
  } catch (err) {
    return { events: [], count: 0, fetchedAt, error: String(err).slice(0, 200) }
  }
}

// ───────────────────────── stats (aggregate) ─────────────────────────

export interface NetworkStats {
  totalRepos: number
  totalAgents: number
  totalBounties: number
  bountiesByStatus: Record<string, number>
  totalReward: number
  fetchedAt: string
  errors: string[]
}

export async function fetchNetworkStats(): Promise<NetworkStats> {
  const [bountiesSnap, agentsSnap, reposSnap] = await Promise.all([
    fetchNodeBounties(),
    fetchNodeAgents(),
    fetchNodeRepos(),
  ])

  const bountiesByStatus: Record<string, number> = {}
  let totalReward = 0
  for (const b of bountiesSnap.bounties) {
    bountiesByStatus[b.status] = (bountiesByStatus[b.status] ?? 0) + 1
    totalReward += Number(b.amount ?? 0)
  }

  const errors: string[] = []
  if (bountiesSnap.error) errors.push(`bounties: ${bountiesSnap.error}`)
  if (agentsSnap.error) errors.push(`agents: ${agentsSnap.error}`)
  if (reposSnap.error) errors.push(`repos: ${reposSnap.error}`)

  return {
    totalRepos: reposSnap.count,
    totalAgents: agentsSnap.count,
    totalBounties: bountiesSnap.count,
    bountiesByStatus,
    totalReward,
    fetchedAt: new Date().toISOString(),
    errors,
  }
}

// ───────────────────────── helpers ─────────────────────────

/** Strip "did:key:" prefix → bare key id used in our routing. */
export function bareDid(did: string): string {
  return did.replace(/^did:[^:]+:/, '')
}

/** Derive a human "X ago" label from an ISO timestamp. */
export function ageLabel(iso: string | null | undefined): string {
  if (!iso) return ''
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return ''
  const sec = Math.max(0, Math.floor((Date.now() - t) / 1000))
  if (sec < 60) return '<1m ago'
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`
  return `${Math.floor(sec / 86400)}d ago`
}
