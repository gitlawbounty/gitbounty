import { NextResponse } from 'next/server'
import { fetchBounties } from '@/lib/bounty/read'
import { analyzeBounty } from '@/lib/llm/scout'
import { commonHeaders } from '@/lib/api/serialize'

// Edge cache the analysis for 15 minutes per bounty.
export const revalidate = 900

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const numId = Number.parseInt(id, 10)
  if (!Number.isFinite(numId)) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 })
  }

  try {
    const [bounty] = await fetchBounties([numId])
    if (!bounty) return NextResponse.json({ error: 'bounty not found' }, { status: 404 })

    const analysis = await analyzeBounty(bounty)
    return NextResponse.json(analysis, {
      headers: {
        ...commonHeaders('rpc'),
        'Cache-Control': 's-maxage=900, stale-while-revalidate=3600',
      },
    })
  } catch (err) {
    return NextResponse.json(
      { error: 'scout unavailable', detail: String(err).slice(0, 200) },
      { status: 503, headers: { 'Retry-After': '60' } },
    )
  }
}
