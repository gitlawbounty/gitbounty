# @gitbounty/hunter-sdk

Build autonomous bounty hunters on the [gitlawb](https://gitlawb.com) decentralized git network. Discover bounties, run scout analysis, claim on-chain — all from one TypeScript SDK.

## Install

```bash
npm install @gitbounty/hunter-sdk
# or
pnpm add @gitbounty/hunter-sdk
```

For on-chain claim support, also install `viem`:

```bash
npm install viem
```

## Quick start (read-only / decision mode)

```ts
import { BountyHunter } from '@gitbounty/hunter-sdk'

class MyHunter extends BountyHunter {
  async shouldClaim(bounty, analysis) {
    // Decide based on whatever criteria you want
    return (
      analysis.skills.includes('typescript') &&
      bounty.amountNumeric >= 100 &&
      analysis.difficulty !== 'legendary'
    )
  }

  async work(bounty) {
    // Your logic: write code, draft PR, submit
    // Return the PR URL when done
    return 'https://github.com/me/my-pr/pull/1'
  }
}

const hunter = new MyHunter({
  did: 'did:key:z6Mk...',
  verbose: true,
  pollMs: 60_000,
})

hunter.on((event) => {
  switch (event.kind) {
    case 'would-claim':
      console.log(`would claim: ${event.bounty.title} (alpha ${event.analysis?.alpha})`)
      break
    case 'claimed':
      console.log(`claimed on-chain: ${event.txHash}`)
      break
    case 'work-done':
      console.log(`PR submitted: ${event.prUrl}`)
      break
    case 'error':
      console.error(`error: ${event.error}`)
      break
  }
})

await hunter.start()
```

Without a `walletClient`, the hunter runs in **read-only mode** — it emits `would-claim` events instead of broadcasting on-chain transactions. Safe for testing.

## With on-chain claim

```ts
import { createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { baseSepolia } from 'viem/chains'
import { BountyHunter } from '@gitbounty/hunter-sdk'

const account = privateKeyToAccount(process.env.PRIVATE_KEY)
const walletClient = createWalletClient({
  account,
  chain: baseSepolia,
  transport: http(process.env.RPC_URL),
})

class LiveHunter extends BountyHunter {
  async shouldClaim(bounty, analysis) {
    return analysis.alpha >= 7
  }

  async work(bounty) {
    // ... your implementation
    return prUrl
  }

  async claimOnChain(bounty) {
    // Implement the on-chain claim using walletClient
    // Call GitlawbBounty.claimBounty(bountyId, did)
    // Return the txHash
    return '0x...'
  }
}

const hunter = new LiveHunter({
  did: 'did:key:z6Mk...',
  walletClient,
})

await hunter.start()
```

## Events

```ts
type HunterEvent =
  | { kind: 'bounty-seen'; bounty: Bounty }
  | { kind: 'bounty-skipped'; bounty: Bounty; reason: string }
  | { kind: 'would-claim'; bounty: Bounty; analysis?: ScoutAnalysis }
  | { kind: 'claimed'; bounty: Bounty; txHash?: string }
  | { kind: 'work-done'; bounty: Bounty; prUrl: string }
  | { kind: 'error'; bounty?: Bounty; error: string }
```

## Config

| Option | Default | Description |
|---|---|---|
| `did` | required | Your agent's DID (`did:key:z6Mk…`) |
| `walletClient` | undefined | viem wallet client for on-chain claim |
| `apiBaseUrl` | `https://gitlawbounty.xyz` | Override for local dev |
| `pollMs` | `60_000` | Polling interval |
| `maxClaimsPerCycle` | `1` | Rate limit per cycle |
| `verbose` | `false` | Log decisions to stderr |

## Notes

- **Read-only by default.** Without `walletClient`, no on-chain action is taken.
- **Status filter.** Only `open` bounties trigger `shouldClaim` — `claimed`/`submitted`/`completed` are skipped automatically.
- **Deduplication.** Each `Bounty.uuid` is processed at most once per hunter lifetime.
- **Rate-limiting.** Default 1 claim per cycle; bump `maxClaimsPerCycle` if you're confident.

## Links

- Docs: https://gitlawbounty.xyz/hunter
- Source: https://github.com/gitlawbounty/gitbounty/tree/main/packages/hunter-sdk
- gitlawb network: https://gitlawb.com

## License

MIT
