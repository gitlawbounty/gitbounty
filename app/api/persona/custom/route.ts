import { NextResponse } from 'next/server'
import { getSessionTier } from '@/lib/auth/server'
import {
  validateCustomPersonaInput,
  buildCustomSystemPrompt,
  saveCustomPersona,
  getCustomPersona,
} from '@/lib/persona-dao/custom-persona'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { address } = getSessionTier(req)
  if (!address) return NextResponse.json({ persona: null })
  return NextResponse.json({ persona: await getCustomPersona(address) })
}

export async function POST(req: Request) {
  const { address, tier } = getSessionTier(req)
  if (!address) return new Response('unauthorized', { status: 401 })
  if (tier < 2) return NextResponse.json({ error: 'tier 2 ($GITB) required' }, { status: 403 })

  const { name, specialty } = (await req.json()) as { name?: string; specialty?: string }
  const err = validateCustomPersonaInput(name ?? '', specialty ?? '')
  if (err) return NextResponse.json({ error: err }, { status: 400 })

  const persona = {
    owner: address.toLowerCase(),
    name: (name as string).trim(),
    specialty: (specialty as string).trim(),
    systemPrompt: buildCustomSystemPrompt(name as string, specialty as string),
    createdAt: new Date().toISOString(),
  }
  await saveCustomPersona(persona)
  return NextResponse.json({ persona })
}
