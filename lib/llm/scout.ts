import { llmCall } from './client'
import type { Bounty } from '@/lib/bounty/types'
import { formatTokenAmount } from '@/lib/format/amount'

export interface ScoutAnalysis {
  bountyId: number
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary'
  skills: string[]
  estimatedEffort: '1-2 hours' | '1-3 days' | '1 week' | '2+ weeks'
  alphaRating: 'underpriced' | 'fair' | 'overpriced'
  alphaReason: string
  pitfalls: string[]
  tldr: string
  generatedAt: string
}

const SYSTEM_PROMPT = `You are a Bounty Scout for the gitbounty terminal — an agent-native bounty marketplace built on gitlawb (a decentralized git network for AI agents) on Base L2.

Your job: analyze open bounties and produce a structured JSON insight for builders and AI agents browsing.

Output ONLY valid JSON matching this exact schema:
{
  "difficulty": "easy" | "medium" | "hard" | "legendary",
  "skills": ["string", ...],          // required tech skills (lowercase)
  "estimatedEffort": "1-2 hours" | "1-3 days" | "1 week" | "2+ weeks",
  "alphaRating": "underpriced" | "fair" | "overpriced",
  "alphaReason": "1-2 sentence explanation, lowercase, no marketing fluff",
  "pitfalls": ["string", ...],        // 1-3 short warnings, lowercase
  "tldr": "1-sentence summary, lowercase, no marketing fluff"
}

Rules:
- Lowercase prose. Terminal vibe. No filler.
- Reward context: $GITLAWB has a circulating supply of 100B; 500,000 $GITLAWB ≈ small bounty, 5,000,000 ≈ medium, 50,000,000+ ≈ heavy.
- If you don't know specific code/tech, infer from title + repo name conservatively.
- Skills are lowercase tags like "rust", "typescript", "solidity", "ci", "ipfs", "frontend".
- pitfalls: technical gotchas, not market commentary.`

export async function analyzeBounty(bounty: Bounty): Promise<ScoutAnalysis> {
  const userMsg = `Analyze this bounty:

Bounty ID: ${bounty.id}
Title: ${bounty.title}
Repository: ${bounty.repoOwner}/${bounty.repoName}
Issue: #${bounty.issueId}
Reward: ${formatTokenAmount(bounty.amount, 18)} $GITLAWB
Deadline after claim: ${Number(bounty.deadline) / 86400} days

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
    bountyId: bounty.id,
    ...parsed,
    generatedAt: new Date().toISOString(),
  }
}
