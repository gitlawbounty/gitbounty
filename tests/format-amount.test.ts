import { describe, it, expect } from 'vitest'
import { formatTokenAmount, formatTokenAmountWithSymbol } from '@/lib/format/amount'

describe('formatTokenAmount', () => {
  it('formats whole tokens with thousand separators', () => {
    expect(formatTokenAmount(500_000n * 10n ** 18n, 18)).toBe('500,000')
  })
  it('formats fractional tokens', () => {
    expect(formatTokenAmount(15n * 10n ** 17n, 18)).toBe('1.5')
  })
  it('formats large numbers', () => {
    expect(formatTokenAmount(2_450_000n * 10n ** 18n, 18)).toBe('2,450,000')
  })
  it('handles zero', () => {
    expect(formatTokenAmount(0n, 18)).toBe('0')
  })
})

describe('formatTokenAmountWithSymbol', () => {
  it('appends symbol', () => {
    expect(formatTokenAmountWithSymbol(500_000n * 10n ** 18n, 18, '$GITLAWB')).toBe('500,000 $GITLAWB')
  })
})
