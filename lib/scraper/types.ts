// Off-chain bounties scraped from gitlawb.com (the gitlawb p2p network).
// Different shape than on-chain Bounty (no contract id, no escrow tx, etc).

export type OffChainStatus =
  | 'open'
  | 'claimed'
  | 'submitted'
  | 'completed'
  | 'cancelled'
  | 'disputed'
  | 'unknown'

export interface OffChainBounty {
  source: 'offchain'
  uuid: string                // gitlawb.com bounty uuid (path /bounties/{uuid})
  title: string
  did: string                 // creator/repo DID prefix (z6Mk...)
  repoOwner: string
  repoName: string
  amount: string              // raw display, e.g., "300 $GITLAWB" or "100,000 $GITLAWB"
  amountNumeric: number       // best-effort parsed number (300, 100000)
  status: OffChainStatus
  ageLabel: string            // "14d ago", "33d ago"
  url: string                 // https://gitlawb.com/bounties/{uuid}
  fetchedAt: string           // ISO when scraped
  boosted?: boolean           // true if boosted by a tier-1 $GITB holder
}

export interface ScrapedBountySnapshot {
  bounties: OffChainBounty[]
  fetchedAt: string
  source: 'gitlawb.com'
  count: number
  error?: string
}
