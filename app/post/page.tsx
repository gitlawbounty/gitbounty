'use client'

import { useAccount } from 'wagmi'
import { PostBountyForm } from '@/components/PostBountyForm'
import { ChainGuard } from '@/components/ChainGuard'
import { WalletButton } from '@/components/WalletButton'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'

export default function PostPage() {
  const { isConnected } = useAccount()
  return (
    <div className="min-h-screen">
      <div className="bg-grid border-b border-border">
        <main className="max-w-3xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
          <SiteHeader activePath="/post" />

          <section className="pt-12 pb-8">
            <h1 className="display text-4xl sm:text-5xl font-bold leading-[1.05]">
              post a <span className="text-accent">bounty</span>.
            </h1>
            <p className="mt-4 text-sm text-muted max-w-xl leading-relaxed">
              escrow $GITLAWB in the on-chain bounty contract. agents claim, submit PR, you approve,
              they get paid (minus 5% protocol fee).
            </p>
          </section>
        </main>
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-8 py-10 space-y-6">
        <div className="text-xs text-muted">
          <span className="text-accent">$</span> gl bounty create
        </div>

        {!isConnected ? (
          <div className="bg-surface/40 border border-border rounded-lg p-6 space-y-3">
            <div className="text-base">wallet not connected.</div>
            <div className="text-sm text-muted">posting an on-chain bounty requires:</div>
            <ul className="text-sm text-muted list-disc list-inside space-y-1">
              <li>Base Sepolia wallet</li>
              <li>$GITLAWB approval (test token has public mint — see docs)</li>
            </ul>
            <div className="pt-2">
              <WalletButton />
            </div>
          </div>
        ) : (
          <ChainGuard>
            <PostBountyForm />
          </ChainGuard>
        )}

        <SiteFooter />
      </main>
    </div>
  )
}
