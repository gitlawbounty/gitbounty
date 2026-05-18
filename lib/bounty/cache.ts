import type { Bounty } from './types'

const KEY_LAST_BLOCK = 'bb:lastSeenBlock'
const KEY_BOUNTIES = 'bb:bounties'

export function getLastSeenBlock(deployBlock: bigint): bigint {
  if (typeof window === 'undefined') return deployBlock
  const raw = localStorage.getItem(KEY_LAST_BLOCK)
  return raw ? BigInt(raw) : deployBlock
}

export function setLastSeenBlock(block: bigint): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY_LAST_BLOCK, block.toString())
}

export function getCachedBounties(): Bounty[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(KEY_BOUNTIES)
  if (!raw) return []
  try {
    return JSON.parse(raw, (_, v) =>
      typeof v === 'string' && /^\d+n$/.test(v) ? BigInt(v.slice(0, -1)) : v,
    )
  } catch {
    return []
  }
}

export function setCachedBounties(bounties: Bounty[]): void {
  if (typeof window === 'undefined') return
  const serialised = JSON.stringify(bounties, (_, v) =>
    typeof v === 'bigint' ? `${v}n` : v,
  )
  localStorage.setItem(KEY_BOUNTIES, serialised)
}
