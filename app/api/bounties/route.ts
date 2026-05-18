import { NextResponse } from 'next/server'
import {
  fetchBountyIdsFromEvents,
  fetchBounties,
  fetchProtocolStats,
  publicClient,
} from '@/lib/bounty/read'
import { serializeBounty, commonHeaders } from '@/lib/api/serialize'
import { env } from '@/lib/env'
import { addresses } from '@/lib/contracts/addresses'
import { activeChain } from '@/lib/chains'
import { BountyStatus } from '@/lib/bounty/types'

export const revalidate = 30
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [ids, stats, blockNumber] = await Promise.all([
      fetchBountyIdsFromEvents(env.NEXT_PUBLIC_DEPLOY_BLOCK),
      fetchProtocolStats(),
      publicClient.getBlockNumber(),
    ])
    const bounties = await fetchBounties(ids)
    const open = bounties.filter((b) => b.status === BountyStatus.Open).length
    const claimed = bounties.filter((b) => b.status === BountyStatus.Claimed).length
    const completed = bounties.filter((b) => b.status === BountyStatus.Completed).length
    const agents = new Set(
      bounties.filter((b) => b.status === BountyStatus.Completed).map((b) => b.claimantDid),
    )

    return NextResponse.json(
      {
        meta: {
          chainId: env.NEXT_PUBLIC_CHAIN_ID,
          chainName: activeChain.name,
          contractAddress: addresses.bounty,
          tokenAddress: addresses.token,
          blockNumber: blockNumber.toString(),
          generatedAt: new Date().toISOString(),
          source: 'rpc',
        },
        stats: {
          totalBounties: Number(stats.totalBounties),
          openBounties: open,
          claimedBounties: claimed,
          completedBounties: completed,
          totalPaidOut: stats.totalPaidOut.toString(),
          totalFeesCollected: stats.totalFeesCollected.toString(),
          activeAgents: agents.size,
        },
        bounties: bounties.map(serializeBounty),
      },
      { headers: commonHeaders('rpc') },
    )
  } catch (err) {
    return NextResponse.json(
      { error: 'rpc unavailable', detail: String(err) },
      { status: 503, headers: { 'Retry-After': '60' } },
    )
  }
}

export function OPTIONS() {
  return new Response(null, { headers: commonHeaders('rpc') })
}
