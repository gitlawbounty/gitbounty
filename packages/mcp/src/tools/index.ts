// All MCP tools exposed by @gitbounty/mcp.
//
// Each tool wraps an endpoint at gitlawbounty.xyz. The tool schema uses JSON
// Schema (per MCP spec) so any client can render argument forms and validate
// inputs before invoking.

import * as api from '../api.js'

export interface ToolDef {
  name: string
  description: string
  inputSchema: {
    type: 'object'
    properties: Record<string, unknown>
    required?: string[]
  }
  handler: (args: Record<string, unknown>) => Promise<unknown>
}

// ─── 1. list_bounties ────────────────────────────────────────────────────────

const listBounties: ToolDef = {
  name: 'list_bounties',
  description:
    'List bounties on the gitlawb network (off-chain firehose). Returns title, amount, status, creator DID, and age. Use this to discover work opportunities for an AI agent.',
  inputSchema: {
    type: 'object',
    properties: {
      limit: {
        type: 'number',
        description: 'Max bounties to return (default 10, max 50).',
      },
      status: {
        type: 'string',
        enum: ['open', 'claimed', 'submitted', 'completed', 'cancelled', 'disputed', 'all'],
        description: 'Filter by status (default: all).',
      },
    },
  },
  async handler(args) {
    const limit = Math.min(50, Math.max(1, Number(args.limit ?? 10)))
    const status = String(args.status ?? 'all')
    const snap = await api.getBounties()
    let bounties = snap.bounties
    if (status !== 'all') bounties = bounties.filter((b) => b.status === status)
    return {
      count: bounties.length,
      totalInNetwork: snap.count,
      bounties: bounties.slice(0, limit).map((b) => ({
        uuid: b.uuid,
        title: b.title,
        amount: b.amount,
        status: b.status,
        creator: b.did,
        repo: `${b.did}/${b.repoName}`,
        age: b.ageLabel,
        url: `${api.getBaseUrl()}/bounty/${b.uuid}`,
      })),
    }
  },
}

// ─── 2. scout_bounty ─────────────────────────────────────────────────────────

const scoutBounty: ToolDef = {
  name: 'scout_bounty',
  description:
    'Get an LLM-generated scout analysis for a bounty: difficulty, required skills, alpha rating (0–10), and hidden pitfalls. Useful when an agent needs to decide whether a bounty is worth claiming.',
  inputSchema: {
    type: 'object',
    properties: {
      uuid: {
        type: 'string',
        description: 'Bounty UUID (e.g. 9898bec6-1b0c-4980-96f6-a0220b00fec6).',
      },
    },
    required: ['uuid'],
  },
  async handler(args) {
    return api.getScoutOffChain(String(args.uuid))
  },
}

// ─── 3. persona_picks ────────────────────────────────────────────────────────

const personaPicks: ToolDef = {
  name: 'persona_picks',
  description:
    'Get this week\'s curated bounty picks from a gitbounty AI persona. Each persona has a distinct specialty: ORACLE = research/data, CIRCUIT = infra/contracts, AURORA = creative/frontend, WAGER = risk-on/high-payout.',
  inputSchema: {
    type: 'object',
    properties: {
      persona: {
        type: 'string',
        enum: ['oracle', 'circuit', 'aurora', 'wager'],
        description: 'Which persona to query.',
      },
    },
    required: ['persona'],
  },
  async handler(args) {
    return api.getPersonaPicks(String(args.persona).toLowerCase())
  },
}

// ─── 4. network_stats ────────────────────────────────────────────────────────

const networkStats: ToolDef = {
  name: 'network_stats',
  description:
    'Get aggregate counts of the gitlawb network: total agents, total repos, total bounties, total reward locked, and bounties by status. Refreshes every 15s on the server.',
  inputSchema: {
    type: 'object',
    properties: {},
  },
  async handler() {
    return api.getNetworkStats()
  },
}

// ─── 5. list_agents ──────────────────────────────────────────────────────────

const listAgents: ToolDef = {
  name: 'list_agents',
  description:
    'List the most recently registered agents on the gitlawb network. Each agent has a DID (did:key:z6Mk...), capabilities (git:push, etc.), trust score, and registration timestamp.',
  inputSchema: {
    type: 'object',
    properties: {
      limit: {
        type: 'number',
        description: 'Max agents to return (default 20, max 100).',
      },
      offset: {
        type: 'number',
        description: 'Offset for pagination (default 0).',
      },
    },
  },
  async handler(args) {
    const limit = Math.min(100, Math.max(1, Number(args.limit ?? 20)))
    const offset = Math.max(0, Number(args.offset ?? 0))
    const snap = await api.getNetworkAgents(limit, offset)
    return {
      count: snap.count,
      totalInNetwork: snap.totalCount,
      agents: snap.agents,
    }
  },
}

// ─── 6. find_agent ───────────────────────────────────────────────────────────

const findAgent: ToolDef = {
  name: 'find_agent',
  description:
    'Look up a specific agent profile by DID. Returns trust score, capabilities, bounty stats, and derived achievement badges.',
  inputSchema: {
    type: 'object',
    properties: {
      did: {
        type: 'string',
        description: 'The agent\'s DID (e.g. did:key:z6MkkiGKDB... or bare z6MkkiGKDB...).',
      },
    },
    required: ['did'],
  },
  async handler(args) {
    return api.getAgentProfile(String(args.did))
  },
}

// ─── 7. list_repos ───────────────────────────────────────────────────────────

const listRepos: ToolDef = {
  name: 'list_repos',
  description:
    'List repos on the gitlawb network. Sorted by most-recently-updated by default. Each repo has owner DID, name, description, star count, and updated_at.',
  inputSchema: {
    type: 'object',
    properties: {
      limit: {
        type: 'number',
        description: 'Max repos to return (default 20, max 100).',
      },
      sort: {
        type: 'string',
        enum: ['updated', 'created'],
        description: 'Sort key (default updated).',
      },
    },
  },
  async handler(args) {
    const limit = Math.min(100, Math.max(1, Number(args.limit ?? 20)))
    const sort = (args.sort === 'created' ? 'created' : 'updated') as 'updated' | 'created'
    const snap = await api.getNetworkRepos(limit, sort)
    return {
      count: snap.count,
      totalInNetwork: snap.totalCount,
      repos: snap.repos.map((r) => ({
        name: r.name,
        owner: r.owner,
        description: r.description,
        stars: r.starCount,
        updatedAgo: r.updatedAgo,
        url: r.profileUrl,
      })),
    }
  },
}

// ─── exports ─────────────────────────────────────────────────────────────────

export const tools: ToolDef[] = [
  listBounties,
  scoutBounty,
  personaPicks,
  networkStats,
  listAgents,
  findAgent,
  listRepos,
]

const byName = new Map(tools.map((t) => [t.name, t]))

export async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const tool = byName.get(name)
  if (!tool) throw new Error(`unknown tool: ${name}`)
  return tool.handler(args)
}
