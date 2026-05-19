// Cron — auto-tweet new bounties detected on the gitlawb network.
//
// Runs every 30 min (configured in vercel.json). For each cron run:
//   1. Fetch current bounty list from node firehose
//   2. Filter out bounties already tweeted (per local state)
//   3. Optionally rate-limit: skip if more than 3 new bounties (avoid spam — pick top 3 freshest)
//   4. Compose + post tweets
//   5. Mark each as tweeted in state
//
// Auth: requires CRON_SECRET header to match. Vercel cron sets this automatically.

import { NextResponse } from 'next/server'
import { fetchNodeBounties } from '@/lib/gitlawb-node'
import { postTweet } from '@/lib/twitter/client'
import { composeBountyAlert } from '@/lib/twitter/composer'
import { readState, writeState } from '@/lib/twitter/state'
import { commonHeaders } from '@/lib/api/serialize'
import type { OffChainBounty } from '@/lib/scraper/types'
import { bareDid, ageLabel } from '@/lib/gitlawb-node'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

const MAX_TWEETS_PER_RUN = 3

export async function GET(req: Request) {
  // Vercel sets `Authorization: Bearer ${CRON_SECRET}` on scheduled invocations.
  const auth = req.headers.get('authorization') ?? ''
  const expected = `Bearer ${process.env.CRON_SECRET}`
  if (process.env.NODE_ENV === 'production' && auth !== expected) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const runStartedAt = new Date().toISOString()
  const state = await readState()
  const tweetedSet = new Set(state.tweetedBountyIds)

  // ── Fetch bounties from network ──
  const snap = await fetchNodeBounties()
  if (snap.error) {
    return NextResponse.json(
      { ok: false, error: snap.error, postedCount: 0 },
      { headers: commonHeaders('rpc') },
    )
  }

  // Map to off-chain shape (lightweight, reusing existing type)
  const candidates: OffChainBounty[] = snap.bounties.map((b) => ({
    source: 'offchain',
    uuid: b.id,
    title: b.title,
    did: bareDid(b.creator_did ?? ''),
    repoOwner: bareDid(b.repo_owner ?? ''),
    repoName: b.repo_name ?? '',
    amount: `${b.amount} $GITLAWB`,
    amountNumeric: Number(b.amount ?? 0),
    status: (b.status as OffChainBounty['status']) ?? 'unknown',
    ageLabel: ageLabel(b.created_at),
    url: `https://gitlawb.com/bounties/${b.id}`,
    fetchedAt: runStartedAt,
  }))

  // Filter: only freshly created (within last 24 hours) AND not previously tweeted.
  // State tracking prevents re-tweets; the 24h window catches anything we
  // missed during cron downtime + ensures we don't blast tweets for ancient batches.
  const cutoff = Date.now() - 24 * 60 * 60 * 1000
  const fresh = snap.bounties
    .filter((b) => !tweetedSet.has(b.id))
    .filter((b) => new Date(b.created_at).getTime() > cutoff)
    .sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, MAX_TWEETS_PER_RUN)
    .map((b) => candidates.find((c) => c.uuid === b.id))
    .filter((b): b is OffChainBounty => Boolean(b))

  // ── Post each fresh bounty ──
  const results: Array<{
    uuid: string
    posted: boolean
    tweetId?: string
    dryRun: boolean
    error?: string
  }> = []

  for (const b of fresh) {
    const text = composeBountyAlert(b)
    const r = await postTweet(text)
    results.push({
      uuid: b.uuid,
      posted: r.posted,
      tweetId: r.tweetId,
      dryRun: r.dryRun,
      error: r.error,
    })
    // Mark as tweeted on both successful posts AND dry-runs (so we don't
    // re-trigger on each local run while developing).
    if (r.posted || r.dryRun) {
      tweetedSet.add(b.uuid)
    }
  }

  // ── Persist state ──
  await writeState({
    tweetedBountyIds: Array.from(tweetedSet),
    lastBountyCronRunAt: runStartedAt,
    lastPersonaCronRunAt: state.lastPersonaCronRunAt,
  })

  return NextResponse.json(
    {
      ok: true,
      runStartedAt,
      candidatesFound: fresh.length,
      postedCount: results.filter((r) => r.posted || r.dryRun).length,
      results,
    },
    { headers: commonHeaders('rpc') },
  )
}
