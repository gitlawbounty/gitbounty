import type { OffChainStatus, PersonaName, ReputationSummary } from './types'
import { scorePick } from './outcome'

interface ScoredInput {
  currentStatus: OffChainStatus
  confidence: number
}

/** Map weighted score (~[-0.5, 1]) to a 0..100 display number. */
function toDisplay(weighted: number): number {
  const norm = (weighted + 0.5) / 1.5
  return Math.round(Math.max(0, Math.min(1, norm)) * 100)
}

export function computeReputation(
  persona: PersonaName,
  picks: ScoredInput[],
): ReputationSummary {
  if (picks.length === 0) {
    return { persona, totalPicks: 0, weightedScore: 0, completionRate: 0, displayScore: toDisplay(0) }
  }
  let scoreSum = 0
  let confSum = 0
  let completed = 0
  for (const p of picks) {
    scoreSum += scorePick(p.currentStatus, p.confidence)
    confSum += Math.max(0, Math.min(1, p.confidence))
    if (p.currentStatus === 'completed') completed++
  }
  const weightedScore = confSum > 0 ? scoreSum / confSum : 0
  return {
    persona,
    totalPicks: picks.length,
    weightedScore,
    completionRate: completed / picks.length,
    displayScore: toDisplay(weightedScore),
  }
}
