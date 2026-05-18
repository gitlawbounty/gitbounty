// Pull repos directly from the gitlawb node JSON API. Augment with bounty
// counts/totals derived from the bounty list so we can sort by activity.

import { fetchOffChainBounties } from './gitlawb-scraper'
import { fetchNodeRepos, bareDid, ageLabel } from '@/lib/gitlawb-node'

export interface RepoEntry {
  owner: string          // DID short-form (z6Mk...)
  name: string
  url: string            // gitlawb.com/{owner}/{name}
  bountyCount: number    // how many bounties reference this repo
  totalReward: number    // sum of numeric amounts
  latestBountyAge: string
  description?: string
  starCount?: number
  updatedAt?: string
  updatedAgo?: string
}

export async function fetchRepos(): Promise<RepoEntry[]> {
  const [reposSnap, bountiesSnap] = await Promise.all([
    fetchNodeRepos(),
    fetchOffChainBounties(),
  ])

  // Build bounty → repo aggregation map
  const bountyMap = new Map<string, { count: number; total: number; latestAge: string }>()
  for (const b of bountiesSnap.bounties) {
    if (!b.did || !b.repoName) continue
    const key = `${b.did}/${b.repoName}`
    const existing = bountyMap.get(key)
    if (existing) {
      existing.count += 1
      existing.total += b.amountNumeric
    } else {
      bountyMap.set(key, {
        count: 1,
        total: b.amountNumeric,
        latestAge: b.ageLabel,
      })
    }
  }

  // ── Primary: node API repo list ──
  if (reposSnap.repos.length > 0) {
    const out: RepoEntry[] = []
    for (const r of reposSnap.repos) {
      const owner = bareDid(r.owner_did)
      const key = `${owner}/${r.name}`
      const stats = bountyMap.get(key)
      out.push({
        owner,
        name: r.name,
        url: `https://gitlawb.com/${owner}/${r.name}`,
        bountyCount: stats?.count ?? 0,
        totalReward: stats?.total ?? 0,
        latestBountyAge: stats?.latestAge ?? '',
        description: r.description,
        starCount: r.star_count,
        updatedAt: r.updated_at,
        updatedAgo: ageLabel(r.updated_at),
      })
    }
    // Sort: most recently updated first, then by bounty count
    return out.sort((a, b) => {
      const at = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
      const bt = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
      if (at !== bt) return bt - at
      return b.bountyCount - a.bountyCount
    })
  }

  // ── Fallback: derive from bounties only ──
  const out: RepoEntry[] = []
  for (const [key, stats] of bountyMap) {
    const [owner, name] = key.split('/')
    out.push({
      owner,
      name,
      url: `https://gitlawb.com/${owner}/${name}`,
      bountyCount: stats.count,
      totalReward: stats.total,
      latestBountyAge: stats.latestAge,
    })
  }
  return out.sort((a, b) => b.bountyCount - a.bountyCount)
}
