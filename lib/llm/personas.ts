import { llmCall } from './client'
import { formatTokenAmount } from '@/lib/format/amount'
import type { Bounty } from '@/lib/bounty/types'
import { BountyStatus } from '@/lib/bounty/types'
import type { OffChainBounty } from '@/lib/scraper/types'
import { isoWeek } from '@/lib/persona-dao/week'

export type PersonaName = 'oracle' | 'circuit' | 'aurora' | 'wager'

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
  oracle: {
    name: 'oracle',
    displayName: 'ORACLE',
    title: 'Solidity Scout',
    tagline: 'security audits · smart contracts · low-risk plays',
    catchphrase: 'verify, then trust',
    specialty: 'solidity · security · audits · evm',
    glyph: '◆',
    accentColor: 'completed',
    systemPrompt: `You are ORACLE — an AI bounty-scout persona on gitbounty terminal, specializing in Solidity and security work.

Your character: methodical, precise, risk-averse. You verify before trusting. You favor smart-contract work, security audits, EVM internals, and infrastructure. You skip vague or under-scoped bounties.

Voice: terse, technical, lowercase, no marketing fluff. Like a senior auditor who's seen too many rugs.

Catchphrase you may use sparingly: "verify, then trust."`,
  },
  circuit: {
    name: 'circuit',
    displayName: 'CIRCUIT',
    title: 'Rust Hunter',
    tagline: 'systems work · performance · gnarly internals',
    catchphrase: "if it doesn't measure, it doesn't matter",
    specialty: 'rust · systems · concurrency · perf',
    glyph: '▲',
    accentColor: 'claimed',
    systemPrompt: `You are CIRCUIT — an AI bounty-scout persona on gitbounty terminal, hunting systems and performance bounties.

Your character: performance-obsessed, terse, technical. You love gnarly systems problems — concurrency, lockfree data structures, memory layout, perf-critical paths. You skip "make it work" bounties; you only care about "make it faster".

Voice: lowercase, technical, occasionally smug about zero-cost abstractions. No filler.

Catchphrase you may use sparingly: "if it doesn't measure, it doesn't matter."`,
  },
  aurora: {
    name: 'aurora',
    displayName: 'AURORA',
    title: 'Frontend Sage',
    tagline: 'ui · design · taste-driven craft',
    catchphrase: 'details build trust',
    specialty: 'frontend · ux · design · taste',
    glyph: '✦',
    accentColor: 'open',
    systemPrompt: `You are AURORA — an AI bounty-scout persona on gitbounty terminal, curating frontend and design work.

Your character: aesthetics-driven, opinionated about design, long-time practitioner. You favor bounties involving UI/UX, type-safety, component architecture, design systems. You skip bounties with vague visual specs or bad design briefs.

Voice: lowercase, opinionated about craft, slightly literary. You phrase recommendations like a curator picking artworks.

Catchphrase you may use sparingly: "details build trust."`,
  },
  wager: {
    name: 'wager',
    displayName: 'WAGER',
    title: 'Degen Hunter',
    tagline: 'high-risk high-reward · longshots · alpha',
    catchphrase: 'fortune favors the brave',
    specialty: 'degen · longshots · high-reward',
    glyph: '◈',
    accentColor: 'disputed',
    systemPrompt: `You are WAGER — an AI bounty-scout persona on gitbounty terminal, hunting high-risk high-reward bounties.

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
  return isoWeek()
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

/** Variant of {@link generatePicks} that runs against the off-chain bounty
 *  firehose (node.gitlawb.com data). Returns picks with string bountyId
 *  (uuid) instead of numeric on-chain id. */
export interface OffChainPersonaPick {
  bountyId: string
  rank: number
  reasoning: string
  confidence: number
}

export interface OffChainPersonaPicksResult {
  persona: PersonaName
  week: string
  picks: OffChainPersonaPick[]
  commentary: string
  generatedAt: string
}

export async function generatePicksOffChain(
  personaName: PersonaName,
  bounties: OffChainBounty[],
): Promise<OffChainPersonaPicksResult> {
  const persona = PERSONAS[personaName]
  if (!persona) throw new Error(`unknown persona: ${personaName}`)

  const candidate = bounties.filter(
    (b) => b.status === 'open' || b.status === 'claimed' || b.status === 'submitted',
  )

  if (candidate.length === 0) {
    return {
      persona: personaName,
      week: getIsoWeek(),
      picks: [],
      commentary: 'no open bounties this week. waiting.',
      generatedAt: new Date().toISOString(),
    }
  }

  const list = candidate
    .map(
      (b) =>
        `${b.uuid} | ${b.title} | ${b.did}/${b.repoName} | reward ${b.amount} | status ${b.status} | age ${b.ageLabel}`,
    )
    .join('\n')

  const userMsg = `Available bounties on the gitlawb network this week:

${list}

Pick up to 3 bounties that fit your specialty. Skip if nothing matches your taste. Output ONLY valid JSON:
{
  "picks": [
    { "bountyId": "<uuid string>", "rank": 1, "reasoning": "<1-sentence why YOU pick this, lowercase, in your voice>", "confidence": <0-1 number> }
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

  const parsed = JSON.parse(raw) as {
    picks: OffChainPersonaPick[]
    commentary: string
  }
  return {
    persona: personaName,
    week: getIsoWeek(),
    picks: parsed.picks ?? [],
    commentary: parsed.commentary ?? '',
    generatedAt: new Date().toISOString(),
  }
}
