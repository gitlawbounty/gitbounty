import { NextResponse } from 'next/server'
import { fetchBountyIdsFromEvents, fetchBounties } from '@/lib/bounty/read'
import { serializeAgent, commonHeaders } from '@/lib/api/serialize'
import { BountyStatus, type AgentStats } from '@/lib/bounty/types'
import { env } from '@/lib/env'

export const revalidate = 30
export const dynamic = 'force-dynamic'

export async function GET() {
  const ids = await fetchBountyIdsFromEvents(env.NEXT_PUBLIC_DEPLOY_BLOCK)
  const bounties = await fetchBounties(ids)
  const map = new Map<string, AgentStats>()
  for (const b of bounties) {
    if (b.status !== BountyStatus.Completed || !b.claimantDid) continue
    const e = map.get(b.claimantDid) ?? {
      did: b.claimantDid,
      earnings: 0n,
      completedCount: 0n,
    }
    e.earnings += b.amount
    e.completedCount += 1n
    map.set(b.claimantDid, e)
  }
  const agents = Array.from(map.values())
    .sort((a, b) => (b.earnings > a.earnings ? 1 : -1))
    .map((a, i) => ({ ...a, rank: i + 1 }))

  return NextResponse.json({ agents: agents.map(serializeAgent) }, { headers: commonHeaders('rpc') })
}
