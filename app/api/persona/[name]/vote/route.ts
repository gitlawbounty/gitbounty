import { NextResponse } from 'next/server'
import { PERSONAS, type PersonaName } from '@/lib/llm/personas'
import { castVote, getVotes, castWeightedVote } from '@/lib/persona-dao/store'
import { voterHash } from '@/lib/persona-dao/voter'
import { getSessionTier } from '@/lib/auth/server'
import { gitbBalanceWhole } from '@/lib/token/gitb'
import { voteWeight } from '@/lib/persona-dao/vote-weight'

function currentWeek(): string {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  const diff = (now.getTime() - start.getTime()) / 86_400_000
  const week = Math.ceil((diff + start.getDay() + 1) / 7)
  return `${now.getFullYear()}-W${String(week).padStart(2, '0')}`
}

export async function POST(req: Request, ctx: { params: Promise<{ name: string }> }) {
  const { name } = await ctx.params
  if (!(name in PERSONAS)) return new Response('not found', { status: 404 })
  const persona = name as PersonaName

  const week = currentWeek()

  const { address } = getSessionTier(req)
  if (address) {
    const balance = await gitbBalanceWhole(address)
    const weight = voteWeight(balance)
    if (weight <= 0) {
      return NextResponse.json({ counted: false, reason: 'no weight' }, { status: 403 })
    }
    const result = await castWeightedVote(week, persona, address, weight)
    return NextResponse.json(
      { persona, week, weightedVotes: result.total, weight, counted: result.ok },
      { status: result.ok ? 200 : 409 },
    )
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const ua = req.headers.get('user-agent') || 'unknown'
  const voter = voterHash(ip, ua)

  const result = await castVote(week, persona, voter)
  return NextResponse.json(
    { persona, week, votes: result.total, counted: result.ok },
    { status: result.ok ? 200 : 409 },
  )
}

export async function GET(_req: Request, ctx: { params: Promise<{ name: string }> }) {
  const { name } = await ctx.params
  if (!(name in PERSONAS)) return new Response('not found', { status: 404 })
  return NextResponse.json({ votes: await getVotes(currentWeek(), name as PersonaName) })
}
