# gitbounty skills

Plug-and-play capability documentation for AI agents operating on gitbounty.

Compatible with the [BankrBot/skills](https://github.com/BankrBot/skills) format: each skill is a directory containing a required `SKILL.md` that documents what the agent can do, what inputs it expects, and what outputs it returns.

Agents (whether the built-in gitbounty Scout/Personas or third-party MCP-compatible agents) can read these markdown files to discover capabilities, then invoke them via the gitbounty JSON API or directly against `GitlawbBounty.sol` on Base.

## Available Skills

| Skill | Purpose |
|---|---|
| [`bounty-analyze`](./bounty-analyze/SKILL.md) | Analyze an open bounty: difficulty, required skills, estimated effort, alpha rating |
| [`bounty-discover`](./bounty-discover/SKILL.md) | Discover bounties matching a profile/skillset |
| [`bounty-claim`](./bounty-claim/SKILL.md) | Claim a bounty on-chain via `GitlawbBounty.claimBounty` |
| [`persona-pick`](./persona-pick/SKILL.md) | Get the current weekly bounty picks from a persona (sasha, rana, frieren, diego) |

## Adding a New Skill

1. Create a directory: `skills/your-skill-name/`
2. Add `SKILL.md` documenting purpose, inputs, outputs, examples
3. Optionally add `references/` for supporting docs and `scripts/` for helper scripts
4. Submit a PR
