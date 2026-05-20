import { describe, it, expect } from 'vitest'
import { voterHash } from '@/lib/persona-dao/voter'

describe('voterHash', () => {
  it('is deterministic for the same ip + ua', () => {
    expect(voterHash('1.2.3.4', 'Mozilla')).toBe(voterHash('1.2.3.4', 'Mozilla'))
  })
  it('differs for different ips', () => {
    expect(voterHash('1.2.3.4', 'Mozilla')).not.toBe(voterHash('5.6.7.8', 'Mozilla'))
  })
  it('returns a short hex digest', () => {
    expect(voterHash('1.2.3.4', 'Mozilla')).toMatch(/^[0-9a-f]{16}$/)
  })
  it('differs for different user agents on the same ip', () => {
    expect(voterHash('1.2.3.4', 'Mozilla')).not.toBe(voterHash('1.2.3.4', 'Chrome'))
  })
})
