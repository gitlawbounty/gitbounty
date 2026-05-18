import { NextResponse } from 'next/server'
import { fetchDidRegistrations } from '@/lib/bounty/did-events'
import { commonHeaders } from '@/lib/api/serialize'

export const revalidate = 60
export const dynamic = 'force-dynamic'

export async function GET() {
  const events = await fetchDidRegistrations()
  return NextResponse.json(
    {
      events: events.map((e) => ({
        kind: e.kind,
        did: e.did,
        owner: e.owner,
        txHash: e.txHash,
        blockNumber: e.blockNumber.toString(),
      })),
      count: events.length,
      generatedAt: new Date().toISOString(),
    },
    {
      headers: {
        ...commonHeaders('rpc'),
        'Cache-Control': 's-maxage=60, stale-while-revalidate=300',
      },
    },
  )
}
