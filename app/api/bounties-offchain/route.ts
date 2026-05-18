import { NextResponse } from 'next/server'
import { fetchOffChainBounties } from '@/lib/scraper/gitlawb-scraper'
import { commonHeaders } from '@/lib/api/serialize'

// Off-chain bounty snapshot from node.gitlawb.com/api/v1/bounties (JSON API).
// Edge-cached 15s — short enough that new bounties surface in real-time on
// the live feed, long enough that we don't hammer upstream on every request.
export const revalidate = 15
export const dynamic = 'force-dynamic'

export async function GET() {
  const snapshot = await fetchOffChainBounties()
  return NextResponse.json(snapshot, {
    headers: {
      ...commonHeaders('rpc'),
      'Cache-Control': 's-maxage=15, stale-while-revalidate=60',
    },
  })
}
