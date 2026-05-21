import { describe, it, expect } from 'vitest'
import { resolveTier } from '@/lib/token/tier'

describe('resolveTier', () => {
  it('is tier 0 below t1', () => {
    expect(resolveTier(0, 100, 1000)).toBe(0)
    expect(resolveTier(99, 100, 1000)).toBe(0)
  })
  it('is tier 1 at or above t1, below t2', () => {
    expect(resolveTier(100, 100, 1000)).toBe(1)
    expect(resolveTier(999, 100, 1000)).toBe(1)
  })
  it('is tier 2 at or above t2', () => {
    expect(resolveTier(1000, 100, 1000)).toBe(2)
    expect(resolveTier(5000, 100, 1000)).toBe(2)
  })
})
