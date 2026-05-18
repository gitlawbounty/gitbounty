import { NextResponse } from 'next/server'
import { fetchNodeRepos, bareDid, ageLabel } from '@/lib/gitlawb-node'
import { commonHeaders } from '@/lib/api/serialize'

export const revalidate = 30
export const dynamic = 'force-dynamic'

/**
 * Network-wide repos from node.gitlawb.com/api/v1/repos.
 * Sorted by most-recently-updated first so the live feed surfaces fresh activity.
 *
 * Query params:
 *   ?limit=N     (default 100, max 500)
 *   ?offset=N    (default 0)
 *   ?sort=updated|created  (default updated)
 */
export async function GET(req: Request) {
  const url = new URL(req.url)
  const limit = Math.min(500, Math.max(1, Number(url.searchParams.get('limit') ?? '100')))
  const offset = Math.max(0, Number(url.searchParams.get('offset') ?? '0'))
  const sortKey = url.searchParams.get('sort') === 'created' ? 'created_at' : 'updated_at'

  const snap = await fetchNodeRepos()
  const sorted = [...snap.repos].sort((a, b) => {
    const av = a[sortKey] ? new Date(a[sortKey]).getTime() : 0
    const bv = b[sortKey] ? new Date(b[sortKey]).getTime() : 0
    return bv - av
  })

  const page = sorted.slice(offset, offset + limit).map((r) => ({
    id: r.id,
    name: r.name,
    owner: bareDid(r.owner_did),
    fullOwnerDid: r.owner_did,
    description: r.description,
    starCount: r.star_count,
    isPublic: r.is_public,
    defaultBranch: r.default_branch,
    cloneUrl: r.clone_url,
    forkedFrom: r.forked_from,
    createdAt: r.created_at,
    createdAgo: ageLabel(r.created_at),
    updatedAt: r.updated_at,
    updatedAgo: ageLabel(r.updated_at),
    profileUrl: `https://gitlawb.com/${r.owner_did}/${r.name}`,
  }))

  return NextResponse.json(
    {
      repos: page,
      count: page.length,
      totalCount: snap.count,
      offset,
      limit,
      sortBy: sortKey,
      fetchedAt: snap.fetchedAt,
      error: snap.error,
    },
    {
      headers: {
        ...commonHeaders('rpc'),
        'Cache-Control': 's-maxage=30, stale-while-revalidate=120',
      },
    },
  )
}
