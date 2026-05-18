'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'

export function WalletButton() {
  return (
    <ConnectButton.Custom>
      {({ account, openConnectModal, openAccountModal, mounted }) => {
        if (!mounted) return null
        return (
          <button
            onClick={account ? openAccountModal : openConnectModal}
            className="rounded border border-border-strong text-primary px-3.5 py-2 text-sm hover:border-accent hover:text-accent transition"
          >
            {account ? account.displayName : 'connect wallet'}
          </button>
        )
      }}
    </ConnectButton.Custom>
  )
}
