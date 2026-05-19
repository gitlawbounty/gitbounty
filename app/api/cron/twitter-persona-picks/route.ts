// Cron — weekly persona picks tweets.
//
// Runs once a week (Monday 12:00 UTC, configured in vercel.json). For each
// persona (oracle, circuit, aurora, wager):
//   1. Fetch the persona's weekly picks (cached, ~1h TTL)
//   2. Compose a thread: header + top 3 picks
//   3. Post the thread
//
// Auth: requires CRON_SECRET header.

import { NextResponse } from 'next/server'
import { PERSONAS, type PersonaName, generatePicksOffChain } from '@/lib/llm/personas'
import { fetchOffChainBounties } from '@/lib/scraper/gitlawb-scraper'
import { postThread } from '@/lib/twitter/client'
import {
  composePersonaPickHeader,
  composePersonaPick,
  type PersonaPick as TweetPersonaPick,
} from '@/lib/twitter/composer'
import { readState, writeState } from '@/lib/twitter/state'
import { commonHeaders } from '@/lib/api/serialize'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const PICKS_PER_THREAD = 3

export async function GET(req: Request) {
  const auth = req.headers.get('authorization') ?? ''
  const expected = `Bearer ${process.env.CRON_SECRET}`
  if (process.env.NODE_ENV === 'production' && auth !== expected) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const runStartedAt = new Date().toISOString()

  // Optional ?only=oracle to test a single persona
  const url = new URL(req.url)
  const only = url.searchParams.get('only') as PersonaName | null

  const personas: PersonaName[] = only
    ? [only]
    : (Object.keys(PERSONAS) as PersonaName[])

  // Fetch bounties once and reuse for each persona
  const bountiesSnap = await fetchOffChainBounties()
  if (bountiesSnap.bounties.length === 0) {
    return NextResponse.json(
      { ok: false, error: 'no bounties available for picks', threads: [] },
      { headers: commonHeaders('rpc') },
    )
  }

  const threadResults: Array<{
    persona: PersonaName
    tweetsAttempted: number
    tweetsPosted: number
    error?: string
  }> = []

  for (const name of personas) {
    let picksResult
    try {
      picksResult = await generatePicksOffChain(name, bountiesSnap.bounties)
    } catch (err) {
      threadResults.push({
        persona: name,
        tweetsAttempted: 0,
        tweetsPosted: 0,
        error: String(err).slice(0, 200),
      })
      continue
    }

    const top = picksResult.picks.slice(0, PICKS_PER_THREAD)
    if (top.length === 0) {
      threadResults.push({
        persona: name,
        tweetsAttempted: 0,
        tweetsPosted: 0,
        error: 'no picks returned by llm',
      })
      continue
    }

    // Build thread: header + each pick
    const header = composePersonaPickHeader(name)
    const tweets = [
      header,
      ...top.map((p, i) => {
        // Look up bounty info for amount + display
        const bounty = bountiesSnap.bounties.find((b) => b.uuid === p.bountyId)
        const pick: TweetPersonaPick = {
          bountyTitle: bounty?.title ?? `bounty #${p.bountyId}`,
          bountyAmount: bounty?.amount ?? '— $GITLAWB',
          bountyId: p.bountyId,
          reasoning: p.reasoning,
        }
        return composePersonaPick(name, pick, i + 1, top.length)
      }),
    ]

    const results = await postThread(tweets)
    const posted = results.filter((r) => r.posted || r.dryRun).length

    threadResults.push({
      persona: name,
      tweetsAttempted: tweets.length,
      tweetsPosted: posted,
      error: results.find((r) => r.error)?.error,
    })
  }

  // Persist last-run timestamp
  const state = await readState()
  await writeState({
    ...state,
    lastPersonaCronRunAt: runStartedAt,
  })

  return NextResponse.json(
    { ok: true, runStartedAt, threadResults },
    { headers: commonHeaders('rpc') },
  )
}
