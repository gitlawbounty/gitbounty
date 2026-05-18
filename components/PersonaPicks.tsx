'use client'

import Link from 'next/link'
import { usePersonaPicks } from '@/hooks/usePersonaPicks'
import { useBounties } from '@/hooks/useBounties'
import { BlinkingCursor } from './ui/BlinkingCursor'
import { formatTokenAmount } from '@/lib/format/amount'
import type { Persona } from '@/lib/llm/personas'

export function PersonaPicks({ persona }: { persona: Persona }) {
  const { data: picksResult, isLoading, error } = usePersonaPicks(persona.name)
  const { data: bounties = [] } = useBounties()

  if (isLoading) return <BlinkingCursor label={`$ ${persona.displayName.toLowerCase()} is scouting`} />

  if (error) {
    return (
      <div className="text-status-disputed text-sm">
        ERR: picks unavailable. {String((error as Error).message).slice(0, 80)}
      </div>
    )
  }

  if (!picksResult) return null

  const lookupBounty = (id: number) => bounties.find((b) => b.id === id)

  return (
    <div className="space-y-4">
      <div className="border-l-2 border-accent pl-3 italic text-muted text-sm">
        "{picksResult.commentary}"
        <div className="not-italic text-[10px] mt-1 text-muted/70">— {persona.displayName}, {picksResult.week}</div>
      </div>

      {picksResult.picks.length === 0 ? (
        <div className="text-sm text-muted">no picks this week.</div>
      ) : (
        <div className="space-y-3">
          {picksResult.picks.map((p) => {
            const b = lookupBounty(p.bountyId)
            return (
              <Link
                key={p.bountyId}
                href={`/bounty/${p.bountyId}`}
                className="block border border-border hover:border-accent p-3"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-accent">#{p.rank}</span>
                    <span className="text-muted">→</span>
                    <span className="text-muted">#{p.bountyId}</span>
                    {b && <span className="text-primary truncate max-w-[28ch]">{b.title}</span>}
                  </div>
                  {b && (
                    <span className="text-accent text-xs">{formatTokenAmount(b.amount, 18)} $GITLAWB</span>
                  )}
                </div>
                <div className="mt-2 text-xs text-muted italic">{p.reasoning}</div>
                <div className="mt-1 text-[10px] text-muted">confidence: {Math.round(p.confidence * 100)}%</div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
