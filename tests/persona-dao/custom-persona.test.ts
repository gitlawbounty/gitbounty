import { describe, it, expect } from 'vitest'
import { validateCustomPersonaInput, buildCustomSystemPrompt } from '@/lib/persona-dao/custom-persona'

describe('validateCustomPersonaInput', () => {
  it('accepts a valid name + specialty', () => {
    expect(validateCustomPersonaInput('Sentinel', 'low-risk solidity audits')).toBeNull()
  })
  it('rejects empty name', () => {
    expect(validateCustomPersonaInput('', 'x')).toMatch(/name/i)
  })
  it('rejects name over 40 chars', () => {
    expect(validateCustomPersonaInput('a'.repeat(41), 'x')).toMatch(/name/i)
  })
  it('rejects empty specialty', () => {
    expect(validateCustomPersonaInput('Sentinel', '   ')).toMatch(/specialty/i)
  })
  it('rejects specialty over 280 chars', () => {
    expect(validateCustomPersonaInput('Sentinel', 'a'.repeat(281))).toMatch(/specialty/i)
  })
})

describe('buildCustomSystemPrompt', () => {
  it('embeds name and specialty', () => {
    const p = buildCustomSystemPrompt('Sentinel', 'low-risk solidity audits')
    expect(p).toContain('Sentinel')
    expect(p).toContain('low-risk solidity audits')
  })
})
