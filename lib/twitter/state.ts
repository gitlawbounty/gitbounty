// Minimal state tracker — remembers which bounty UUIDs have been tweeted so
// the cron doesn't re-post the same bounty.
//
// Local dev: writes to .data/twitter-state.json (gitignored).
// Production: writes to /tmp/twitter-state.json (ephemeral on Vercel, but
// since cron runs every 30 min and bounties have created_at, we additionally
// filter by timestamp — so losing state is at most a one-cron duplicate window).

import fs from 'node:fs/promises'
import path from 'node:path'

const STATE_FILE =
  process.env.NODE_ENV === 'production'
    ? '/tmp/twitter-state.json'
    : path.join(process.cwd(), '.data', 'twitter-state.json')

interface State {
  /** UUIDs of bounties already tweeted */
  tweetedBountyIds: string[]
  /** ISO timestamp of last bounty alert cron run */
  lastBountyCronRunAt: string | null
  /** ISO timestamp of last persona picks cron run */
  lastPersonaCronRunAt: string | null
}

const EMPTY_STATE: State = {
  tweetedBountyIds: [],
  lastBountyCronRunAt: null,
  lastPersonaCronRunAt: null,
}

export async function readState(): Promise<State> {
  try {
    const raw = await fs.readFile(STATE_FILE, 'utf-8')
    const parsed = JSON.parse(raw) as State
    return {
      tweetedBountyIds: parsed.tweetedBountyIds ?? [],
      lastBountyCronRunAt: parsed.lastBountyCronRunAt ?? null,
      lastPersonaCronRunAt: parsed.lastPersonaCronRunAt ?? null,
    }
  } catch {
    return { ...EMPTY_STATE }
  }
}

export async function writeState(state: State): Promise<void> {
  // Cap list to last 500 UUIDs to keep file small
  const capped: State = {
    ...state,
    tweetedBountyIds: state.tweetedBountyIds.slice(-500),
  }
  await fs.mkdir(path.dirname(STATE_FILE), { recursive: true }).catch(() => {})
  await fs.writeFile(STATE_FILE, JSON.stringify(capped, null, 2))
}

export async function markBountyTweeted(uuid: string): Promise<void> {
  const s = await readState()
  if (s.tweetedBountyIds.includes(uuid)) return
  s.tweetedBountyIds.push(uuid)
  await writeState(s)
}

export async function wasBountyTweeted(uuid: string): Promise<boolean> {
  const s = await readState()
  return s.tweetedBountyIds.includes(uuid)
}

export async function setLastBountyCronRunAt(iso: string): Promise<void> {
  const s = await readState()
  s.lastBountyCronRunAt = iso
  await writeState(s)
}

export async function setLastPersonaCronRunAt(iso: string): Promise<void> {
  const s = await readState()
  s.lastPersonaCronRunAt = iso
  await writeState(s)
}
