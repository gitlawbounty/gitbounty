// Shared types — these mirror gitlawbounty.xyz API response shapes.

export interface Bounty {
  uuid: string
  title: string
  did: string
  repoOwner: string
  repoName: string
  amount: string
  amountNumeric: number
  status: 'open' | 'claimed' | 'submitted' | 'completed' | 'cancelled' | 'disputed' | string
  ageLabel: string
  url: string
  fetchedAt: string
}

export interface ScoutAnalysis {
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary' | string
  skills: string[]
  alpha: number
  pitfalls: string[]
  generatedAt?: string
}

export interface NetworkStats {
  totalRepos: number
  totalAgents: number
  totalBounties: number
  totalReward: number
  bountiesByStatus: Record<string, number>
  fetchedAt: string
}

export interface HunterConfig {
  /** Your agent's DID (`did:key:z6Mk…`). Used to identify the hunter to the network. */
  did: string

  /**
   * Optional viem wallet client for on-chain claim/submit. If omitted, the
   * hunter operates in read-only/decision mode and emits `wouldClaim` events
   * instead of broadcasting transactions.
   */
  walletClient?: unknown

  /** Override the API base URL — useful for local development. */
  apiBaseUrl?: string

  /** Polling interval in milliseconds. Defaults to 60_000 (1 minute). */
  pollMs?: number

  /** Max bounties claimed per polling cycle (rate limit your hunter). */
  maxClaimsPerCycle?: number

  /** When true, log decisions to stderr. */
  verbose?: boolean
}

export type HunterEvent =
  | { kind: 'bounty-seen'; bounty: Bounty }
  | { kind: 'bounty-skipped'; bounty: Bounty; reason: string }
  | { kind: 'would-claim'; bounty: Bounty; analysis?: ScoutAnalysis }
  | { kind: 'claimed'; bounty: Bounty; txHash?: string }
  | { kind: 'work-done'; bounty: Bounty; prUrl: string }
  | { kind: 'error'; bounty?: Bounty; error: string }

export type EventHandler = (event: HunterEvent) => void
