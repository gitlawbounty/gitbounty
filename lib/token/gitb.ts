import { createPublicClient, http, erc20Abi, formatUnits } from 'viem'
import { base } from 'viem/chains'

const GITB_ADDRESS = (process.env.NEXT_PUBLIC_GITB_ADDRESS ??
  '0x9074d71cbc97bf39e41366af80f28b05fd4d4403') as `0x${string}`

const client = createPublicClient({ chain: base, transport: http() })

let decimalsCache: number | null = null

async function gitbDecimals(): Promise<number> {
  if (decimalsCache !== null) return decimalsCache
  decimalsCache = await client.readContract({
    address: GITB_ADDRESS,
    abi: erc20Abi,
    functionName: 'decimals',
  })
  return decimalsCache
}

/** Whole-token $GITB balance for an address (floored integer). */
export async function gitbBalanceWhole(address: string): Promise<number> {
  const [raw, decimals] = await Promise.all([
    client.readContract({
      address: GITB_ADDRESS,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [address as `0x${string}`],
    }),
    gitbDecimals(),
  ])
  return Math.floor(Number(formatUnits(raw, decimals)))
}
