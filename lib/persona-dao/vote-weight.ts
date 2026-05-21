/** Anti-whale vote weight: floor(sqrt(balance)). A 100x bag is ~10x the vote. */
export function voteWeight(balanceWhole: number): number {
  if (!Number.isFinite(balanceWhole) || balanceWhole <= 0) return 0
  return Math.floor(Math.sqrt(balanceWhole))
}
