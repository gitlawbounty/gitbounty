import { describe, it, expect } from 'vitest'
import { computeReputation } from '@/lib/persona-dao/reputation'

describe('computeReputation', () => {
  it('returns zeros for no picks', () => {
    const r = computeReputation('oracle', [])
    expect(r.totalPicks).toBe(0)
    expect(r.weightedScore).toBe(0)
    expect(r.completionRate).toBe(0)
    expect(r.displayScore).toBe(33) // (0 + 0.5)/1.5*100 rounded
  })

  it('scores a perfect record at 100', () => {
    const r = computeReputation('oracle', [
      { currentStatus: 'completed', confidence: 1 },
      { currentStatus: 'completed', confidence: 1 },
    ])
    expect(r.weightedScore).toBeCloseTo(1.0)
    expect(r.completionRate).toBe(1)
    expect(r.displayScore).toBe(100)
  })

  it('computes completion rate independent of confidence', () => {
    const r = computeReputation('wager', [
      { currentStatus: 'completed', confidence: 0.2 },
      { currentStatus: 'open', confidence: 0.9 },
    ])
    expect(r.completionRate).toBe(0.5)
    expect(r.totalPicks).toBe(2)
  })

  it('clamps a fully-cancelled record to displayScore 0', () => {
    const r = computeReputation('aurora', [
      { currentStatus: 'cancelled', confidence: 1 },
    ])
    expect(r.weightedScore).toBeCloseTo(-0.5)
    expect(r.displayScore).toBe(0)
  })
})
