import { createPublicClient, http, type Address } from 'viem'
import { activeChain } from '../chains'
import { env } from '../env'
import { addresses } from '../contracts/addresses'
import { bountyAbi } from '../contracts/bounty-abi'
import type { Bounty, ProtocolStats, ActivityEvent } from './types'
import { BountyStatus } from './types'

const client = createPublicClient({
  chain: activeChain,
  transport: http(env.NEXT_PUBLIC_RPC_URL),
})

const ZERO_ADDR = '0x0000000000000000000000000000000000000000' as const

// Public Base Sepolia RPC limits `eth_getLogs` to a 2000-block range. Alchemy/Infura
// allow larger ranges but we chunk for compatibility with any provider.
const MAX_BLOCK_RANGE = 1900n

type AnyContractEvent = {
  args: Record<string, unknown>
  eventName: string
  transactionHash: `0x${string}`
  blockNumber: bigint
}

async function getLogsChunked(opts: {
  eventName: 'BountyCreated' | 'BountyClaimed' | 'BountySubmitted' | 'BountyCompleted' | 'BountyCancelled' | 'BountyDisputed'
  fromBlock: bigint
  toBlock: bigint
}): Promise<AnyContractEvent[]> {
  const all: AnyContractEvent[] = []
  let cursor = opts.fromBlock
  while (cursor <= opts.toBlock) {
    const end = cursor + MAX_BLOCK_RANGE > opts.toBlock ? opts.toBlock : cursor + MAX_BLOCK_RANGE
    const logs = (await client.getContractEvents({
      address: addresses.bounty,
      abi: bountyAbi,
      eventName: opts.eventName,
      fromBlock: cursor,
      toBlock: end,
    })) as unknown as AnyContractEvent[]
    all.push(...logs)
    cursor = end + 1n
  }
  return all
}

export async function fetchBountyIdsFromEvents(fromBlock: bigint): Promise<number[]> {
  const latest = await client.getBlockNumber()
  // Cap the historical window to the last ~500k blocks (~2 weeks on Base) to keep build/CI fast.
  // Live bounties are surfaced via WebSocket on the client anyway.
  const HORIZON = 500_000n
  const effectiveFrom = latest - fromBlock > HORIZON ? latest - HORIZON : fromBlock
  const logs = await getLogsChunked({
    eventName: 'BountyCreated',
    fromBlock: effectiveFrom,
    toBlock: latest,
  })
  return logs.map((log) => Number((log.args as { bountyId: bigint }).bountyId))
}

export async function fetchBounties(ids: number[]): Promise<Bounty[]> {
  if (ids.length === 0) return []
  const results = await client.multicall({
    contracts: ids.map((id) => ({
      address: addresses.bounty as Address,
      abi: bountyAbi,
      functionName: 'bounties',
      args: [BigInt(id)],
    })),
  })
  return results
    .map((r, i) => {
      if (r.status !== 'success' || !r.result) return null
      const tuple = r.result as unknown as readonly [
        Address, bigint, string, string, string, string, string, Address, string, number,
        bigint, bigint, bigint, bigint, bigint
      ]
      const bounty: Bounty = {
        id: ids[i],
        creator: tuple[0],
        amount: tuple[1],
        repoOwner: tuple[2],
        repoName: tuple[3],
        issueId: tuple[4],
        title: tuple[5],
        claimantDid: tuple[6],
        claimantAddress: tuple[7] === ZERO_ADDR ? null : tuple[7],
        prId: tuple[8],
        status: tuple[9] as BountyStatus,
        createdAt: tuple[10],
        claimedAt: tuple[11],
        submittedAt: tuple[12],
        completedAt: tuple[13],
        deadline: tuple[14],
      }
      return bounty
    })
    .filter((b): b is Bounty => b !== null)
}

export async function fetchProtocolStats(): Promise<ProtocolStats> {
  const [stats, nextId] = await Promise.all([
    client.readContract({
      address: addresses.bounty,
      abi: bountyAbi,
      functionName: 'getProtocolStats',
    }),
    client.readContract({
      address: addresses.bounty,
      abi: bountyAbi,
      functionName: 'nextBountyId',
    }),
  ])
  return {
    totalBounties: nextId as bigint,
    totalPaidOut: (stats as readonly bigint[])[1],
    totalFeesCollected: (stats as readonly bigint[])[2],
    openCount: 0, claimedCount: 0, submittedCount: 0,
    completedCount: 0, cancelledCount: 0, disputedCount: 0,
  }
}

const EVENT_NAMES = [
  'BountyCreated', 'BountyClaimed', 'BountySubmitted',
  'BountyCompleted', 'BountyCancelled', 'BountyDisputed',
] as const

export async function fetchRecentEvents(fromBlock: bigint, limit = 20): Promise<ActivityEvent[]> {
  const latest = await client.getBlockNumber()
  // Cap the recent-events window so we don't hammer the RPC with 100s of chunked calls.
  const HORIZON = 50_000n // last ~24h on Base (2s blocks)
  const effectiveFrom = latest - fromBlock > HORIZON ? latest - HORIZON : fromBlock
  const allLogs = await Promise.all(
    EVENT_NAMES.map((name) =>
      getLogsChunked({
        eventName: name,
        fromBlock: effectiveFrom,
        toBlock: latest,
      }),
    ),
  )
  const events: ActivityEvent[] = []
  for (const logs of allLogs) {
    for (const log of logs) {
      events.push({
        kind: log.eventName as ActivityEvent['kind'],
        bountyId: Number((log.args as { bountyId: bigint }).bountyId),
        txHash: log.transactionHash,
        blockNumber: log.blockNumber,
        timestamp: 0n,
        data: log.args as Record<string, unknown>,
      })
    }
  }
  return events.sort((a, b) => Number(b.blockNumber - a.blockNumber)).slice(0, limit)
}

export { client as publicClient }
