import type { OffChainBounty, OffChainStatus, ScrapedBountySnapshot } from './types'
import { fetchNodeBounties, bareDid, ageLabel, type NodeBounty } from '@/lib/gitlawb-node'

const BOUNTIES_URL = 'https://gitlawb.com/bounties'

/** Map a NodeBounty (from the gitlawb node JSON API) to our OffChainBounty shape. */
function nodeToOffChain(b: NodeBounty, fetchedAt: string): OffChainBounty {
  const status: OffChainStatus = STATUSES.includes(b.status as OffChainStatus)
    ? (b.status as OffChainStatus)
    : 'unknown'
  const amountNumeric = Number(b.amount ?? 0)
  return {
    source: 'offchain',
    uuid: b.id,
    title: b.title,
    did: bareDid(b.creator_did ?? ''),
    repoOwner: bareDid(b.repo_owner ?? ''),
    repoName: b.repo_name ?? '',
    amount: `${amountNumeric.toLocaleString('en-US')} $GITLAWB`,
    amountNumeric,
    status,
    ageLabel: ageLabel(b.created_at),
    url: `https://gitlawb.com/bounties/${b.id}`,
    fetchedAt,
  }
}

const STATUSES: OffChainStatus[] = [
  'open',
  'claimed',
  'submitted',
  'completed',
  'cancelled',
  'disputed',
]

const UUID_REGEX = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i

/** Parse "100,000 $GITLAWB" -> 100000.  Returns 0 if unparseable. */
function parseAmount(raw: string): number {
  const match = raw.match(/([\d.,]+)\s*\$?gitlawb/i)
  if (!match) return 0
  const cleaned = match[1].replace(/,/g, '')
  const n = Number.parseFloat(cleaned)
  return Number.isFinite(n) ? n : 0
}

/** Pick the first known status keyword from a string blob. */
function pickStatus(blob: string): OffChainStatus {
  const lower = blob.toLowerCase()
  for (const s of STATUSES) {
    if (lower.includes(s)) return s
  }
  return 'unknown'
}

/**
 * Split a DID/repo identifier like "z6Mk.../my-repo-name" into parts.
 * Returns ['', ''] if unparseable.
 */
function splitDidRepo(blob: string): [string, string] {
  const match = blob.match(/(z6Mk[A-Za-z0-9]+)\/([\w\-./]+)/)
  if (!match) return ['', '']
  return [match[1], match[2]]
}

/**
 * Parse the gitlawb.com /bounties page HTML and extract bounty entries.
 *
 * Strategy:
 *  - Match anchor tags pointing at /bounties/{uuid}
 *  - For each match, capture the surrounding block (~800 chars)
 *  - Pull out the title, did/repo, amount, status, age from that block
 *
 * Resilient to minor layout changes: we don't rely on specific class names,
 * just the presence of /bounties/{uuid} hrefs and obvious string anchors
 * (z6Mk*, $GITLAWB, status words, "Xd ago").
 */
export function parseBountiesHtml(html: string): OffChainBounty[] {
  const results: OffChainBounty[] = []
  const seen = new Set<string>()

  // Match every anchor referencing /bounties/{uuid}, capture context.
  const anchorRe = new RegExp(
    `<a[^>]*href="(/bounties/${UUID_REGEX.source})"[^>]*>([\\s\\S]*?)</a>`,
    'gi',
  )

  let match: RegExpExecArray | null
  while ((match = anchorRe.exec(html)) !== null) {
    const [, href, inner] = match
    const uuid = href.replace('/bounties/', '')
    if (seen.has(uuid)) continue
    seen.add(uuid)

    // Strip HTML tags from the inner block to make text parsing simpler.
    const text = inner
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ')
      .trim()

    if (!text) continue

    const [did, repoPart] = splitDidRepo(text)
    const repoSplit = repoPart.split('/')
    const repoOwner = did
    const repoName = repoSplit[0] ?? ''

    // Title: prefer the prefix before the DID block. Fallback to full text.
    const didIdx = did ? text.indexOf(did) : -1
    let title = didIdx > 0 ? text.slice(0, didIdx).trim() : text
    title = title.replace(/\s+\d+[hmds]?d?\s*ago.*$/, '').trim()
    title = title.replace(/\s+[\d,.]+\s*\$gitlawb.*$/i, '').trim()
    if (!title) title = text.slice(0, 80)

    const ageMatch = text.match(/(\d+\s*[mhd])\s*ago/i)
    const ageLabel = ageMatch ? `${ageMatch[1]} ago` : ''

    const amountMatch = text.match(/([\d,.]+\s*\$gitlawb)/i)
    const amount = amountMatch ? amountMatch[1].toUpperCase().replace(/\$gitlawb/i, '$GITLAWB') : ''
    const amountNumeric = parseAmount(amount)

    results.push({
      source: 'offchain',
      uuid,
      title: title.slice(0, 200),
      did,
      repoOwner,
      repoName,
      amount,
      amountNumeric,
      status: pickStatus(text),
      ageLabel,
      url: `https://gitlawb.com/bounties/${uuid}`,
      fetchedAt: new Date().toISOString(),
    })
  }

  return results
}

/**
 * Fetch off-chain bounties. Prefers the official JSON API at node.gitlawb.com,
 * falls back to scraping gitlawb.com/bounties HTML if the node is unreachable.
 *
 * The JSON path is the same source @Gitlawbterminal uses — full firehose with
 * real timestamps, claimant DIDs, and structured status. HTML scrape stays as
 * a safety net so the site stays alive if the node API ever goes down.
 */
export async function fetchOffChainBounties(): Promise<ScrapedBountySnapshot> {
  const fetchedAt = new Date().toISOString()

  // ── Primary: node.gitlawb.com/api/v1/bounties ──
  const nodeSnap = await fetchNodeBounties()
  if (!nodeSnap.error && nodeSnap.bounties.length > 0) {
    return {
      bounties: nodeSnap.bounties.map((b) => nodeToOffChain(b, fetchedAt)),
      fetchedAt,
      source: 'gitlawb.com',
      count: nodeSnap.bounties.length,
    }
  }

  // ── Fallback: HTML scrape ──
  try {
    const res = await fetch(BOUNTIES_URL, {
      headers: {
        'User-Agent': 'gitbounty-terminal/0.1 (+https://github.com/Gitlawbounty)',
        Accept: 'text/html',
      },
      next: { revalidate: 300 },
    })
    if (!res.ok) {
      return {
        bounties: [],
        fetchedAt,
        source: 'gitlawb.com',
        count: 0,
        error: nodeSnap.error ?? `upstream ${res.status}`,
      }
    }
    const html = await res.text()
    const bounties = parseBountiesHtml(html)
    return {
      bounties,
      fetchedAt,
      source: 'gitlawb.com',
      count: bounties.length,
    }
  } catch (err) {
    return {
      bounties: [],
      fetchedAt,
      source: 'gitlawb.com',
      count: 0,
      error: nodeSnap.error ?? String(err).slice(0, 200),
    }
  }
}
