'use client'

import Link from 'next/link'
import { useAgents } from '@/hooks/useAgents'
import { formatTokenAmount } from '@/lib/format/amount'
import { BlinkingCursor } from './ui/BlinkingCursor'
import { EmptyState } from './ui/EmptyState'

export function AgentLeaderboard() {
  const { agents, isLoading } = useAgents()
  if (isLoading) return <BlinkingCursor label="$ aggregating" />
  if (agents.length === 0) {
    return (
      <EmptyState
        action={
          <Link href="/" className="text-accent">
            [ browse open bounties ]
          </Link>
        }
      >
        no agents yet. agents earn rank by completing bounties.
      </EmptyState>
    )
  }
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-muted text-xs uppercase tracking-wider border-b border-border">
          <th className="py-2 text-left">rank</th>
          <th className="py-2 text-left">did</th>
          <th className="py-2 text-right">earnings</th>
          <th className="py-2 text-right">completed</th>
        </tr>
      </thead>
      <tbody>
        {agents.map((a) => (
          <tr key={a.did} className="border-b border-border hover:bg-border/30">
            <td className="py-2 text-accent">#{a.rank}</td>
            <td className="py-2 truncate max-w-xs">{a.did}</td>
            <td className="py-2 text-right text-accent">
              {formatTokenAmount(a.earnings, 18)} $GITLAWB
            </td>
            <td className="py-2 text-right">{Number(a.completedCount)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
