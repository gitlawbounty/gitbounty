import { describe, it, expect } from 'vitest'
import { voteWeight } from '@/lib/persona-dao/vote-weight'

describe('voteWeight', () => {
  it('is 0 for no balance', () => {
    expect(voteWeight(0)).toBe(0)
  })
  it('dampens with sqrt (floored)', () => {
    expect(voteWeight(100)).toBe(10)
    expect(voteWeight(10000)).toBe(100)
    expect(voteWeight(2)).toBe(1)
  })
  it('treats negative or non-finite as 0', () => {
    expect(voteWeight(-5)).toBe(0)
    expect(voteWeight(NaN)).toBe(0)
  })
})
