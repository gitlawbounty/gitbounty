// BountyHunter — extend this class, override decision + work methods.
//
// The base class handles the polling loop, deduplication, rate-limiting, and
// event emission. You override two functions:
//
//   shouldClaim(bounty, analysis): does this hunter want this bounty?
//   work(bounty): the actual work (write code, draft PR, etc.) → return PR URL
//
// On-chain claim is optional and only fires when a walletClient is provided
// in the config.

import { createApiClient } from './api.js'
import type {
  Bounty,
  ScoutAnalysis,
  HunterConfig,
  HunterEvent,
  EventHandler,
  ApiClient,
} from './index.js'

export abstract class BountyHunter {
  protected config: Required<Omit<HunterConfig, 'walletClient'>> & {
    walletClient?: unknown
  }
  protected api: ApiClient
  private seen = new Set<string>()
  private handlers: EventHandler[] = []
  private timer: NodeJS.Timeout | null = null
  private running = false

  constructor(config: HunterConfig) {
    this.config = {
      did: config.did,
      walletClient: config.walletClient,
      apiBaseUrl: config.apiBaseUrl ?? 'https://gitlawbounty.xyz',
      pollMs: config.pollMs ?? 60_000,
      maxClaimsPerCycle: config.maxClaimsPerCycle ?? 1,
      verbose: config.verbose ?? false,
    }
    this.api = createApiClient(this.config.apiBaseUrl)
  }

  // ─── REQUIRED OVERRIDES ───────────────────────────────────────────────────

  /**
   * Decide whether this hunter wants to claim a bounty. Return true to claim.
   * Has access to the LLM scout analysis (difficulty, skills, alpha, pitfalls).
   *
   * Default: don't claim anything (override this).
   */
  protected async shouldClaim(_bounty: Bounty, _analysis: ScoutAnalysis): Promise<boolean> {
    return false
  }

  /**
   * Do the actual work for a claimed bounty. Return the PR URL when done.
   * Default: throw — must be overridden if shouldClaim ever returns true.
   */
  protected async work(_bounty: Bounty): Promise<string> {
    throw new Error('BountyHunter.work() not implemented — override in your subclass')
  }

  // ─── PUBLIC API ───────────────────────────────────────────────────────────

  /** Subscribe to hunter events. */
  on(handler: EventHandler): void {
    this.handlers.push(handler)
  }

  /** Start polling for bounties. Resolves once the loop is running. */
  async start(): Promise<void> {
    if (this.running) return
    this.running = true
    if (this.config.verbose) {
      process.stderr.write(
        `[hunter] starting · did=${this.config.did} · poll=${this.config.pollMs}ms\n`,
      )
    }
    await this.cycle()
    this.timer = setInterval(() => {
      this.cycle().catch((err) => this.emit({ kind: 'error', error: String(err) }))
    }, this.config.pollMs)
  }

  /** Stop polling. */
  stop(): void {
    this.running = false
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  /** Run a single polling cycle. Exposed for one-shot use. */
  async cycle(): Promise<void> {
    const bounties = await this.api.listBounties()
    let claimedThisCycle = 0

    for (const bounty of bounties) {
      // Skip already-processed bounties (deduplication within this hunter lifetime)
      if (this.seen.has(bounty.uuid)) continue
      this.seen.add(bounty.uuid)

      this.emit({ kind: 'bounty-seen', bounty })

      // Only consider open bounties — skip claimed/submitted/completed
      if (bounty.status !== 'open') {
        this.emit({
          kind: 'bounty-skipped',
          bounty,
          reason: `status=${bounty.status} (only 'open' is eligible)`,
        })
        continue
      }

      // Rate limit
      if (claimedThisCycle >= this.config.maxClaimsPerCycle) {
        this.emit({
          kind: 'bounty-skipped',
          bounty,
          reason: 'maxClaimsPerCycle reached',
        })
        continue
      }

      // Get scout analysis
      let analysis: ScoutAnalysis
      try {
        analysis = await this.api.scoutBounty(bounty.uuid)
      } catch (err) {
        this.emit({ kind: 'error', bounty, error: `scout failed: ${String(err)}` })
        continue
      }

      // Hunter decision
      let want: boolean
      try {
        want = await this.shouldClaim(bounty, analysis)
      } catch (err) {
        this.emit({
          kind: 'error',
          bounty,
          error: `shouldClaim threw: ${String(err)}`,
        })
        continue
      }

      if (!want) {
        this.emit({
          kind: 'bounty-skipped',
          bounty,
          reason: 'shouldClaim returned false',
        })
        continue
      }

      // Read-only mode (no wallet) — emit wouldClaim and stop
      if (!this.config.walletClient) {
        this.emit({ kind: 'would-claim', bounty, analysis })
        claimedThisCycle++
        continue
      }

      // On-chain claim (requires wallet)
      try {
        const txHash = await this.claimOnChain(bounty)
        this.emit({ kind: 'claimed', bounty, txHash })
        claimedThisCycle++
      } catch (err) {
        this.emit({ kind: 'error', bounty, error: `claim failed: ${String(err)}` })
        continue
      }

      // Do the work
      try {
        const prUrl = await this.work(bounty)
        this.emit({ kind: 'work-done', bounty, prUrl })
      } catch (err) {
        this.emit({ kind: 'error', bounty, error: `work failed: ${String(err)}` })
      }
    }
  }

  // ─── INTERNAL ─────────────────────────────────────────────────────────────

  private emit(event: HunterEvent): void {
    if (this.config.verbose) {
      const kind = event.kind.padEnd(15)
      const id =
        'bounty' in event && event.bounty ? event.bounty.uuid.slice(0, 8) : ''
      process.stderr.write(`[hunter] ${kind} ${id}\n`)
    }
    for (const h of this.handlers) {
      try {
        h(event)
      } catch {
        // Silently ignore handler errors; they shouldn't break the loop.
      }
    }
  }

  /**
   * Override to implement on-chain claim. Default returns a placeholder.
   * In a real implementation, use viem walletClient to call
   * `GitlawbBounty.claimBounty(bountyId, did)` and return the txHash.
   */
  protected async claimOnChain(_bounty: Bounty): Promise<string> {
    // Default impl: just return a placeholder. Subclass should override.
    return 'pending'
  }
}
