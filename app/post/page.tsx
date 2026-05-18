'use client'

import Link from 'next/link'
import { useAccount } from 'wagmi'
import { PostBountyForm } from '@/components/PostBountyForm'
import { ChainGuard } from '@/components/ChainGuard'
import { WalletButton } from '@/components/WalletButton'

export default function PostPage() {
  const { isConnected } = useAccount()
  return (
    <main className="max-w-3xl mx-auto p-4 sm:p-8 space-y-6">
      <Link href="/" className="text-muted hover:text-accent text-sm">
        {'< back'}
      </Link>
      <h1 className="text-2xl">$ gl bounty create</h1>

      {!isConnected ? (
        <div className="border border-border p-4 space-y-3">
          <div>wallet not connected.</div>
          <div className="text-muted text-sm">posting a bounty requires:</div>
          <ul className="text-muted text-sm list-disc list-inside">
            <li>Base Sepolia wallet</li>
            <li>$GITLAWB approval</li>
          </ul>
          <WalletButton />
        </div>
      ) : (
        <ChainGuard>
          <PostBountyForm />
        </ChainGuard>
      )}
    </main>
  )
}
