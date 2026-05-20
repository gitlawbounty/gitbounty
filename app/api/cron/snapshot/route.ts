import { NextResponse } from 'next/server'
import { PERSONAS, type PersonaName } from '@/lib/llm/personas'
import { fetchOffChainBounties } from '@/lib/scraper/gitlawb-scraper'
import { listWeeks, getPickSnapshot, saveOutcome } from '@/lib/persona-dao/store'
import { scorePick } from '@/lib/persona-dao/outcome'
import type { OutcomePick } from '@/lib/persona-dao/types'

export async function GET(req: Request) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('unauthorized', { status: 401 })
  }
  const snap = await fetchOffChainBounties()
  const statusById = new Map(snap.bounties.map((b) => [b.uuid, b.status]))
  let refreshed = 0

  for (const name of Object.keys(PERSONAS) as PersonaName[]) {
    for (const week of await listWeeks(name)) {
      const picksSnap = await getPickSnapshot(week, name)
      if (!picksSnap) continue
      const picks: OutcomePick[] = picksSnap.picks.map((p) => {
        const currentStatus = statusById.get(p.bountyId) ?? p.statusAtPick
        return {
          bountyId: p.bountyId,
          confidence: p.confidence,
          currentStatus,
          score: scorePick(currentStatus, p.confidence),
        }
      })
      await saveOutcome({ persona: name, week, picks, refreshedAt: new Date().toISOString() })
      refreshed++
    }
  }

  return NextResponse.json({ ok: true, refreshed, refreshedAt: new Date().toISOString() })
}
