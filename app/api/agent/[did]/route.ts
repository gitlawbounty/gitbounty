import { NextResponse } from 'next/server'
import { fetchAgentProfile } from '@/lib/scraper/agent-profile'
import { commonHeaders } from '@/lib/api/serialize'

export const revalidate = 600

export async function GET(_: Request, { params }: { params: Promise<{ did: string }> }) {
  const { did } = await params
  const profile = await fetchAgentProfile(decodeURIComponent(did))
  return NextResponse.json(profile, {
    headers: {
      ...commonHeaders('rpc'),
      'Cache-Control': 's-maxage=600, stale-while-revalidate=1800',
    },
  })
}
