import { NextResponse } from 'next/server'
import { fetchBountyIdsFromEvents, fetchBounties } from '@/lib/bounty/read'
import { generatePicks, PERSONAS, type PersonaName } from '@/lib/llm/personas'
import { commonHeaders } from '@/lib/api/serialize'
import { env } from '@/lib/env'

// Cache for an hour — picks are weekly, no need to regenerate per request.
export const revalidate = 3600

export async function GET(_: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  if (!(name in PERSONAS)) {
    return NextResponse.json({ error: 'unknown persona' }, { status: 404 })
  }

  try {
    const ids = await fetchBountyIdsFromEvents(env.NEXT_PUBLIC_DEPLOY_BLOCK)
    const bounties = await fetchBounties(ids)
    const result = await generatePicks(name as PersonaName, bounties)
    return NextResponse.json(result, {
      headers: {
        ...commonHeaders('rpc'),
        'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (err) {
    return NextResponse.json(
      { error: 'picks unavailable', detail: String(err).slice(0, 200) },
      { status: 503, headers: { 'Retry-After': '120' } },
    )
  }
}
