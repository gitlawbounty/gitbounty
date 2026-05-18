import { NextResponse } from 'next/server'
import { fetchRecentEvents, publicClient } from '@/lib/bounty/read'
import { serializeEvent, commonHeaders } from '@/lib/api/serialize'
import { env } from '@/lib/env'

export const revalidate = 30
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const latest = await publicClient.getBlockNumber()
    const window = 10_000n
    const fromBlock =
      latest - window > env.NEXT_PUBLIC_DEPLOY_BLOCK
        ? latest - window
        : env.NEXT_PUBLIC_DEPLOY_BLOCK
    const events = await fetchRecentEvents(fromBlock, 50)
    return NextResponse.json(
      { events: events.map(serializeEvent), count: events.length },
      { headers: commonHeaders('rpc') },
    )
  } catch (err) {
    const detail = String(err).replace(/https?:\/\/[^\s)"]+/g, '<rpc-url>').slice(0, 200)
    return NextResponse.json(
      { events: [], count: 0, error: detail },
      {
        status: 200,
        headers: {
          ...commonHeaders('rpc'),
          'Cache-Control': 's-maxage=10, stale-while-revalidate=60',
        },
      },
    )
  }
}
