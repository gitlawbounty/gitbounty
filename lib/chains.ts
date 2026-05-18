import { baseSepolia } from 'wagmi/chains'
import { env } from './env'

export const activeChain = baseSepolia
export const activeChainId = env.NEXT_PUBLIC_CHAIN_ID
