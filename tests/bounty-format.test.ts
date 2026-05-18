import { describe, it, expect } from 'vitest'
import { BountyStatus } from '@/lib/bounty/types'
import { statusToLabel, statusGlyph, statusColorClass } from '@/lib/bounty/format'

describe('statusToLabel', () => {
  it.each([
    [BountyStatus.Open, 'open'],
    [BountyStatus.Claimed, 'claimed'],
    [BountyStatus.Submitted, 'submitted'],
    [BountyStatus.Completed, 'completed'],
    [BountyStatus.Cancelled, 'cancelled'],
    [BountyStatus.Disputed, 'disputed'],
  ] as const)('maps %i to %s', (status, label) => {
    expect(statusToLabel(status)).toBe(label)
  })
})

describe('statusGlyph', () => {
  it('returns correct glyphs', () => {
    expect(statusGlyph(BountyStatus.Open)).toBe('◉')
    expect(statusGlyph(BountyStatus.Claimed)).toBe('◎')
    expect(statusGlyph(BountyStatus.Submitted)).toBe('◎')
    expect(statusGlyph(BountyStatus.Completed)).toBe('✓')
    expect(statusGlyph(BountyStatus.Cancelled)).toBe('✗')
    expect(statusGlyph(BountyStatus.Disputed)).toBe('⚠')
  })
})

describe('statusColorClass', () => {
  it('returns Tailwind class for status', () => {
    expect(statusColorClass(BountyStatus.Open)).toBe('text-status-open')
    expect(statusColorClass(BountyStatus.Disputed)).toBe('text-status-disputed')
  })
})
