import { NextResponse } from 'next/server'
import { getSessionTier } from '@/lib/auth/server'
import { getCustomPersona } from '@/lib/persona-dao/custom-persona'
import { generatePicksFromPrompt } from '@/lib/llm/personas'
import { fetchOffChainBounties } from '@/lib/scraper/gitlawb-scraper'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { address, tier } = getSessionTier(req)
  if (!address) return new Response('unauthorized', { status: 401 })
  if (tier < 2) return NextResponse.json({ error: 'tier 2 ($GITB) required' }, { status: 403 })

  const persona = await getCustomPersona(address)
  if (!persona) return NextResponse.json({ error: 'no custom persona yet' }, { status: 404 })

  try {
    const snap = await fetchOffChainBounties()
    const result = await generatePicksFromPrompt(persona.systemPrompt, persona.name, snap.bounties)
    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json(
      { error: 'picks unavailable', detail: String(err).slice(0, 200) },
      { status: 503, headers: { 'Retry-After': '120' } },
    )
  }
}
