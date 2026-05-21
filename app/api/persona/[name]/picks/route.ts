import { NextResponse } from 'next/server'
import { fetchBountyIdsFromEvents, fetchBounties } from '@/lib/bounty/read'
import { generatePicks, PERSONAS, type PersonaName } from '@/lib/llm/personas'
import { getPickSnapshot } from '@/lib/persona-dao/store'
import { isoWeek } from '@/lib/persona-dao/week'
import { commonHeaders } from '@/lib/api/serialize'
import { env } from '@/lib/env'
import { getSessionTier } from '@/lib/auth/server'

// Picks are weekly; no need to regenerate per request beyond the revalidate window.
export const revalidate = 3600
export const dynamic = 'force-dynamic'

const PICK_DELAY_MS = Number(process.env.GITB_PICK_DELAY_HOURS ?? '48') * 3600 * 1000

export async function GET(req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  if (!(name in PERSONAS)) {
    return NextResponse.json({ error: 'unknown persona' }, { status: 404 })
  }

  const persona = name as PersonaName
  const { tier } = getSessionTier(req)

  try {
    const week = isoWeek()
    const snap = await getPickSnapshot(week, persona)

    if (snap !== null) {
      // Serve from the stable weekly snapshot.
      const picks = snap.picks.map((p, i) => ({
        bountyId: p.bountyId,
        rank: i + 1,
        reasoning: p.reasoning,
        confidence: p.confidence,
      }))

      const withinDelay = Date.now() - Date.parse(snap.snapshotAt) < PICK_DELAY_MS

      if (tier === 0 && withinDelay) {
        // Free tier inside the 48 h delay: show picks list but redact alpha.
        return NextResponse.json(
          {
            persona: snap.persona,
            week: snap.week,
            commentary: snap.commentary,
            picks: picks.map((p) => ({ bountyId: p.bountyId, rank: p.rank, reasoning: null, confidence: null })),
            gated: true,
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
        {
          persona: snap.persona,
          week: snap.week,
          commentary: snap.commentary,
          picks,
          gated: false,
        },
        {
          headers: {
            ...commonHeaders('rpc'),
            'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
          },
        },
      )
    }

    // Cron hasn't snapshotted yet — fall back to live generation.
    // Tier 0 gets redacted (no stable timestamp to measure delay against).
    const ids = await fetchBountyIdsFromEvents(env.NEXT_PUBLIC_DEPLOY_BLOCK)
    const bounties = await fetchBounties(ids)
    const result = await generatePicks(persona, bounties)

    if (tier === 0) {
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
