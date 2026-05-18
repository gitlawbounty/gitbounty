'use client'

import { useAccount, useSwitchChain } from 'wagmi'
import { activeChain } from '@/lib/chains'
import { Button } from './ui/Button'

export function ChainGuard({ children }: { children: React.ReactNode }) {
  const { chain, isConnected } = useAccount()
  const { switchChain } = useSwitchChain()

  if (isConnected && chain?.id !== activeChain.id) {
    return (
      <div className="border border-status-disputed p-3 space-y-2">
        <div className="text-status-disputed">WRONG NETWORK</div>
        <div className="text-sm text-muted">
          you are on: {chain?.name ?? 'unknown'} ({chain?.id})
          <br />
          required: {activeChain.name} ({activeChain.id})
        </div>
        <Button onClick={() => switchChain({ chainId: activeChain.id })}>switch network</Button>
      </div>
    )
  }
  return <>{children}</>
}
