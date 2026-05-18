import { NextResponse } from 'next/server'
import { PERSONAS, type PersonaName } from '@/lib/llm/personas'
import { commonHeaders } from '@/lib/api/serialize'

export async function GET(_: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const persona = PERSONAS[name as PersonaName]
  if (!persona) {
    return NextResponse.json({ error: 'unknown persona' }, { status: 404 })
  }

  const { systemPrompt: _omit, ...publicFields } = persona
  return NextResponse.json(publicFields, { headers: commonHeaders('rpc') })
}
