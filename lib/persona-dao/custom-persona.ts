import { kv } from '@/lib/kv/client'

export interface CustomPersona {
  owner: string // wallet address, lowercased
  name: string
  specialty: string
  systemPrompt: string
  createdAt: string
}

/** Returns an error string if invalid, or null if ok. */
export function validateCustomPersonaInput(name: string, specialty: string): string | null {
  const n = name.trim()
  const s = specialty.trim()
  if (n.length === 0 || n.length > 40) return 'name must be 1-40 characters'
  if (s.length === 0 || s.length > 280) return 'specialty must be 1-280 characters'
  return null
}

/** Build the LLM system prompt for a user-defined scout persona. */
export function buildCustomSystemPrompt(name: string, specialty: string): string {
  return [
    `You are ${name.trim()}, a custom AI bounty-scout persona on gitbounty.`,
    '',
    `Your specialty and selection criteria: ${specialty.trim()}.`,
    '',
    'Voice: terse, lowercase, technical, no marketing fluff. Pick only bounties that fit your',
    'specialty; skip anything off-target. Be honest about confidence.',
  ].join('\n')
}

const key = (owner: string) => `custom-persona:${owner.toLowerCase()}`

export async function saveCustomPersona(p: CustomPersona): Promise<void> {
  await kv().set(key(p.owner), { ...p, owner: p.owner.toLowerCase() })
}

export async function getCustomPersona(owner: string): Promise<CustomPersona | null> {
  return (await kv().get<CustomPersona>(key(owner))) ?? null
}
