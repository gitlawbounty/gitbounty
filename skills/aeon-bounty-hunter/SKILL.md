---
name: Bounty Hunter
description: Discover open gitbounty bounties on the gitlawb network, scout the best fit, and draft a solution plan (read-only)
var: ""
tags: [dev, crypto]
---
> **${var}** — skill or tag to bias toward (e.g. `rust`, `frontend`). If empty, considers all open bounties.

Read `memory/MEMORY.md` for the operator's skills and interests, if present.

## What this skill optimizes for

One credible draft beats five shallow ones. Pick a single open bounty per run, scout it properly, and produce a plan a human could act on. This skill is **read-only**: it never claims or submits on-chain. It discovers, scouts, and drafts.

## Steps

1. **Discover.** Fetch open bounties from the live firehose. Use the `www` host — the bare domain 307-redirects:
   ```bash
   curl -s https://www.gitlawbounty.xyz/api/bounties-offchain
   ```
   Response: `{ meta, bounties: [...] }`. Each bounty has `uuid`, `title`, `did`, `repoOwner`, `repoName`, `amount`, `amountNumeric`, `status`, `ageLabel`, `url`, `boosted`.

   Keep only `status === "open"`. If none are open, log `BOUNTY_HUNTER_NO_OPEN` and end.

2. **Scout the shortlist.** Bias by `${var}` and `amountNumeric`, prefer `boosted: true`. For the top few, pull the LLM scout analysis (difficulty, skills, alpha, pitfalls):
   ```bash
   curl -s https://www.gitlawbounty.xyz/api/scout/offchain/<uuid>
   ```

3. **Pick one.** Best skill overlap with `${var}`, reasonable difficulty, no blocking pitfalls. If nothing fits, log `BOUNTY_HUNTER_NO_FIT` and end. Do not force a pick.

4. **Draft the solution.** The repo (`repoOwner`/`repoName`) lives on the gitlawb network; `url` is the human page on gitlawb.com. Produce:
   - root cause / what the issue asks for
   - the files you would touch and the change in each
   - a draft PR description in markdown, ready to paste
   - a confidence score 1-5 that this PR would be accepted

5. **Report.** Save the brief to `articles/bounty-hunter-${today}.md` and send it via the configured notification channel:
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

## Rules

- **Read-only.** Never call `claimBounty`, `submitBounty`, or any on-chain function. No wallet keys.
- **No fabrication.** If the firehose or scout endpoint is unreachable, log the failure and end. Never invent a bounty, reward, or plan.
- **One bounty per run.**

## Going live (later, gated)

To actually claim and earn, add an on-chain step with `@gitbounty/hunter-sdk` (extend `BountyHunter`, provide a viem `walletClient`). That needs a funded private key as a GitHub Actions secret and is a deliberate, separate decision. Keep this skill read-only until then.
