import { kv } from '@/lib/kv/client'
import type { PickSnapshot, OutcomeRecord, PersonaName } from './types'

const VOTE_TTL_SECONDS = 60 * 60 * 24 * 8 // 8 days (covers a week + slack)

const pickKey = (week: string, persona: PersonaName) => `picks:${week}:${persona}`
const outcomeKey = (week: string, persona: PersonaName) => `outcome:${week}:${persona}`
const votesKey = (week: string, persona: PersonaName) => `votes:${week}:${persona}`
const voteFlagKey = (week: string, persona: PersonaName, voter: string) =>
  `vote:${week}:${persona}:${voter}`
const weeksKey = (persona: PersonaName) => `weeks:${persona}`

export async function savePickSnapshot(snap: PickSnapshot): Promise<void> {
  const r = kv()
  await r.set(pickKey(snap.week, snap.persona), snap)
  await r.sadd(weeksKey(snap.persona), snap.week)
}

export async function getPickSnapshot(
  week: string,
  persona: PersonaName,
): Promise<PickSnapshot | null> {
  return (await kv().get<PickSnapshot>(pickKey(week, persona))) ?? null
}

export async function listWeeks(persona: PersonaName): Promise<string[]> {
  const weeks = await kv().smembers(weeksKey(persona))
  return (weeks as string[]).sort()
}

export async function saveOutcome(rec: OutcomeRecord): Promise<void> {
  await kv().set(outcomeKey(rec.week, rec.persona), rec)
}

export async function getOutcome(
  week: string,
  persona: PersonaName,
): Promise<OutcomeRecord | null> {
  return (await kv().get<OutcomeRecord>(outcomeKey(week, persona))) ?? null
}

export async function getVotes(week: string, persona: PersonaName): Promise<number> {
  return (await kv().get<number>(votesKey(week, persona))) ?? 0
}

/** Record one vote; returns {ok:false} if this voter already voted this week. */
export async function castVote(
  week: string,
  persona: PersonaName,
  voter: string,
): Promise<{ ok: boolean; total: number }> {
  const r = kv()
  // NX set on the dedupe flag; only first vote per voter/week/persona succeeds.
  const set = await r.set(voteFlagKey(week, persona, voter), 1, {
    nx: true,
    ex: VOTE_TTL_SECONDS,
  })
  if (set === null) {
    return { ok: false, total: await getVotes(week, persona) }
  }
  const total = await r.incr(votesKey(week, persona))
  return { ok: true, total }
}
