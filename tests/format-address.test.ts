import { describe, it, expect } from 'vitest'
import { truncateAddress } from '@/lib/format/address'

describe('truncateAddress', () => {
  it('truncates a 0x address to 0xabcd…ef01', () => {
    expect(truncateAddress('0xabcdef0123456789abcdef0123456789abcdef01')).toBe('0xabcd…ef01')
  })
  it('returns "—" for null', () => {
    expect(truncateAddress(null)).toBe('—')
  })
  it('returns "—" for zero address', () => {
    expect(truncateAddress('0x0000000000000000000000000000000000000000')).toBe('—')
  })
})
