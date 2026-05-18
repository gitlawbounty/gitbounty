// Groq Llama 3.3 70B client — fast + generous free tier.
// Falls back to Anthropic if GROQ_API_KEY is missing and ANTHROPIC_API_KEY is set.

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.3-70b-versatile'

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'
const ANTHROPIC_MODEL = 'claude-3-5-haiku-latest'

export interface LlmMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface LlmCallOptions {
  messages: LlmMessage[]
  responseFormat?: 'json' | 'text'
  maxTokens?: number
  temperature?: number
}

export async function llmCall(opts: LlmCallOptions): Promise<string> {
  const groqKey = process.env.GROQ_API_KEY
  const anthropicKey = process.env.ANTHROPIC_API_KEY

  if (groqKey) return callGroq(opts, groqKey)
  if (anthropicKey) return callAnthropic(opts, anthropicKey)
  throw new Error('No LLM API key configured. Set GROQ_API_KEY or ANTHROPIC_API_KEY.')
}

async function callGroq(opts: LlmCallOptions, key: string): Promise<string> {
  const body: Record<string, unknown> = {
    model: GROQ_MODEL,
    messages: opts.messages,
    max_tokens: opts.maxTokens ?? 1024,
    temperature: opts.temperature ?? 0.4,
  }
  if (opts.responseFormat === 'json') body.response_format = { type: 'json_object' }

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw new Error(`Groq API ${res.status}: ${errText.slice(0, 200)}`)
  }
  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}

async function callAnthropic(opts: LlmCallOptions, key: string): Promise<string> {
  const system = opts.messages.find((m) => m.role === 'system')?.content
  const rest = opts.messages.filter((m) => m.role !== 'system')

  const res = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      system,
      messages: rest,
      max_tokens: opts.maxTokens ?? 1024,
      temperature: opts.temperature ?? 0.4,
    }),
  })
  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw new Error(`Anthropic API ${res.status}: ${errText.slice(0, 200)}`)
  }
  const data = await res.json()
  return data.content?.[0]?.text ?? ''
}
