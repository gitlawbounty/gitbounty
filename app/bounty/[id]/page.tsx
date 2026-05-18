'use client'

import { use } from 'react'
import Link from 'next/link'
import { useBounty } from '@/hooks/useBounty'
import { BountyTimeline } from '@/components/BountyTimeline'
import { StatusGlyph } from '@/components/ui/StatusGlyph'
import { BlinkingCursor } from '@/components/ui/BlinkingCursor'
import { EmptyState } from '@/components/ui/EmptyState'
import { ChainGuard } from '@/components/ChainGuard'
import { ActionPanel } from '@/components/ActionPanel'
import { formatTokenAmount } from '@/lib/format/amount'
import { truncateAddress } from '@/lib/format/address'
import { timeAgo } from '@/lib/format/time'
import { statusToLabel } from '@/lib/bounty/format'

export default function BountyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const numId = Number.parseInt(id, 10)
  const { data: bounty, isLoading } = useBounty(Number.isFinite(numId) ? numId : null)

  if (isLoading) return <BlinkingCursor label={`$ loading bounty #${id}`} />

  if (!bounty) {
    return (
      <main className="max-w-3xl mx-auto p-4 sm:p-8">
        <Link href="/" className="text-muted hover:text-accent text-sm">
          {'< back to list'}
        </Link>
        <div className="mt-4">
          <EmptyState
            action={
              <Link href="/" className="text-accent">
                [ back to all bounties ]
              </Link>
            }
          >
            bounty #{id} not found.
          </EmptyState>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-3xl mx-auto p-4 sm:p-8 space-y-6">
      <Link href="/" className="text-muted hover:text-accent text-sm">
        {'< back to list'}
      </Link>

      <header className="space-y-2">
        <h1 className="text-2xl">{bounty.title}</h1>
        <div className="text-muted text-sm">#{bounty.id}</div>
      </header>

      <div className="border border-border p-4 space-y-2 text-sm">
        <Row
          label="STATUS"
          value={
            <>
              <StatusGlyph status={bounty.status} /> {statusToLabel(bounty.status).toUpperCase()}
            </>
          }
        />
        <Row
          label="REWARD"
          value={
            <span className="text-accent">{formatTokenAmount(bounty.amount, 18)} $GITLAWB</span>
          }
        />
        <Row label="CREATOR" value={truncateAddress(bounty.creator)} />
        <Row label="REPO" value={`${bounty.repoOwner}/${bounty.repoName}`} />
        <Row label="ISSUE" value={`#${bounty.issueId}`} />
        <Row label="POSTED" value={timeAgo(bounty.createdAt)} />
        {bounty.claimantDid && (
          <Row label="CLAIMANT" value={`${bounty.claimantDid.slice(0, 30)}…`} />
        )}
        {bounty.prId && <Row label="PR" value={bounty.prId} />}
      </div>

      <BountyTimeline bounty={bounty} />

      <ChainGuard>
        <ActionPanel bounty={bounty} />
      </ChainGuard>
    </main>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="text-muted w-20 text-xs uppercase tracking-wider">{label}</span>
      <span className="text-primary">{value}</span>
    </div>
  )
}
