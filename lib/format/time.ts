export function timeAgo(unix: bigint): string {
  if (unix === 0n) return '—'
  const now = BigInt(Math.floor(Date.now() / 1000))
  const diff = Number(now - unix)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export function deadlineRemaining(claimedAt: bigint, deadline: bigint): string {
  if (claimedAt === 0n) return '—'
  const expiresAt = claimedAt + deadline
  const now = BigInt(Math.floor(Date.now() / 1000))
  if (now >= expiresAt) return 'expired'
  const remaining = Number(expiresAt - now)
  if (remaining < 3600) return `${Math.floor(remaining / 60)}m left`
  if (remaining < 86400) return `${Math.floor(remaining / 3600)}h left`
  return `${Math.floor(remaining / 86400)}d left`
}
