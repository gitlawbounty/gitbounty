import { describe, it, expect } from 'vitest'
import { timeAgo, deadlineRemaining } from '@/lib/format/time'

describe('timeAgo', () => {
  it('formats seconds', () => {
    const now = Math.floor(Date.now() / 1000)
    expect(timeAgo(BigInt(now - 30))).toMatch(/30s/)
  })
  it('formats minutes', () => {
    const now = Math.floor(Date.now() / 1000)
    expect(timeAgo(BigInt(now - 600))).toMatch(/10m/)
  })
  it('formats hours', () => {
    const now = Math.floor(Date.now() / 1000)
    expect(timeAgo(BigInt(now - 7200))).toMatch(/2h/)
  })
  it('formats days', () => {
    const now = Math.floor(Date.now() / 1000)
    expect(timeAgo(BigInt(now - 86400 * 3))).toMatch(/3d/)
  })
  it('handles zero timestamp', () => {
    expect(timeAgo(0n)).toBe('—')
  })
})

describe('deadlineRemaining', () => {
  it('returns "—" when not yet claimed', () => {
    expect(deadlineRemaining(0n, 604800n)).toBe('—')
  })
  it('returns "expired" when deadline has passed', () => {
    const past = BigInt(Math.floor(Date.now() / 1000) - 800_000)
    expect(deadlineRemaining(past, 604800n)).toBe('expired')
  })
  it('formats days remaining', () => {
    const now = BigInt(Math.floor(Date.now() / 1000))
    expect(deadlineRemaining(now, 604800n)).toMatch(/d left/)
  })
})
