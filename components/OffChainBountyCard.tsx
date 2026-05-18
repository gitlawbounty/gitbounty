import type { OffChainBounty } from '@/lib/scraper/types'

const STATUS_GLYPH: Record<string, string> = {
  open: '●',
  claimed: '◐',
  submitted: '◔',
  completed: '✓',
  cancelled: '✗',
  disputed: '!',
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

function truncDid(did: string): string {
  if (!did) return '—'
  if (did.length <= 16) return did
  return `${did.slice(0, 8)}…${did.slice(-4)}`
}

export function OffChainBountyCard({ bounty }: { bounty: OffChainBounty }) {
  return (
    <a
      href={bounty.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-surface/40 hover:bg-surface border border-border hover:border-border-strong rounded-lg p-4 transition group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-muted mb-2">
            <span className={STATUS_COLOR[bounty.status] ?? 'text-muted'}>
              {STATUS_GLYPH[bounty.status] ?? '·'}
            </span>
            <span>{bounty.status}</span>
            <span className="opacity-50">·</span>
            <span>off-chain</span>
            <span className="opacity-50">·</span>
            <span>{bounty.ageLabel || '—'}</span>
          </div>
          <h3 className="text-base text-primary group-hover:text-accent transition line-clamp-2 leading-snug">
            {bounty.title}
          </h3>
          <div className="mt-2 text-xs font-mono text-muted truncate">
            {truncDid(bounty.did)}
            {bounty.repoName && (
              <>
                <span className="opacity-50"> / </span>
                <span className="text-primary/70">{bounty.repoName}</span>
              </>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-accent font-mono text-sm font-semibold">
            {bounty.amount || '—'}
          </div>
          <div className="text-[10px] text-muted/70 mt-1 font-mono">via gitlawb.com ↗</div>
        </div>
      </div>
    </a>
  )
}
