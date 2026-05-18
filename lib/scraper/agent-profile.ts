import type { OffChainBounty } from './types'

export interface AgentRepo {
  name: string
  branch: string
  ageLabel: string
  description: string
}

export interface AgentProfile {
  did: string                       // full or short did, as provided
  didDocument: string | null        // raw json-ld string if found
  shortName: string                 // first 8 chars typically
  trustScore: number                // 0..1
  level: string                     // "maintainer", "unknown", etc.
  pushes: number
  repoCount: number
  repos: AgentRepo[]
  fetchedAt: string
  error?: string
}

const DID_SUFFIX_RE = /^[A-Za-z0-9_-]{20,}$/

function pickNumber(html: string, label: RegExp): number {
  const match = html.match(label)
  if (!match) return 0
  const n = Number.parseFloat(match[1].replace(/,/g, ''))
  return Number.isFinite(n) ? n : 0
}

function pickText(html: string, regex: RegExp): string {
  const match = html.match(regex)
  return match ? match[1].trim() : ''
}

/**
 * Parse a gitlawb.com agent profile HTML. Tolerant to layout shifts.
 *
 * The page exposes: trust score (0..1), level keyword, pushes count, repo count,
 * a list of repos with name + branch + age. We grab them via best-effort regex.
 */
export function parseAgentProfileHtml(html: string, didOrShort: string): AgentProfile {
  // Trust score appears as "Trust Score: 1.00" or similar
  const trustScore = (() => {
    const m = html.match(/trust\s*score[^\d]*([\d.]+)/i)
    return m ? Number.parseFloat(m[1]) : 0
  })()

  // Level: maintainer / unknown / contributor / etc — usually shown near trust score
  const level = pickText(html, /level[^a-zA-Z]+([a-zA-Z_-]+)/i) || 'unknown'

  // Pushes / repo count — typically shown as "102 pushes", "9 repos"
  const pushes = pickNumber(html, /(\d[\d,]*)\s*push/i)
  const repoCount = pickNumber(html, /(\d[\d,]*)\s*repo/i)

  // DID document JSON — sometimes embedded
  const didDocMatch = html.match(
    /(\{\s*"@context"[\s\S]+?Ed25519VerificationKey2020[\s\S]+?\})/i,
  )
  const didDocument = didDocMatch ? didDocMatch[1] : null

  // Repos: try to find list items containing "main" branch markers
  const repos: AgentRepo[] = []
  const repoCardRe = /<a[^>]*href="\/repos\/[^"]*"[^>]*>([\s\S]*?)<\/a>/gi
  let rm: RegExpExecArray | null
  while ((rm = repoCardRe.exec(html)) !== null) {
    const text = rm[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    if (!text) continue
    // crude pull: first chunk is name, "main" branch, "33d ago"
    const ageMatch = text.match(/(\d+\s*[mhd])\s*ago/i)
    repos.push({
      name: text.split(/\s+main\s+/i)[0].slice(0, 80) || 'unknown',
      branch: 'main',
      ageLabel: ageMatch ? `${ageMatch[1]} ago` : '',
      description: text.slice(0, 200),
    })
  }

  // Short label: first 8 chars of the suffix
  const cleanDid = didOrShort.replace(/^did:[^:]+:/, '')
  const shortName = cleanDid.slice(0, 8)

  return {
    did: didOrShort,
    didDocument,
    shortName,
    trustScore,
    level,
    pushes,
    repoCount,
    repos,
    fetchedAt: new Date().toISOString(),
  }
}

/** Fetch profile from gitlawb.com/{did}. */
export async function fetchAgentProfile(didOrShort: string): Promise<AgentProfile> {
  const clean = didOrShort.replace(/^did:[^:]+:/, '')
  if (!DID_SUFFIX_RE.test(clean)) {
    return {
      did: didOrShort,
      didDocument: null,
      shortName: clean.slice(0, 8),
      trustScore: 0,
      level: 'unknown',
      pushes: 0,
      repoCount: 0,
      repos: [],
      fetchedAt: new Date().toISOString(),
      error: 'invalid did format',
    }
  }
  try {
    const res = await fetch(`https://gitlawb.com/${clean}`, {
      headers: {
        'User-Agent': 'gitbounty-terminal/0.1 (+https://github.com/Gitlawbounty)',
        Accept: 'text/html',
      },
      next: { revalidate: 600 }, // 10 min upstream cache
    })
    if (!res.ok) {
      return {
        did: didOrShort,
        didDocument: null,
        shortName: clean.slice(0, 8),
        trustScore: 0,
        level: 'unknown',
        pushes: 0,
        repoCount: 0,
        repos: [],
        fetchedAt: new Date().toISOString(),
        error: `upstream ${res.status}`,
      }
    }
    const html = await res.text()
    return parseAgentProfileHtml(html, didOrShort)
  } catch (err) {
    return {
      did: didOrShort,
      didDocument: null,
      shortName: clean.slice(0, 8),
      trustScore: 0,
      level: 'unknown',
      pushes: 0,
      repoCount: 0,
      repos: [],
      fetchedAt: new Date().toISOString(),
      error: String(err).slice(0, 200),
    }
  }
}

/** Helpers for derived "achievements" from bounty data + profile data. */
export function deriveBadges(
  profile: AgentProfile,
  bounties: OffChainBounty[],
  onChainEarnings: bigint,
  onChainCompleted: bigint,
): string[] {
  const badges: string[] = []
  if (profile.trustScore >= 1) badges.push('◆ trusted maintainer')
  if (profile.pushes >= 100) badges.push('▲ 100+ pushes')
  if (profile.pushes >= 1000) badges.push('★ 1k+ pushes')
  if (profile.repoCount >= 5) badges.push('◇ multi-repo')
  if (profile.repoCount >= 20) badges.push('✦ prolific builder')
  if (onChainCompleted > 0n) badges.push('● first claim')
  if (onChainCompleted >= 10n) badges.push('●● 10 completed')
  if (onChainCompleted >= 100n) badges.push('●●● 100 completed')
  if (onChainEarnings > 1_000_000n * 10n ** 18n) badges.push('💰 1m+ $gitlawb earner')
  const claimed = bounties.filter((b) => b.did.startsWith(profile.did.slice(0, 12))).length
  if (claimed >= 5) badges.push('◯ active hunter')
  return badges
}
