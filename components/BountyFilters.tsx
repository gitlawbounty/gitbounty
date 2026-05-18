'use client'

import { BountyStatus } from '@/lib/bounty/types'

export type StatusFilter = 'all' | BountyStatus
export type Sort = 'newest' | 'highest' | 'closing'

interface Props {
  status: StatusFilter
  sort: Sort
  search: string
  onChange: (state: { status: StatusFilter; sort: Sort; search: string }) => void
}

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'all' },
  { value: BountyStatus.Open, label: 'open' },
  { value: BountyStatus.Claimed, label: 'claimed' },
  { value: BountyStatus.Submitted, label: 'submitted' },
  { value: BountyStatus.Completed, label: 'done' },
]

const SORT_OPTIONS: { value: Sort; label: string }[] = [
  { value: 'newest', label: 'newest' },
  { value: 'highest', label: 'highest $' },
  { value: 'closing', label: 'closing soon' },
]

export function BountyFilters({ status, sort, search, onChange }: Props) {
  return (
    <div className="border border-border p-3 space-y-2 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-muted">$ filter:</span>
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={String(opt.value)}
            onClick={() => onChange({ status: opt.value, sort, search })}
            className={`border px-2 py-0.5 ${
              status === opt.value
                ? 'border-accent text-accent'
                : 'border-border text-muted hover:text-primary'
            }`}
          >
            [{opt.label}]
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-muted">sort:</span>
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange({ status, sort: opt.value, search })}
            className={`border px-2 py-0.5 ${
              sort === opt.value
                ? 'border-accent text-accent'
                : 'border-border text-muted hover:text-primary'
            }`}
          >
            [{opt.label}]
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-muted">search:</span>
        <input
          value={search}
          onChange={(e) => onChange({ status, sort, search: e.target.value })}
          className="bg-transparent border-b border-border focus:border-accent outline-none px-1 py-0.5 flex-1"
          placeholder="title, repo, did..."
        />
      </div>
    </div>
  )
}
