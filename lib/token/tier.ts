export type Tier = 0 | 1 | 2

/** Resolve a tier from a whole-token $GITB balance against two thresholds. */
export function resolveTier(balanceWhole: number, t1: number, t2: number): Tier {
  if (balanceWhole >= t2) return 2
  if (balanceWhole >= t1) return 1
  return 0
}
