import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { baseSepolia } from 'wagmi/chains'
import { http } from 'viem'
import { env } from './env'

export const wagmiConfig = getDefaultConfig({
  appName: 'gitbounty',
  projectId: env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(env.NEXT_PUBLIC_RPC_URL),
  },
  ssr: true,
})
