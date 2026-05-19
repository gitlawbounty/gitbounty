// Tweet text templates. Each function returns a single tweet string ≤280 chars.

import type { OffChainBounty } from '@/lib/scraper/types'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://gitlawbounty.xyz'

/** Strip "did:key:" prefix for readability. */
function bareDid(did: string): string {
  return did.replace(/^did:[^:]+:/, '')
}

function shortDid(did: string, n = 10): string {
  const bare = bareDid(did)
  return bare.length > n + 4 ? `${bare.slice(0, n)}…` : bare
}

// ────────────────────────────────────────────────────────────
// BOUNTY ALERTS
// ────────────────────────────────────────────────────────────

export function composeBountyAlert(b: OffChainBounty): string {
  const title = b.title.length > 80 ? b.title.slice(0, 77) + '…' : b.title
  const did = shortDid(b.did)
  const amount = b.amount || `${b.amountNumeric} $GITLAWB`

  // Reserve room for URL (~30 chars after Twitter shortening) + line breaks
  const url = `${BASE_URL}/bounty/${b.uuid}`

  return `🆕 new bounty on @gitlawb

"${title}"
${amount} · ${b.status}

posted by ${did}…

→ ${url}`
}

// ────────────────────────────────────────────────────────────
// PERSONA PICKS
// ────────────────────────────────────────────────────────────

const PERSONA_META: Record<string, { glyph: string; name: string; role: string }> = {
  oracle: { glyph: '◆', name: 'ORACLE', role: 'research / data' },
  circuit: { glyph: '▲', name: 'CIRCUIT', role: 'infra / contracts' },
  aurora: { glyph: '✦', name: 'AURORA', role: 'creative / frontend' },
  wager: { glyph: '◈', name: 'WAGER', role: 'risk-on / high payout' },
}

export interface PersonaPick {
  bountyTitle: string
  bountyAmount: string
  bountyId: string
  reasoning: string
}

export function composePersonaPickHeader(personaName: string): string {
  const p = PERSONA_META[personaName.toLowerCase()]
  if (!p) return `weekly bounty picks from a gitbounty persona ↓`

  return `${p.glyph} ${p.name}'s weekly picks are in.

specialty: ${p.role}
→ ${BASE_URL}/personas/${personaName.toLowerCase()}

🧵 top picks below`
}

export function composePersonaPick(
  personaName: string,
  pick: PersonaPick,
  index: number,
  total: number,
): string {
  const p = PERSONA_META[personaName.toLowerCase()]
  const glyph = p?.glyph ?? '●'

  const title = pick.bountyTitle.length > 70 ? pick.bountyTitle.slice(0, 67) + '…' : pick.bountyTitle
  const reasoning =
    pick.reasoning.length > 120 ? pick.reasoning.slice(0, 117) + '…' : pick.reasoning

  return `${index}/${total} ${glyph} ${title}
${pick.bountyAmount}

${reasoning}

→ ${BASE_URL}/bounty/${pick.bountyId}`
}

// ────────────────────────────────────────────────────────────
// NETWORK STATS (weekly hype)
// ────────────────────────────────────────────────────────────

export function composeNetworkStatsTweet(stats: {
  totalAgents: number
  totalRepos: number
  totalBounties: number
  totalReward: number
}): string {
  return `the @gitlawb network this week:

→ ${stats.totalAgents.toLocaleString()} agents
→ ${stats.totalRepos.toLocaleString()} repos
→ ${stats.totalBounties} bounties · ${stats.totalReward.toLocaleString()} $GITLAWB locked

all surfaceable through one CORS-open JSON api.

${BASE_URL}`
}
