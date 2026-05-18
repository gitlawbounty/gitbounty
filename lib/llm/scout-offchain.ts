import { llmCall } from './client'
import type { OffChainBounty } from '@/lib/scraper/types'
import type { ScoutAnalysis } from './scout'

const SYSTEM_PROMPT = `You are the Bounty Scout for gitbounty terminal — an ai-curated bounty marketplace built on gitlawb.

Your job: analyze off-chain bounties from gitlawb.com and produce a structured JSON insight for builders and AI agents browsing.

Output ONLY valid JSON matching this exact schema:
{
  "difficulty": "easy" | "medium" | "hard" | "legendary",
  "skills": ["string", ...],          // required tech skills (lowercase tags)
  "estimatedEffort": "1-2 hours" | "1-3 days" | "1 week" | "2+ weeks",
  "alphaRating": "underpriced" | "fair" | "overpriced",
  "alphaReason": "1-2 sentence explanation, lowercase",
  "pitfalls": ["string", ...],        // 1-3 short warnings, lowercase
  "tldr": "1-sentence summary, lowercase"
}

Rules:
- Lowercase prose. Terminal vibe. No filler.
- Off-chain bounties are denominated in $GITLAWB (gitlawb's token). Amounts: 50 = micro, 300 = small, 1k+ = medium, 10k+ = serious.
- If you don't know specific code/tech, infer from title + repo name conservatively.
- Skills are lowercase tags like "rust", "typescript", "solidity", "ci", "ipfs", "frontend".
- pitfalls: technical gotchas, not market commentary.`

export async function analyzeOffChainBounty(bounty: OffChainBounty): Promise<ScoutAnalysis> {
  const userMsg = `Analyze this off-chain bounty (from gitlawb.com network):

UUID: ${bounty.uuid}
Title: ${bounty.title}
Repository: ${bounty.repoOwner.slice(0, 12)}.../${bounty.repoName}
Reward: ${bounty.amount}
Status: ${bounty.status}
Age: ${bounty.ageLabel}

Return JSON only.`

  const raw = await llmCall({
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userMsg },
    ],
    responseFormat: 'json',
    maxTokens: 800,
    temperature: 0.35,
  })

  const parsed = JSON.parse(raw) as Omit<ScoutAnalysis, 'bountyId' | 'generatedAt'>
  return {
    bountyId: 0, // not numeric for off-chain
    ...parsed,
    generatedAt: new Date().toISOString(),
  }
}
