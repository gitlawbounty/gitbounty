import Link from 'next/link'
import type { Bounty } from '@/lib/bounty/types'
import { BountyStatus } from '@/lib/bounty/types'
import { statusToLabel, statusColorClass } from '@/lib/bounty/format'
import { formatTokenAmount } from '@/lib/format/amount'
import { timeAgo, deadlineRemaining } from '@/lib/format/time'

const GLYPH: Record<BountyStatus, string> = {
  [BountyStatus.Open]: '●',
  [BountyStatus.Claimed]: '◐',
  [BountyStatus.Submitted]: '◔',
  [BountyStatus.Completed]: '✓',
  [BountyStatus.Cancelled]: '✗',
  [BountyStatus.Disputed]: '!',
}

export function BountyCard({ bounty }: { bounty: Bounty }) {
  const label = statusToLabel(bounty.status)
  const color = statusColorClass(bounty.status)
  const claimerHint =
    bounty.status === BountyStatus.Claimed || bounty.status === BountyStatus.Submitted
      ? bounty.claimantDid.slice(0, 12)
      : null

  return (
    <Link
      href={`/bounty/${bounty.id}`}
      className="block bg-surface/40 hover:bg-surface border border-border hover:border-border-strong rounded-lg p-4 transition group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-muted mb-2">
            <span className={color}>{GLYPH[bounty.status]}</span>
            <span>{label}</span>
            <span className="opacity-50">·</span>
            <span>on-chain</span>
            <span className="opacity-50">·</span>
            <span>#{bounty.id}</span>
            <span className="opacity-50">·</span>
            <span>{timeAgo(bounty.createdAt)}</span>
            {claimerHint && (
              <>
                <span className="opacity-50">·</span>
                <span className="text-status-claimed">{claimerHint}…</span>
              </>
            )}
          </div>
          <h3 className="text-base text-primary group-hover:text-accent transition line-clamp-2 leading-snug">
            {bounty.title}
          </h3>
          <div className="mt-2 text-xs font-mono text-muted truncate">
            {bounty.repoOwner}
            <span className="opacity-50"> / </span>
            <span className="text-primary/70">{bounty.repoName}</span>
            <span className="opacity-50"> · issue </span>
            <span>#{bounty.issueId}</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-accent font-mono text-sm font-semibold">
            {formatTokenAmount(bounty.amount, 18)} $GITLAWB
          </div>
          {bounty.status === BountyStatus.Claimed && (
            <div className="text-[10px] text-muted/70 mt-1 font-mono">
              {deadlineRemaining(bounty.claimedAt, bounty.deadline)}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
