import { NextResponse } from 'next/server'
import { fetchBountyIdsFromEvents, fetchBounties } from '@/lib/bounty/read'
import { generatePicks, PERSONAS, type PersonaName } from '@/lib/llm/personas'
import { commonHeaders } from '@/lib/api/serialize'
import { env } from '@/lib/env'
import { getSessionTier } from '@/lib/auth/server'

// Cache for an hour — picks are weekly, no need to regenerate per request.
export const revalidate = 3600
export const dynamic = 'force-dynamic'

const PICK_DELAY_MS = Number(process.env.GITB_PICK_DELAY_HOURS ?? '48') * 3600 * 1000

export async function GET(req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  if (!(name in PERSONAS)) {
    return NextResponse.json({ error: 'unknown persona' }, { status: 404 })
  }

  try {
    const ids = await fetchBountyIdsFromEvents(env.NEXT_PUBLIC_DEPLOY_BLOCK)
    const bounties = await fetchBounties(ids)
    const result = await generatePicks(name as PersonaName, bounties)

    const { tier } = getSessionTier(req)
    const generatedAtMs = Date.parse(result.generatedAt ?? '') || 0
    const withinDelay = Date.now() - generatedAtMs < PICK_DELAY_MS

    if (tier === 0 && withinDelay) {
      // Free tier inside the delay window: titles/rank only, alpha redacted.
      return NextResponse.json(
        {
          ...result,
          gated: true,
          picks: result.picks.map((p) => ({
            bountyId: p.bountyId,
            rank: p.rank,
            reasoning: null,
            confidence: null,
          })),
        },
        {
          headers: {
            ...commonHeaders('rpc'),
            'Cache-Control': 'no-store',
          },
        },
      )
    }

    return NextResponse.json(
      { ...result, gated: false },
      {
        headers: {
          ...commonHeaders('rpc'),
          'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
        },
      },
    )
  } catch (err) {
    return NextResponse.json(
      { error: 'picks unavailable', detail: String(err).slice(0, 200) },
      { status: 503, headers: { 'Retry-After': '120' } },
    )
  }
}
