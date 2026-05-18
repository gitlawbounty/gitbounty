'use client'

import Link from 'next/link'
import { useEvents } from '@/hooks/useEvents'
import { BlinkingCursor } from './ui/BlinkingCursor'

const KIND_GLYPH: Record<string, string> = {
  BountyCreated: '+',
  BountyClaimed: '◎',
  BountySubmitted: '↑',
  BountyCompleted: '✓',
  BountyCancelled: '✗',
  BountyDisputed: '⚠',
}

export function ActivityFeed() {
  const { data: events, isLoading } = useEvents(10)

  if (isLoading) return <BlinkingCursor label="$ loading feed" />

  if (!events?.length) {
    return <div className="text-muted text-sm">no activity yet.</div>
  }

  return (
    <div className="space-y-1 text-sm font-mono">
      <div className="text-muted uppercase text-xs tracking-wider mb-2">activity feed</div>
      {events.map((e) => (
        <Link
          key={`${e.txHash}-${e.kind}-${e.bountyId}`}
          href={`/bounty/${e.bountyId}`}
          className="block text-muted hover:text-accent truncate"
        >
          {'> '}
          <span className="text-accent">{KIND_GLYPH[e.kind] ?? '·'}</span> #{e.bountyId}{' '}
          {e.kind.replace('Bounty', '').toLowerCase()}
        </Link>
      ))}
    </div>
  )
}
