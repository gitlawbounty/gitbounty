import { NextResponse } from 'next/server'
import { fetchNetworkEvents } from '@/lib/scraper/network-events'
import { commonHeaders } from '@/lib/api/serialize'

export const revalidate = 60
export const dynamic = 'force-dynamic'

export async function GET() {
  const snap = await fetchNetworkEvents()
  return NextResponse.json(snap, {
    headers: {
      ...commonHeaders('rpc'),
      'Cache-Control': 's-maxage=60, stale-while-revalidate=300',
    },
  })
}
