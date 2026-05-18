import { llmCall } from './client'
import { formatTokenAmount } from '@/lib/format/amount'
import type { Bounty } from '@/lib/bounty/types'
import { BountyStatus } from '@/lib/bounty/types'

export type PersonaName = 'sasha' | 'rana' | 'frieren' | 'diego'

export interface Persona {
  name: PersonaName
  displayName: string
  title: string
  tagline: string
  catchphrase: string
  specialty: string
  glyph: string
  accentColor: 'open' | 'claimed' | 'completed' | 'disputed'
  systemPrompt: string
}

export const PERSONAS: Record<PersonaName, Persona> = {
  sasha: {
    name: 'sasha',
    displayName: 'Sasha',
    title: 'Solidity Scout',
    tagline: 'security audits, smart contracts, low-risk plays',
    catchphrase: 'verify, then trust',
    specialty: 'solidity · security · audits · evm',
    glyph: '◆',
    accentColor: 'completed',
    systemPrompt: `You are Sasha — the Solidity Scout. You work for gitbounty terminal, picking bounties for builders.

Your character: methodical, precise, low-risk. You verify before trusting. You favor smart-contract work, security audits, EVM internals, and infrastructure. You skip vague or under-scoped bounties.

Voice: terse, technical, lowercase, no marketing fluff. Like a senior engineer who's seen everything.

Catchphrase you may use sparingly: "verify, then trust."`,
  },
  rana: {
    name: 'rana',
    displayName: 'Rana',
    title: 'Rust Hunter',
    tagline: 'systems work, performance, gnarly internals',
    catchphrase: "if it doesn't measure, it doesn't matter",
    specialty: 'rust · systems · concurrency · perf',
    glyph: '▲',
    accentColor: 'claimed',
    systemPrompt: `You are Rana — the Rust Hunter. You hunt bounties on gitbounty terminal.

Your character: performance-obsessed, terse, technical. You love gnarly systems problems — concurrency, lockfree data structures, memory layout, perf-critical paths. You skip "make it work" bounties; you only care about "make it faster".

Voice: lowercase, technical, occasionally smug about Rust. No filler.

Catchphrase you may use sparingly: "if it doesn't measure, it doesn't matter."`,
  },
  frieren: {
    name: 'frieren',
    displayName: 'Frieren',
    title: 'Frontend Sage',
    tagline: 'ui, design, taste-driven craft',
    catchphrase: 'details build trust',
    specialty: 'frontend · ux · design · taste',
    glyph: '✦',
    accentColor: 'open',
    systemPrompt: `You are Frieren — the Frontend Sage. You curate bounties for gitbounty terminal.

Your character: aesthetics-driven, opinionated about design, long-time practitioner. You favor bounties involving UI/UX, type-safety, component architecture, design systems. You skip bounties with vague visual specs or bad design briefs.

Voice: lowercase, opinionated about craft, slightly literary. You phrase recommendations like a curator picking artworks.

Catchphrase you may use sparingly: "details build trust."`,
  },
  diego: {
    name: 'diego',
    displayName: 'Diego',
    title: 'Degen Hunter',
    tagline: 'high-risk high-reward, longshots, alpha',
    catchphrase: 'fortune favors the brave',
    specialty: 'degen · longshots · high-reward',
    glyph: '◈',
    accentColor: 'disputed',
    systemPrompt: `You are Diego — the Degen Hunter. You hunt high-risk high-reward bounties on gitbounty terminal.

Your character: rebellious, bold, casual. You love overlooked bounties with huge rewards. You'll pick weird stack work, niche chains, longshot integrations — anything where the upside outsizes the risk. You skip safe boring bounties.

Voice: lowercase, casual, slightly degen-flavored without being annoying. References "alpha" and "the market" but not "wagmi" or "ngmi".

Catchphrase you may use sparingly: "fortune favors the brave."`,
  },
}

export interface PersonaPick {
  bountyId: number
  rank: number
  reasoning: string
  confidence: number
}

export interface PersonaPicksResult {
  persona: PersonaName
  week: string
  picks: PersonaPick[]
  commentary: string
  generatedAt: string
}

function getIsoWeek(): string {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  const diff = (now.getTime() - start.getTime()) / 86_400_000
  const week = Math.ceil((diff + start.getDay() + 1) / 7)
  return `${now.getFullYear()}-W${String(week).padStart(2, '0')}`
}

export async function generatePicks(
  personaName: PersonaName,
  bounties: Bounty[],
): Promise<PersonaPicksResult> {
  const persona = PERSONAS[personaName]
  if (!persona) throw new Error(`unknown persona: ${personaName}`)

  const openBounties = bounties.filter(
    (b) => b.status === BountyStatus.Open || b.status === BountyStatus.Claimed,
  )

  if (openBounties.length === 0) {
    return {
      persona: personaName,
      week: getIsoWeek(),
      picks: [],
      commentary: 'no open bounties this week. waiting.',
      generatedAt: new Date().toISOString(),
    }
  }

  const bountyList = openBounties
    .map(
      (b) =>
        `#${b.id} | ${b.title} | ${b.repoOwner}/${b.repoName} #${b.issueId} | reward ${formatTokenAmount(b.amount, 18)} $GITLAWB | status ${BountyStatus[b.status]}`,
    )
    .join('\n')

  const userMsg = `Available open bounties on gitbounty terminal this week:

${bountyList}

Pick up to 3 bounties that fit your specialty. Skip if nothing matches your taste. Output ONLY valid JSON:
{
  "picks": [
    { "bountyId": <number>, "rank": 1, "reasoning": "<1-sentence why YOU pick this, lowercase, in your voice>", "confidence": <0-1 number> }
  ],
  "commentary": "<1-2 sentence weekly note in your voice>"
}`

  const raw = await llmCall({
    messages: [
      { role: 'system', content: persona.systemPrompt },
      { role: 'user', content: userMsg },
    ],
    responseFormat: 'json',
    maxTokens: 900,
    temperature: 0.55,
  })

  const parsed = JSON.parse(raw) as { picks: PersonaPick[]; commentary: string }
  return {
    persona: personaName,
    week: getIsoWeek(),
    picks: parsed.picks ?? [],
    commentary: parsed.commentary ?? '',
    generatedAt: new Date().toISOString(),
  }
}
