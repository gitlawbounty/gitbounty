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
            className="border border-accent text-accent px-3 py-1.5 text-sm hover:bg-accent hover:text-base"
          >
            [ {account ? account.displayName : 'connect wallet'} ]
          </button>
        )
      }}
    </ConnectButton.Custom>
  )
}
