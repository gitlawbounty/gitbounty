import type { Bounty, ActivityEvent, AgentStats } from '@/lib/bounty/types'
import { statusToLabel } from '@/lib/bounty/format'
import { formatTokenAmount } from '@/lib/format/amount'
import { addresses } from '@/lib/contracts/addresses'
import { env } from '@/lib/env'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://gitlawbounty.xyz'

export function serializeBounty(b: Bounty) {
  return {
    id: b.id,
    status: statusToLabel(b.status),
    amount: b.amount.toString(),
    amountFormatted: `${formatTokenAmount(b.amount, 18)} $GITLAWB`,
    title: b.title,
    creator: { address: b.creator, did: null },
    claimant: { address: b.claimantAddress, did: b.claimantDid || null },
    repo: {
      owner: b.repoOwner,
      name: b.repoName,
      issueId: b.issueId,
      issueUrl: `gitlawb://${b.repoOwner}/${b.repoName}/issues/${b.issueId}`,
    },
    prId: b.prId || null,
    createdAt: new Date(Number(b.createdAt) * 1000).toISOString(),
    claimedAt: b.claimedAt > 0n ? new Date(Number(b.claimedAt) * 1000).toISOString() : null,
    submittedAt: b.submittedAt > 0n ? new Date(Number(b.submittedAt) * 1000).toISOString() : null,
    completedAt: b.completedAt > 0n ? new Date(Number(b.completedAt) * 1000).toISOString() : null,
    deadline: Number(b.deadline),
    deadlineAt:
      b.claimedAt > 0n
        ? new Date(Number(b.claimedAt + b.deadline) * 1000).toISOString()
        : null,
    links: {
      ui: `${BASE_URL}/bounty/${b.id}`,
      basescan: `https://sepolia.basescan.org/address/${addresses.bounty}`,
      contractCall: contractCallForStatus(b),
    },
  }
}

function contractCallForStatus(b: Bounty) {
  const base = { contract: addresses.bounty, chainId: env.NEXT_PUBLIC_CHAIN_ID }
  switch (statusToLabel(b.status)) {
    case 'open':
      return { ...base, function: 'claimBounty', args: [b.id.toString(), '<YOUR_DID>'] }
    case 'claimed':
      return { ...base, function: 'submitBounty', args: [b.id.toString(), '<YOUR_PR_ID>'] }
    case 'submitted':
      return { ...base, function: 'approveBounty', args: [b.id.toString()] }
    default:
      return null
  }
}

export function serializeAgent(a: AgentStats) {
  return {
    rank: a.rank,
    did: a.did,
    earnings: a.earnings.toString(),
    earningsFormatted: `${formatTokenAmount(a.earnings, 18)} $GITLAWB`,
    completedCount: Number(a.completedCount),
  }
}

export function serializeEvent(e: ActivityEvent) {
  return {
    kind: e.kind,
    bountyId: e.bountyId,
    txHash: e.txHash,
    blockNumber: e.blockNumber.toString(),
    timestamp: e.timestamp > 0n ? new Date(Number(e.timestamp) * 1000).toISOString() : null,
    data: e.data,
  }
}

export function commonHeaders(source: 'rpc' | 'snapshot' = 'rpc') {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 's-maxage=30, stale-while-revalidate=60',
    'X-Source': source,
    'X-Generated-At': new Date().toISOString(),
  }
}
