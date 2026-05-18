import Link from 'next/link'
import type { Bounty } from '@/lib/bounty/types'
import { BountyStatus } from '@/lib/bounty/types'
import { StatusGlyph } from './ui/StatusGlyph'
import { formatTokenAmount } from '@/lib/format/amount'
import { timeAgo, deadlineRemaining } from '@/lib/format/time'
import { truncateAddress } from '@/lib/format/address'

export function BountyCard({ bounty }: { bounty: Bounty }) {
  const claimerHint =
    bounty.status === BountyStatus.Claimed || bounty.status === BountyStatus.Submitted
      ? `claimed by ${bounty.claimantDid.slice(0, 10)}…`
      : null
  return (
    <Link
      href={`/bounty/${bounty.id}`}
      className="block border border-border hover:border-accent p-3 transition group"
    >
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-2 truncate">
          <StatusGlyph status={bounty.status} />
          <span className="text-muted">#{bounty.id}</span>
          {claimerHint && <span className="text-status-claimed text-xs">{claimerHint}</span>}
        </div>
        <span className="text-accent shrink-0">
          {formatTokenAmount(bounty.amount, 18)} $GITLAWB
        </span>
      </div>
      <div className="mt-1 text-primary group-hover:text-accent">{bounty.title}</div>
      <div className="mt-1 text-xs text-muted">
        {truncateAddress(bounty.repoOwner.startsWith('0x') ? bounty.repoOwner : null) ||
          bounty.repoOwner}
        /{bounty.repoName} · issue #{bounty.issueId}
      </div>
      <div className="mt-1 text-xs text-muted">
        posted {timeAgo(bounty.createdAt)}
        {bounty.status === BountyStatus.Claimed &&
          ` · ${deadlineRemaining(bounty.claimedAt, bounty.deadline)} to submit`}
      </div>
    </Link>
  )
}
