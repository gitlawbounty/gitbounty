import type { OffChainBounty } from '@/lib/scraper/types'

const STATUS_GLYPH: Record<string, string> = {
  open: '◉',
  claimed: '◎',
  submitted: '↑',
  completed: '✓',
  cancelled: '✗',
  disputed: '⚠',
  unknown: '·',
}

const STATUS_COLOR: Record<string, string> = {
  open: 'text-status-open',
  claimed: 'text-status-claimed',
  submitted: 'text-status-claimed',
  completed: 'text-status-completed',
  cancelled: 'text-status-cancelled',
  disputed: 'text-status-disputed',
  unknown: 'text-muted',
}

export function OffChainBountyCard({ bounty }: { bounty: OffChainBounty }) {
  return (
    <a
      href={bounty.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block border border-border hover:border-accent p-3 transition group"
    >
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-2 truncate min-w-0">
          <span className={STATUS_COLOR[bounty.status] ?? 'text-muted'}>
            {STATUS_GLYPH[bounty.status] ?? '·'}
          </span>
          <span className="text-[10px] text-muted uppercase tracking-[0.15em]">off-chain</span>
        </div>
        <span className="text-accent shrink-0 text-sm">{bounty.amount || '—'}</span>
      </div>
      <div className="mt-1 text-primary group-hover:text-accent truncate">{bounty.title}</div>
      <div className="mt-1 text-xs text-muted truncate">
        {bounty.did ? `${bounty.did.slice(0, 12)}…/${bounty.repoName}` : bounty.repoName}
      </div>
      <div className="mt-1 text-[11px] text-muted flex justify-between">
        <span>{bounty.ageLabel}</span>
        <span className="text-muted/70">via gitlawb.com ↗</span>
      </div>
    </a>
  )
}
