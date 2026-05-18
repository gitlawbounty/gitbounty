export enum BountyStatus {
  Open = 0,
  Claimed = 1,
  Submitted = 2,
  Completed = 3,
  Cancelled = 4,
  Disputed = 5,
}

export type StatusLabel = 'open' | 'claimed' | 'submitted' | 'completed' | 'cancelled' | 'disputed'

export interface Bounty {
  id: number
  creator: `0x${string}`
  amount: bigint
  repoOwner: string
  repoName: string
  issueId: string
  title: string
  claimantDid: string
  claimantAddress: `0x${string}` | null
  prId: string
  status: BountyStatus
  createdAt: bigint
  claimedAt: bigint
  submittedAt: bigint
  completedAt: bigint
  deadline: bigint
}

export interface ProtocolStats {
  totalBounties: bigint
  totalPaidOut: bigint
  totalFeesCollected: bigint
  openCount: number
  claimedCount: number
  submittedCount: number
  completedCount: number
  cancelledCount: number
  disputedCount: number
}

export interface AgentStats {
  did: string
  earnings: bigint
  completedCount: bigint
  rank?: number
}

export type EventKind =
  | 'BountyCreated'
  | 'BountyClaimed'
  | 'BountySubmitted'
  | 'BountyCompleted'
  | 'BountyCancelled'
  | 'BountyDisputed'

export interface ActivityEvent {
  kind: EventKind
  bountyId: number
  txHash: `0x${string}`
  blockNumber: bigint
  timestamp: bigint
  data: Record<string, unknown>
}
