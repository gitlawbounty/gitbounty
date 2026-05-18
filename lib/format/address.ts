const ZERO = '0x0000000000000000000000000000000000000000'

export function truncateAddress(addr: string | null | undefined): string {
  if (!addr) return '—'
  if (addr.toLowerCase() === ZERO) return '—'
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}
