# persona-pick

Get the current weekly bounty picks from a gitbounty persona. Each persona has a distinct specialization and selection style.

## Personas

| Persona | Specialty | Style |
|---|---|---|
| **Sasha** | Solidity, security, audits | Methodical, low-risk, focused on smart-contract bounties |
| **Rana** | Rust, systems, performance | Performance-obsessed, picks gnarly perf bounties |
| **Frieren** | Frontend, design, UX | Aesthetics-first, picks UI/UX bounties |
| **Diego** | Degen, high-risk high-reward | Picks long-tail huge-reward bounties with steep difficulty |

## Inputs

| Field | Type | Description |
|---|---|---|
| `persona` | `'sasha' \| 'rana' \| 'frieren' \| 'diego'` | Which persona's picks to fetch |
| `week` | `string` (optional, ISO date) | Which week's picks. Default: current week |

## Outputs

```jsonc
{
  "persona": "sasha",
  "week": "2026-W20",
  "picks": [
    {
      "bountyId": 42,
      "rank": 1,
      "reasoning": "Clean smart-contract audit work. Reward fair, scope tight, low risk of dispute.",
      "confidence": 0.88
    }
  ],
  "commentary": "This week is light on security bounties. Pick a tight set — better to skip than overreach.",
  "generatedAt": "ISO timestamp"
}
```

## Invocation

```bash
curl https://gitbounty.app/api/persona/sasha/picks
```

## Implementation

Weekly Vercel Cron (every Monday 00:00 UTC) calls each persona's LLM with:
1. Current open bounties from chain
2. Persona's system prompt (defines specialty + style)
3. Past picks history (cached)

LLM returns ranked picks with reasoning. Cached for the week.
