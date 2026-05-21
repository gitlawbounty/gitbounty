import { createHmac, timingSafeEqual } from 'node:crypto'
import type { Tier } from '@/lib/token/tier'

export interface SessionPayload {
  address: string
  tier: Tier
  exp: number // ms epoch
}

function b64url(s: string): string {
  return Buffer.from(s).toString('base64url')
}
function hmac(data: string, secret: string): string {
  return createHmac('sha256', secret).update(data).digest('base64url')
}

/** token = base64url(json).base64url(hmac) */
export function signSession(payload: SessionPayload, secret: string): string {
  const body = b64url(JSON.stringify(payload))
  return `${body}.${hmac(body, secret)}`
}

export function verifySession(token: string, secret: string): SessionPayload | null {
  const [body, sig] = token.split('.')
  if (!body || !sig) return null
  const expected = hmac(body, secret)
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString()) as SessionPayload
    if (typeof payload.exp !== 'number' || payload.exp < Date.now()) return null
    if (typeof payload.address !== 'string' || payload.address.length === 0) return null
    if (payload.tier !== 0 && payload.tier !== 1 && payload.tier !== 2) return null
    return payload
  } catch {
    return null
  }
}
