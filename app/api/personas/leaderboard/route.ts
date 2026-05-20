import { NextResponse } from 'next/server'
import { PERSONAS, type PersonaName } from '@/lib/llm/personas'
import { listWeeks, getOutcome } from '@/lib/persona-dao/store'
import { computeReputation } from '@/lib/persona-dao/reputation'
import type { OffChainStatus } from '@/lib/persona-dao/types'

export const revalidate = 60
export const dynamic = 'force-dynamic'

export async function GET() {
  const rows = []
  for (const name of Object.keys(PERSONAS) as PersonaName[]) {
    const scored: { currentStatus: OffChainStatus; confidence: number }[] = []
    for (const week of await listWeeks(name)) {
      const outcome = await getOutcome(week, name)
      if (outcome) for (const p of outcome.picks) scored.push({ currentStatus: p.currentStatus, confidence: p.confidence })
    }
    rows.push(computeReputation(name, scored))
  }
  rows.sort((a, b) => b.displayScore - a.displayScore || b.totalPicks - a.totalPicks)
  return NextResponse.json({ leaderboard: rows })
}
