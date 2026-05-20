import type { PersonaName } from '@/lib/llm/personas'
import type { OffChainStatus } from '@/lib/scraper/types'

export type { PersonaName, OffChainStatus }

/** A single pick captured in a weekly snapshot. */
export interface SnapshotPick {
  bountyId: string
  reasoning: string
  confidence: number // 0..1
  statusAtPick: OffChainStatus
}

export interface PickSnapshot {
  persona: PersonaName
  week: string // ISO week, e.g. 2026-W21
  picks: SnapshotPick[]
  commentary: string
  snapshotAt: string // ISO
}

/** A pick after outcome refresh — current status + computed score. */
export interface OutcomePick {
  bountyId: string
  confidence: number
  currentStatus: OffChainStatus
  score: number
}

export interface OutcomeRecord {
  persona: PersonaName
  week: string
  picks: OutcomePick[]
  refreshedAt: string
}

export interface ReputationSummary {
  persona: PersonaName
  totalPicks: number
  weightedScore: number // confidence-weighted avg, ~[-0.5, 1]
  completionRate: number // 0..1
  displayScore: number // 0..100
}
