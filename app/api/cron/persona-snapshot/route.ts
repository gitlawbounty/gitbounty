import { NextResponse } from 'next/server'
import { PERSONAS, generatePicksOffChain, type PersonaName } from '@/lib/llm/personas'
import { fetchOffChainBounties } from '@/lib/scraper/gitlawb-scraper'
import { savePickSnapshot } from '@/lib/persona-dao/store'
import type { SnapshotPick } from '@/lib/persona-dao/types'

export async function GET(req: Request) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('unauthorized', { status: 401 })
  }
  const snap = await fetchOffChainBounties()
  const byId = new Map(snap.bounties.map((b) => [b.uuid, b]))
  const results: Record<string, number | string> = {}

  for (const name of Object.keys(PERSONAS) as PersonaName[]) {
    try {
      const picksResult = await generatePicksOffChain(name, snap.bounties)
      const picks: SnapshotPick[] = picksResult.picks.map((p) => ({
        bountyId: p.bountyId,
        reasoning: p.reasoning,
        confidence: p.confidence,
        statusAtPick: byId.get(p.bountyId)?.status ?? 'unknown',
      }))
      await savePickSnapshot({
        persona: name,
        week: picksResult.week,
        picks,
        commentary: picksResult.commentary,
        snapshotAt: new Date().toISOString(),
      })
      results[name] = picks.length
    } catch (err) {
      results[name] = `error: ${err instanceof Error ? err.message : String(err)}`
    }
  }

  return NextResponse.json({ ok: true, snapshotAt: new Date().toISOString(), results })
}
