import { NextResponse } from 'next/server'
import { fetchNetworkStats } from '@/lib/gitlawb-node'
import { commonHeaders } from '@/lib/api/serialize'

export const revalidate = 60
export const dynamic = 'force-dynamic'

/**
 * Aggregate network stats from the gitlawb node API.
 * The "big numbers" — total repos, total agents, total bounties, totals by status.
 */
export async function GET() {
  const stats = await fetchNetworkStats()
  return NextResponse.json(stats, {
    headers: {
      ...commonHeaders('rpc'),
      'Cache-Control': 's-maxage=60, stale-while-revalidate=300',
    },
  })
}
