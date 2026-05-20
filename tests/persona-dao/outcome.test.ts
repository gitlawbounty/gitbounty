import { describe, it, expect } from 'vitest'
import { STATUS_POINTS, scorePick } from '@/lib/persona-dao/outcome'

describe('scorePick', () => {
  it('rewards completed picks fully at confidence 1', () => {
    expect(scorePick('completed', 1)).toBeCloseTo(1.0)
  })
  it('scales by confidence', () => {
    expect(scorePick('completed', 0.5)).toBeCloseTo(0.5)
  })
  it('penalizes cancelled picks', () => {
    expect(scorePick('cancelled', 1)).toBeCloseTo(-0.5)
  })
  it('gives near-zero for still-open picks', () => {
    expect(scorePick('open', 1)).toBeCloseTo(0.1)
  })
  it('treats unknown as zero', () => {
    expect(scorePick('unknown', 1)).toBe(0)
  })
  it('exposes a points table for all statuses', () => {
    expect(STATUS_POINTS.completed).toBe(1)
    expect(STATUS_POINTS.disputed).toBe(-0.3)
  })
})
