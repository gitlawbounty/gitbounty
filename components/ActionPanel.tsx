'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Button } from './ui/Button'
import { writeContracts } from '@/lib/bounty/write'
import { useWriteAction } from '@/hooks/useWriteAction'
import { BountyStatus, type Bounty } from '@/lib/bounty/types'

interface Props {
  bounty: Bounty
}

export function ActionPanel({ bounty }: Props) {
  const { address } = useAccount()
  const { writeContract, isPending, isConfirming } = useWriteAction()
  const [didInput, setDidInput] = useState('')
  const [prInput, setPrInput] = useState('')

  const isCreator = address?.toLowerCase() === bounty.creator.toLowerCase()
  const isClaimant = address?.toLowerCase() === bounty.claimantAddress?.toLowerCase()
  const deadlinePassed =
    bounty.claimedAt > 0n &&
    BigInt(Math.floor(Date.now() / 1000)) > bounty.claimedAt + bounty.deadline

  const busy = isPending || isConfirming

  if (!address) {
    return (
      <div className="border border-border p-3 text-sm text-muted">
        wallet not connected. connect to interact with this bounty.
      </div>
    )
  }

  if (bounty.status === BountyStatus.Open) {
    return (
      <div className="border border-border p-3 space-y-3">
        <div className="space-y-2">
          <label className="block text-xs text-muted uppercase">your did</label>
          <input
            value={didInput}
            onChange={(e) => setDidInput(e.target.value)}
            placeholder="did:gitlawb:z6Mk..."
            className="w-full bg-transparent border border-border focus:border-accent outline-none px-2 py-1 text-sm"
          />
          <Button
            disabled={busy || !didInput}
            onClick={() => writeContract(writeContracts.claimBounty(BigInt(bounty.id), didInput))}
          >
            {busy ? 'pending…' : 'claim this bounty'}
          </Button>
        </div>
        {isCreator && (
          <Button
            variant="danger"
            disabled={busy}
            onClick={() => writeContract(writeContracts.cancelBounty(BigInt(bounty.id)))}
          >
            cancel bounty
          </Button>
        )}
      </div>
    )
  }

  if (bounty.status === BountyStatus.Claimed) {
    return (
      <div className="border border-border p-3 space-y-3">
        {isClaimant && (
          <div className="space-y-2">
            <label className="block text-xs text-muted uppercase">PR id</label>
            <input
              value={prInput}
              onChange={(e) => setPrInput(e.target.value)}
              placeholder="prs/42"
              className="w-full bg-transparent border border-border focus:border-accent outline-none px-2 py-1 text-sm"
            />
            <Button
              disabled={busy || !prInput}
              onClick={() => writeContract(writeContracts.submitBounty(BigInt(bounty.id), prInput))}
            >
              {busy ? 'pending…' : 'submit pr'}
            </Button>
          </div>
        )}
        {deadlinePassed && (
          <Button
            variant="danger"
            disabled={busy}
            onClick={() => writeContract(writeContracts.disputeBounty(BigInt(bounty.id)))}
          >
            dispute & reopen
          </Button>
        )}
      </div>
    )
  }

  if (bounty.status === BountyStatus.Submitted) {
    return (
      <div className="border border-border p-3 space-y-3">
        {isCreator && (
          <Button
            disabled={busy}
            onClick={() => writeContract(writeContracts.approveBounty(BigInt(bounty.id)))}
          >
            {busy ? 'pending…' : 'approve & pay out'}
          </Button>
        )}
        {deadlinePassed && (
          <Button
            variant="danger"
            disabled={busy}
            onClick={() => writeContract(writeContracts.disputeBounty(BigInt(bounty.id)))}
          >
            dispute & reopen
          </Button>
        )}
      </div>
    )
  }

  const terminal =
    bounty.status === BountyStatus.Completed
      ? 'completed'
      : bounty.status === BountyStatus.Cancelled
      ? 'cancelled'
      : 'disputed'
  return (
    <div className="border border-border p-3 text-sm text-muted">
      no actions available — bounty is {terminal}.
    </div>
  )
}
