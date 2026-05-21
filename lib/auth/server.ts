import { verifySession } from './session'
import type { Tier } from '@/lib/token/tier'

/** Read + verify the gitb_session cookie from a request; returns tier 0 if none/invalid. */
export function getSessionTier(req: Request): { address: string | null; tier: Tier } {
  const cookie = req.headers.get('cookie') ?? ''
  const match = cookie.match(/(?:^|;\s*)gitb_session=([^;]+)/)
  if (!match) return { address: null, tier: 0 }
  const payload = verifySession(decodeURIComponent(match[1]), process.env.AUTH_SECRET ?? 'dev-secret')
  if (!payload) return { address: null, tier: 0 }
  return { address: payload.address, tier: payload.tier }
}
