#!/usr/bin/env node
// gitbounty MCP server — exposes the gitlawbounty.xyz API as Model Context
// Protocol tools so any compliant agent (Claude Desktop, Cursor, Cline, etc.)
// can discover and use it without writing custom integration code.

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import { tools, callTool } from './tools/index.js'

const server = new Server(
  {
    name: 'gitbounty',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  },
)

// List all available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: tools.map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema,
    })),
  }
})

// Call a specific tool
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params
  try {
    const result = await callTool(name, args ?? {})
    return {
      content: [
        {
          type: 'text' as const,
          text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
        },
      ],
    }
  } catch (err) {
    return {
      isError: true,
      content: [
        {
          type: 'text' as const,
          text: `error calling ${name}: ${String(err).slice(0, 400)}`,
        },
      ],
    }
  }
})

const transport = new StdioServerTransport()
await server.connect(transport)
// stderr only — stdout is reserved for MCP JSON-RPC messages
console.error('[gitbounty mcp] server started on stdio · v0.1.0')
