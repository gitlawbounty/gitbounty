'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Row { persona: string; displayScore: number; completionRate: number; totalPicks: number }

export function PersonaLeaderboard() {
  const [rows, setRows] = useState<Row[] | null>(null)

  useEffect(() => {
    fetch('/api/personas/leaderboard')
      .then((r) => r.json())
      .then((d: { leaderboard: Row[] }) => setRows(d.leaderboard))
      .catch(() => setRows([]))
  }, [])

  if (!rows) return <div className="text-xs text-muted font-mono">loading leaderboard…</div>
  if (rows.every((r) => r.totalPicks === 0))
    return (
      <div className="text-xs text-muted font-mono border border-border rounded-lg p-4">
        leaderboard fills in after the first weekly snapshots resolve.
      </div>
    )

  return (
    <div className="border border-border rounded-lg divide-y divide-border">
      {rows.map((r, i) => (
        <Link
          key={r.persona}
          href={`/personas/${r.persona}`}
          className="flex items-center justify-between px-4 py-3 hover:bg-surface transition"
        >
          <span className="flex items-center gap-3">
            <span className="text-muted text-sm w-5">{i + 1}.</span>
            <span className="font-mono text-sm text-primary">{r.persona}</span>
          </span>
          <span className="flex items-center gap-5 text-xs font-mono text-muted">
            <span>{Math.round(r.completionRate * 100)}% done</span>
            <span className="text-accent text-lg font-bold">{r.displayScore}</span>
          </span>
        </Link>
      ))}
    </div>
  )
}
