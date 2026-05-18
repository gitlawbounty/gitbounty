import { NextResponse } from 'next/server'
import { fetchOffChainBounties } from '@/lib/scraper/gitlawb-scraper'
import { analyzeOffChainBounty } from '@/lib/llm/scout-offchain'
import { commonHeaders } from '@/lib/api/serialize'

export const revalidate = 900

export async function GET(_: Request, { params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await params
  try {
    const snap = await fetchOffChainBounties()
    const bounty = snap.bounties.find((b) => b.uuid === uuid)
    if (!bounty) {
      return NextResponse.json({ error: 'bounty not found in gitlawb network' }, { status: 404 })
    }
    const analysis = await analyzeOffChainBounty(bounty)
    return NextResponse.json(
      { ...analysis, bountyUuid: uuid },
      {
        headers: {
          ...commonHeaders('rpc'),
          'Cache-Control': 's-maxage=900, stale-while-revalidate=3600',
        },
      },
    )
  } catch (err) {
    return NextResponse.json(
      { error: 'scout unavailable', detail: String(err).slice(0, 200) },
      { status: 503, headers: { 'Retry-After': '60' } },
    )
  }
}
