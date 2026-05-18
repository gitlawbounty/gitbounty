import { BountyStatus } from '@/lib/bounty/types'
import { statusGlyph, statusColorClass } from '@/lib/bounty/format'

export function StatusGlyph({ status }: { status: BountyStatus }) {
  return <span className={statusColorClass(status)}>{statusGlyph(status)}</span>
}
