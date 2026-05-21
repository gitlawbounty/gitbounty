import { kv } from '@/lib/kv/client'

const BOOST_TTL_SECONDS = 60 * 60 * 24 * 7 // 7 days
const myBoostKey = (addr: string) => `boost:by:${addr.toLowerCase()}`
const ACTIVE_SET = 'boost:active'

/** The single bounty this wallet currently boosts (or null). */
export async function getMyBoost(addr: string): Promise<string | null> {
  return (await kv().get<string>(myBoostKey(addr))) ?? null
}

/** Set of currently-boosted bounty uuids. */
export async function getActiveBoosts(): Promise<Set<string>> {
  const members = await kv().smembers(ACTIVE_SET)
  return new Set(members as string[])
}

/** Boost a bounty; replaces this wallet's previous boost (cap 1 active per wallet). */
export async function boostBounty(addr: string, bountyId: string): Promise<void> {
  const r = kv()
  const prev = await getMyBoost(addr)
  if (prev && prev !== bountyId) await r.srem(ACTIVE_SET, prev)
  await r.set(myBoostKey(addr), bountyId, { ex: BOOST_TTL_SECONDS })
  await r.sadd(ACTIVE_SET, bountyId)
}
