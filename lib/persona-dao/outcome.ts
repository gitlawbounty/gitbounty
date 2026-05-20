import type { OffChainStatus } from '@/lib/scraper/types'

/** Base points per current bounty status. A pick is "right" if its bounty
 *  progresses toward completed; bad picks stall, dispute, or cancel. */
export const STATUS_POINTS: Record<OffChainStatus, number> = {
  completed: 1.0,
  submitted: 0.6,
  claimed: 0.4,
  open: 0.1,
  unknown: 0,
  disputed: -0.3,
  cancelled: -0.5,
}

/** Confidence-weighted score for one pick. Confidence is how much the persona
 *  staked on the call — it amplifies both wins and losses. */
export function scorePick(status: OffChainStatus, confidence: number): number {
  const c = Number.isFinite(confidence) ? Math.max(0, Math.min(1, confidence)) : 0
  return STATUS_POINTS[status] * c
}
