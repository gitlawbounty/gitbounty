// Scrape recent repos from gitlawb.com bounty list + agent profiles.
// We don't have a direct "list all repos" endpoint, so we derive from bounty data.

import { fetchOffChainBounties } from './gitlawb-scraper'

export interface RepoEntry {
  owner: string          // DID short-form (z6Mk...)
  name: string
  url: string            // gitlawb.com/{owner}/{name}
  bountyCount: number    // how many bounties reference this repo
  totalReward: number    // sum of numeric amounts
  latestBountyAge: string
}

export async function fetchRepos(): Promise<RepoEntry[]> {
  const snap = await fetchOffChainBounties()
  const map = new Map<string, RepoEntry>()
  for (const b of snap.bounties) {
    if (!b.did || !b.repoName) continue
    const key = `${b.did}/${b.repoName}`
    const existing = map.get(key)
    if (existing) {
      existing.bountyCount += 1
      existing.totalReward += b.amountNumeric
    } else {
      map.set(key, {
        owner: b.did,
        name: b.repoName,
        url: `https://gitlawb.com/${b.did}/${b.repoName}`,
        bountyCount: 1,
        totalReward: b.amountNumeric,
        latestBountyAge: b.ageLabel,
      })
    }
  }
  return Array.from(map.values()).sort((a, b) => b.bountyCount - a.bountyCount)
}
