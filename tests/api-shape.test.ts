import { describe, it, expect } from 'vitest'
import { serializeBounty } from '@/lib/api/serialize'
import { BountyStatus, type Bounty } from '@/lib/bounty/types'

const sample: Bounty = {
  id: 42,
  creator: '0xabcdef0123456789abcdef0123456789abcdef01',
  amount: 500_000n * 10n ** 18n,
  repoOwner: 'did:key:z6Mkalice',
  repoName: 'gitlawb-node',
  issueId: '127',
  title: 'fix ci runner',
  claimantDid: '',
  claimantAddress: null,
  prId: '',
  status: BountyStatus.Open,
  createdAt: 1_700_000_000n,
  claimedAt: 0n,
  submittedAt: 0n,
  completedAt: 0n,
  deadline: 604_800n,
}

describe('serializeBounty', () => {
  it('has expected shape', () => {
    const out = serializeBounty(sample)
    expect(out.id).toBe(42)
    expect(out.status).toBe('open')
    expect(out.amountFormatted).toContain('$GITLAWB')
    expect(out.links.contractCall?.function).toBe('claimBounty')
    expect(out.links.contractCall?.args[0]).toBe('42')
  })
  it('produces null contractCall for terminal states', () => {
    const completed = serializeBounty({
      ...sample,
      status: BountyStatus.Completed,
      completedAt: 1_700_000_100n,
    })
    expect(completed.links.contractCall).toBeNull()
  })
})
