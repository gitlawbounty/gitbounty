import { NextResponse } from 'next/server'
import { fetchNodeAgents, bareDid, ageLabel } from '@/lib/gitlawb-node'
import { commonHeaders } from '@/lib/api/serialize'

export const revalidate = 10
export const dynamic = 'force-dynamic'

/**
 * Network-wide agents from node.gitlawb.com/api/v1/agents.
 * Returns the top N most recently registered, with capabilities + trust score.
 *
 * Query params:
 *   ?limit=N     (default 100, max 500)
 *   ?offset=N    (default 0) — for paginating through the full 31k+ agents list
 */
export async function GET(req: Request) {
  const url = new URL(req.url)
  const limit = Math.min(500, Math.max(1, Number(url.searchParams.get('limit') ?? '100')))
  const offset = Math.max(0, Number(url.searchParams.get('offset') ?? '0'))

  const snap = await fetchNodeAgents()

  // Sort newest-registered first
  const sorted = [...snap.agents].sort((a, b) => {
    const at = a.registered_at ? new Date(a.registered_at).getTime() : 0
    const bt = b.registered_at ? new Date(b.registered_at).getTime() : 0
    return bt - at
  })

  const page = sorted.slice(offset, offset + limit).map((a) => ({
    did: bareDid(a.did),
    fullDid: a.did,
    capabilities: a.capabilities ?? [],
    trustScore: a.trust_score,
    registeredAt: a.registered_at,
    registeredAgo: ageLabel(a.registered_at),
    lastSeen: a.last_seen,
    profileUrl: `https://gitlawb.com/${a.did}`,
  }))

  return NextResponse.json(
    {
      agents: page,
      count: page.length,
      totalCount: snap.count,
      offset,
      limit,
      fetchedAt: snap.fetchedAt,
      error: snap.error,
    },
    {
      headers: {
        ...commonHeaders('rpc'),
        'Cache-Control': 's-maxage=10, stale-while-revalidate=60',
      },
    },
  )
}
