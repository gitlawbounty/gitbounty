import { NextResponse } from 'next/server'
import { PERSONAS, type PersonaName } from '@/lib/llm/personas'
import { castVote, getVotes } from '@/lib/persona-dao/store'
import { voterHash } from '@/lib/persona-dao/voter'

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

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const ua = req.headers.get('user-agent') || 'unknown'
  const voter = voterHash(ip, ua)
  const week = currentWeek()

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
