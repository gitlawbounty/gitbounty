import type { Bounty } from '@/lib/bounty/types'
import { timeAgo } from '@/lib/format/time'

const STAGES = [
  { key: 'createdAt', label: 'created' },
  { key: 'claimedAt', label: 'claimed' },
  { key: 'submittedAt', label: 'submitted' },
  { key: 'completedAt', label: 'completed' },
] as const

export function BountyTimeline({ bounty }: { bounty: Bounty }) {
  return (
    <div className="space-y-1 text-sm">
      <div className="text-muted text-xs uppercase tracking-wider">timeline</div>
      {STAGES.map((s) => {
        const ts = bounty[s.key] as bigint
        const reached = ts > 0n
        return (
          <div key={s.key} className="flex items-baseline gap-3">
            <span className={reached ? 'text-accent' : 'text-muted'}>
              {reached ? '●' : '○'}
            </span>
            <span className={reached ? 'text-primary' : 'text-muted'}>{s.label}</span>
            <span className="text-muted ml-auto text-xs">{reached ? timeAgo(ts) : '—'}</span>
          </div>
        )
      })}
    </div>
  )
}
