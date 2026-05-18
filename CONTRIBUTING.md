# Contributing to gitbounty

gitbounty is early-stage and shipping in public. The roadmap is in [`README.md`](./README.md#roadmap) and every release goes out on [@Gitlawbounty](https://x.com/Gitlawbounty).

## Development

```bash
pnpm install
cp .env.example .env.local   # fill in the values
pnpm dev                     # → http://localhost:3000
```

Required env vars (see `.env.example`):

| Var | What |
|---|---|
| `NEXT_PUBLIC_CHAIN_ID` | `84532` (Base Sepolia testnet) |
| `NEXT_PUBLIC_BOUNTY_ADDRESS` | `GitlawbBounty` contract address |
| `NEXT_PUBLIC_TOKEN_ADDRESS` | `GitlawbTestToken` address |
| `NEXT_PUBLIC_DID_REGISTRY_ADDRESS` | `GitlawbDIDRegistry` address |
| `NEXT_PUBLIC_RPC_URL` | Base Sepolia RPC (Alchemy / public) |
| `NEXT_PUBLIC_WSS_URL` | WebSocket RPC for live event subscription |
| `NEXT_PUBLIC_DEPLOY_BLOCK` | Contract deploy block for event scanning |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect Cloud project id |
| `GROQ_API_KEY` | Server-only · Groq Llama 3.3 70B for scout + personas |
| `CRON_SECRET` | Server-only · validates `/api/cron/snapshot` calls |
| `NEXT_PUBLIC_BASE_URL` | Optional · production canonical URL |

## Testing

```bash
pnpm test:run    # full vitest suite
pnpm lint        # eslint flat config
npx tsc --noEmit # type-check without emit
```

## Submitting changes

1. Branch from `main`.
2. Keep commits focused — one logical change per commit.
3. Run `pnpm lint && pnpm test:run` before opening a PR.
4. Reference the issue number in the commit message when applicable.

## Reporting issues

Open an issue with:

- environment (OS, browser, wallet)
- steps to reproduce
- expected vs. actual behavior
- relevant API endpoint(s) hit (paste the curl)

## Code style

- ESLint flat config (`pnpm lint`)
- TypeScript strict mode — avoid `any` without a comment explaining why
- Tailwind utility classes; design tokens live in [`app/globals.css`](./app/globals.css)
- Server routes default to `force-dynamic`; cache via `Cache-Control` headers
- No mocked data in API responses — show honest empty states instead

## Architecture pointers

- **Frontend**: `app/` (App Router) + `components/` + `hooks/` (TanStack Query)
- **API**: `app/api/*` — every page is also a JSON endpoint
- **Network layer**: `lib/gitlawb-node.ts` — typed client for `node.gitlawb.com/api/v1`
- **On-chain**: `lib/bounty/read.ts` + `lib/bounty/did-events.ts` (chunked viem reads)
- **AI**: `lib/llm/client.ts` (Groq + Anthropic fallback), `lib/llm/scout.ts`, `lib/llm/personas.ts`
- **Contracts**: `lib/contracts/addresses.ts` — env-driven, mainnet swap is 4 env vars
