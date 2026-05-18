import { NextResponse } from 'next/server'
import { fetchRecentEvents, publicClient } from '@/lib/bounty/read'
import { serializeEvent, commonHeaders } from '@/lib/api/serialize'
import { env } from '@/lib/env'

export const revalidate = 30

export async function GET() {
  const latest = await publicClient.getBlockNumber()
  const window = 10_000n
  const fromBlock =
    latest - window > env.NEXT_PUBLIC_DEPLOY_BLOCK
      ? latest - window
      : env.NEXT_PUBLIC_DEPLOY_BLOCK
  const events = await fetchRecentEvents(fromBlock, 50)
  return NextResponse.json({ events: events.map(serializeEvent) }, { headers: commonHeaders('rpc') })
}
