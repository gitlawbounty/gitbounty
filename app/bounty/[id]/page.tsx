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
import { BountyScout } from '@/components/BountyScout'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { formatTokenAmount } from '@/lib/format/amount'
import { truncateAddress } from '@/lib/format/address'
import { timeAgo } from '@/lib/format/time'
import { statusToLabel, statusColorClass } from '@/lib/bounty/format'

export default function BountyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const numId = Number.parseInt(id, 10)
  const { data: bounty, isLoading } = useBounty(Number.isFinite(numId) ? numId : null)

  return (
    <div className="min-h-screen">
      <div className="bg-grid border-b border-border">
        <main className="max-w-3xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
          <SiteHeader activePath="/" />
        </main>
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-8 py-10 space-y-6">
        <Link href="/" className="text-xs text-muted hover:text-accent">
          {'← back to bounties'}
        </Link>

        {isLoading ? (
          <BlinkingCursor label={`$ loading bounty #${id}`} />
        ) : !bounty ? (
          <EmptyState
            action={
              <Link href="/" className="text-accent hover:underline text-sm">
                back to all bounties →
              </Link>
            }
          >
            bounty #{id} not found.
          </EmptyState>
        ) : (
          <>
            <header className="space-y-2">
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted">
                on-chain bounty · #{bounty.id}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-[1.1]">
                {bounty.title}
              </h1>
            </header>

            <div className="bg-surface/40 border border-border rounded-lg p-5 space-y-3 text-sm">
              <Row
                label="status"
                value={
                  <span className={statusColorClass(bounty.status)}>
                    <StatusGlyph status={bounty.status} /> {statusToLabel(bounty.status)}
                  </span>
                }
              />
              <Row
                label="reward"
                value={
                  <span className="text-accent font-semibold">
                    {formatTokenAmount(bounty.amount, 18)} $GITLAWB
                  </span>
                }
              />
              <Row label="creator" value={truncateAddress(bounty.creator)} />
              <Row label="repo" value={`${bounty.repoOwner}/${bounty.repoName}`} />
              <Row label="issue" value={`#${bounty.issueId}`} />
              <Row label="posted" value={timeAgo(bounty.createdAt)} />
              {bounty.claimantDid && (
                <Row
                  label="claimant"
                  value={`${bounty.claimantDid.slice(0, 30)}…`}
                />
              )}
              {bounty.prId && <Row label="pr" value={bounty.prId} />}
            </div>

            <BountyTimeline bounty={bounty} />

            <BountyScout bountyId={bounty.id} />

            <ChainGuard>
              <ActionPanel bounty={bounty} />
            </ChainGuard>
          </>
        )}

        <SiteFooter />
      </main>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="text-muted w-20 text-[10px] uppercase tracking-[0.2em]">{label}</span>
      <span className="text-primary">{value}</span>
    </div>
  )
}
