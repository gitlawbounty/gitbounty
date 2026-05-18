import { BountyStatus, StatusLabel } from './types'

export function statusToLabel(s: BountyStatus): StatusLabel {
  return (
    {
      [BountyStatus.Open]: 'open',
      [BountyStatus.Claimed]: 'claimed',
      [BountyStatus.Submitted]: 'submitted',
      [BountyStatus.Completed]: 'completed',
      [BountyStatus.Cancelled]: 'cancelled',
      [BountyStatus.Disputed]: 'disputed',
    } as const
  )[s]
}

export function statusGlyph(s: BountyStatus): string {
  switch (s) {
    case BountyStatus.Open:
      return '◉'
    case BountyStatus.Claimed:
    case BountyStatus.Submitted:
      return '◎'
    case BountyStatus.Completed:
      return '✓'
    case BountyStatus.Cancelled:
      return '✗'
    case BountyStatus.Disputed:
      return '⚠'
  }
}

export function statusColorClass(s: BountyStatus): string {
  switch (s) {
    case BountyStatus.Open:
      return 'text-status-open'
    case BountyStatus.Claimed:
    case BountyStatus.Submitted:
      return 'text-status-claimed'
    case BountyStatus.Completed:
      return 'text-status-completed'
    case BountyStatus.Cancelled:
      return 'text-status-cancelled'
    case BountyStatus.Disputed:
      return 'text-status-disputed'
  }
}
