import { NextResponse } from 'next/server'
import { fetchBountyIdsFromEvents, fetchBounties } from '@/lib/bounty/read'
import { serializeBounty } from '@/lib/api/serialize'
import { env } from '@/lib/env'

export async function GET(req: Request) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('unauthorized', { status: 401 })
  }
  const ids = await fetchBountyIdsFromEvents(env.NEXT_PUBLIC_DEPLOY_BLOCK)
  const bounties = await fetchBounties(ids)
  return NextResponse.json({
    snapshotAt: new Date().toISOString(),
    count: bounties.length,
    bounties: bounties.map(serializeBounty),
  })
}
