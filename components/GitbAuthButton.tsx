'use client'

import { useState } from 'react'
import { useAccount, useSignMessage } from 'wagmi'

interface Authed { address: string; tier: number; balance: number }

export function GitbAuthButton({ onAuthed }: { onAuthed?: (a: Authed) => void }) {
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const [authed, setAuthed] = useState<Authed | null>(null)
  const [loading, setLoading] = useState(false)

  async function signIn() {
    if (!address) return
    setLoading(true)
    try {
      const { nonce } = await (await fetch('/api/auth/nonce')).json()
      const message = [
        'gitbounty wants you to sign in with your wallet.',
        '',
        `address: ${address}`,
        `nonce: ${nonce}`,
        'this proves you control this wallet. it does not move any funds.',
      ].join('\n')
      const signature = await signMessageAsync({ message })
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ address, nonce, signature }),
      })
      if (!res.ok) throw new Error('verify failed')
      const data = (await res.json()) as Authed
      setAuthed(data)
      onAuthed?.(data)
    } catch {
      // user rejected or verify failed — leave unauthed
    } finally {
      setLoading(false)
    }
  }

  if (!isConnected) {
    return <span className="text-xs text-muted font-mono">connect wallet to unlock $GITB tier</span>
  }
  if (authed) {
    return (
      <span className="text-xs font-mono text-accent">
        tier {authed.tier} · {authed.balance.toLocaleString()} $GITB
      </span>
    )
  }
  return (
    <button
      onClick={signIn}
      disabled={loading}
      className="text-xs font-mono px-3 py-1.5 rounded border border-border hover:border-accent hover:text-accent disabled:opacity-40 transition"
    >
      {loading ? 'signing…' : 'verify $GITB to unlock alpha'}
    </button>
  )
}
