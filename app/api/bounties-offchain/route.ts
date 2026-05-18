import { NextResponse } from 'next/server'
import { fetchOffChainBounties } from '@/lib/scraper/gitlawb-scraper'
import { commonHeaders } from '@/lib/api/serialize'

// Off-chain bounty snapshot. Edge-cached 5 minutes — gitlawb.com is the
// upstream source of truth, we don't want to hammer it.
export const revalidate = 300
export const dynamic = 'force-dynamic'

export async function GET() {
  const snapshot = await fetchOffChainBounties()
  return NextResponse.json(snapshot, {
    headers: {
      ...commonHeaders('rpc'),
      'Cache-Control': 's-maxage=300, stale-while-revalidate=900',
    },
  })
}
