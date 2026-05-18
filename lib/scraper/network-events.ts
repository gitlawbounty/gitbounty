// Scrape gitlawb.com/node/events — the real-time network event stream.
// Each entry is a "ref-update" (commit push) with did/repo + commit hash + timestamp.

export interface NetworkEvent {
  source: 'gitlawb-network'
  kind: 'ref-update' // commit push
  did: string
  repoName: string
  commitHash: string
  ageLabel: string
  fetchedAt: string
}

const FEED_URL = 'https://gitlawb.com/node/events'

/**
 * Parse gitlawb.com/node/events HTML and extract events.
 *
 * The page lists ref-update events with `did/repo · short-hash · X ago` format.
 * We match repo identifiers (z6Mk...) followed by a commit hash and timestamp.
 */
export function parseNetworkEventsHtml(html: string): NetworkEvent[] {
  const results: NetworkEvent[] = []
  const now = new Date().toISOString()

  // Strip tags to plain text for simpler regex matching
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')

  // Match patterns: "z6Mk{key}/{repo} ... {hash} ... {N}{unit} ago"
  // The page sometimes interleaves entries, so we use a lenient pattern.
  const re =
    /(z6Mk[A-Za-z0-9]{20,})\/([\w\-./]+)\s+([0-9a-f]{6,12})\s+(\d+\s*[smhd]|m)\s*ago/gi

  let m: RegExpExecArray | null
  const seen = new Set<string>()
  while ((m = re.exec(text)) !== null) {
    const did = m[1]
    const repoName = m[2].split('/')[0]
    const commitHash = m[3]
    const ageLabel = m[4].includes('m') && !/\d/.test(m[4]) ? '1m' : m[4]
    const key = `${did}-${repoName}-${commitHash}`
    if (seen.has(key)) continue
    seen.add(key)
    results.push({
      source: 'gitlawb-network',
      kind: 'ref-update',
      did,
      repoName,
      commitHash,
      ageLabel: `${ageLabel} ago`,
      fetchedAt: now,
    })
  }

  // Also handle "m ago" (less than 1 minute) — match short separated form
  const shortRe =
    /(z6Mk[A-Za-z0-9]{20,})\/([\w\-./]+)\s+([0-9a-f]{6,12})\s+m\s*ago/gi
  while ((m = shortRe.exec(text)) !== null) {
    const did = m[1]
    const repoName = m[2].split('/')[0]
    const commitHash = m[3]
    const key = `${did}-${repoName}-${commitHash}`
    if (seen.has(key)) continue
    seen.add(key)
    results.push({
      source: 'gitlawb-network',
      kind: 'ref-update',
      did,
      repoName,
      commitHash,
      ageLabel: '<1m ago',
      fetchedAt: now,
    })
  }

  return results
}

export interface NetworkEventsSnapshot {
  events: NetworkEvent[]
  count: number
  fetchedAt: string
  error?: string
}

export async function fetchNetworkEvents(): Promise<NetworkEventsSnapshot> {
  const fetchedAt = new Date().toISOString()
  try {
    const res = await fetch(FEED_URL, {
      headers: {
        'User-Agent': 'gitbounty-terminal/0.1 (+https://github.com/Gitlawbounty)',
        Accept: 'text/html',
      },
      next: { revalidate: 60 },
    })
    if (!res.ok) {
      return { events: [], count: 0, fetchedAt, error: `upstream ${res.status}` }
    }
    const html = await res.text()
    const events = parseNetworkEventsHtml(html)
    return { events, count: events.length, fetchedAt }
  } catch (err) {
    return { events: [], count: 0, fetchedAt, error: String(err).slice(0, 200) }
  }
}
