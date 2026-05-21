'use client'

import { useState } from 'react'

export function BoostButton({ bountyId, boosted }: { bountyId: string; boosted?: boolean }) {
  const [done, setDone] = useState(boosted ?? false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function boost() {
    setBusy(true)
    setErr(null)
    try {
      const res = await fetch('/api/bounty/boost', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ bountyId }),
      })
      const d = await res.json()
      if (!res.ok) setErr(d.error ?? 'tier 1 $GITB required')
      else setDone(true)
    } catch {
      setErr('network error')
    } finally {
      setBusy(false)
    }
  }

  if (done) return <span className="text-[10px] font-mono text-accent">★ boosted</span>
  return (
    <button
      onClick={boost}
      disabled={busy}
      title="boost with $GITB (tier 1)"
      className="text-[10px] font-mono px-2 py-0.5 rounded border border-border hover:border-accent hover:text-accent disabled:opacity-40 transition"
    >
      {busy ? '…' : '★ boost'}
      {err && <span className="ml-1 text-status-disputed">{err}</span>}
    </button>
  )
}
