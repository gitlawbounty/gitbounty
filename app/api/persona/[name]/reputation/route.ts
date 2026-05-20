import { NextResponse } from 'next/server'
import { PERSONAS, type PersonaName } from '@/lib/llm/personas'
import { listWeeks, getOutcome, getVotes } from '@/lib/persona-dao/store'
import { computeReputation } from '@/lib/persona-dao/reputation'
import type { OffChainStatus } from '@/lib/persona-dao/types'

export const dynamic = 'force-dynamic'
export const revalidate = 60

export async function GET(_req: Request, ctx: { params: Promise<{ name: string }> }) {
  const { name } = await ctx.params
  if (!(name in PERSONAS)) return new Response('not found', { status: 404 })
  const persona = name as PersonaName

  const weeks = await listWeeks(persona)
  const scored: { currentStatus: OffChainStatus; confidence: number }[] = []
  const weekly: { week: string; displayScore: number; votes: number }[] = []

  for (const week of weeks) {
    const outcome = await getOutcome(week, persona)
    const votes = await getVotes(week, persona)
    if (outcome) {
      for (const p of outcome.picks) scored.push({ currentStatus: p.currentStatus, confidence: p.confidence })
      const wk = computeReputation(
        persona,
        outcome.picks.map((p) => ({ currentStatus: p.currentStatus, confidence: p.confidence })),
      )
      weekly.push({ week, displayScore: wk.displayScore, votes })
    } else {
      weekly.push({ week, displayScore: 0, votes })
    }
  }

  const summary = computeReputation(persona, scored)
  return NextResponse.json({ ...summary, weekly })
}
