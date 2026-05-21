import { describe, it, expect } from 'vitest'
import { signSession, verifySession } from '@/lib/auth/session'

const SECRET = 'test-secret'

describe('session', () => {
  it('round-trips a valid payload', () => {
    const token = signSession({ address: '0xabc', tier: 2, exp: Date.now() + 60000 }, SECRET)
    const v = verifySession(token, SECRET)
    expect(v?.address).toBe('0xabc')
    expect(v?.tier).toBe(2)
  })
  it('rejects a tampered token', () => {
    const token = signSession({ address: '0xabc', tier: 2, exp: Date.now() + 60000 }, SECRET)
    expect(verifySession(token + 'x', SECRET)).toBeNull()
  })
  it('rejects an expired token', () => {
    const token = signSession({ address: '0xabc', tier: 2, exp: Date.now() - 1 }, SECRET)
    expect(verifySession(token, SECRET)).toBeNull()
  })
  it('rejects a wrong secret', () => {
    const token = signSession({ address: '0xabc', tier: 1, exp: Date.now() + 60000 }, SECRET)
    expect(verifySession(token, 'other')).toBeNull()
  })
  it('rejects a validly-signed token with an out-of-range tier', () => {
    // sign a structurally valid token but with tier 7 (cast through unknown)
    const bad = signSession({ address: '0xabc', tier: 7 as unknown as 0, exp: Date.now() + 60000 }, SECRET)
    expect(verifySession(bad, SECRET)).toBeNull()
  })
  it('rejects a validly-signed token with empty address', () => {
    const bad = signSession({ address: '', tier: 1, exp: Date.now() + 60000 }, SECRET)
    expect(verifySession(bad, SECRET)).toBeNull()
  })
  it('rejects a token with no delimiter', () => {
    expect(verifySession('garbage', SECRET)).toBeNull()
  })
})
