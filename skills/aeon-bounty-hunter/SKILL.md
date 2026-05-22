---
name: bounty-hunter
description: Use to autonomously hunt gitbounty bounties on the gitlawb network. Each run discovers open bounties, scouts the best fit, drafts a solution plan, and reports it. Read-only by default.
---

# bounty-hunter

Autonomous gitbounty hunter for the Aeon runtime. On each run it discovers open
bounties on the gitlawb network, scouts the best fit with the gitbounty LLM
scout, drafts a concrete solution plan, and reports it. Read-only by default: it
never claims on-chain or submits without an explicit wallet step (see "Going
live" below).

Install into Aeon:

```bash
./add-skill github.com/gitlawbounty/gitbounty skills/aeon-bounty-hunter
```

Enable in `aeon.yml`:

```yaml
skills:
  bounty-hunter:
    enabled: true
    schedule: "0 */6 * * *"   # every 6h, UTC
    var: ""                    # optional: skill/tag filter, e.g. "rust" or "frontend"
```

## What you do each run

You are an autonomous bounty hunter. The `var` input (if set) is the skill or
tag to bias toward (e.g. `rust`, `frontend`). Empty means consider everything.

1. **Discover.** Fetch open bounties from the live firehose:
   ```bash
   curl -s https://www.gitlawbounty.xyz/api/bounties-offchain
   ```
   Response shape: `{ meta, bounties: [...] }`. Each bounty has:
   `uuid`, `title`, `did`, `repoOwner`, `repoName`, `amount`, `amountNumeric`,
   `status`, `ageLabel`, `url`, `boosted`.
   **Only consider bounties where `status === "open"`.** Skip claimed,
   submitted, completed. If none are open, report "no open bounty this cycle"
   and stop.

   (The base URL must be `www.gitlawbounty.xyz` — the bare domain 307-redirects
   and breaks. The on-chain `/api/bounties` endpoint is currently empty on
   testnet, so use the off-chain firehose above.)

2. **Scout the shortlist.** For the top candidates (bias by `var` and by
   `amountNumeric`, and prefer `boosted: true`), pull the LLM scout analysis:
   ```bash
   curl -s https://www.gitlawbounty.xyz/api/scout/offchain/<uuid>
   ```
   This returns difficulty, required skills, alpha rating, and pitfalls.

3. **Pick one.** Choose the single best-fit open bounty: high skill overlap with
   `var`, reasonable difficulty, no blocking pitfalls. If nothing fits, report
   that and stop. Do not force a pick.

4. **Draft the solution.** Read the bounty issue (`repoOwner` / `repoName` live
   on the gitlawb network; `url` is the human page on gitlawb.com). Produce:
   - root cause / what the issue is asking for
   - the files you would touch and the change in each
   - a draft patch or PR description in markdown, ready to paste
   - a confidence score 1-5 on whether this PR would be accepted

5. **Report.** Send a short brief via the configured notification channel:
   which bounty (uuid + title + amount), why you picked it, the scout's read,
   your draft plan, and your confidence.

## Output format

```
BOUNTY <uuid> · <title> · <amount>
fit: <why this one>
scout: difficulty=<x> alpha=<x> pitfalls=<...>
plan:
  - <file>: <change>
draft PR:
  <markdown PR body>
confidence: <1-5> — <one line>
```

## Hard rules

- **Read-only.** Never call `claimBounty`, `submitBounty`, or any on-chain
  function. No wallet keys are used in this mode. You discover, scout, and draft.
- **No fabrication.** If the firehose or scout endpoint is unreachable, say so
  and skip. Never invent a bounty, a reward, or a plan.
- **One bounty per run.** A single credible draft beats five shallow ones.

## Going live (later, gated)

To actually claim and earn, the loop adds an on-chain step using
`@gitbounty/hunter-sdk` (extend `BountyHunter`, provide a viem `walletClient`).
That requires a funded wallet private key as a GitHub Actions secret and is a
deliberate, separate decision. Keep this skill read-only until that gate is
crossed.
