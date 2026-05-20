import { Redis } from '@upstash/redis'

let client: Redis | null = null

/** Singleton Upstash Redis client. Throws if env is missing — no silent mock. */
export function kv(): Redis {
  if (client) return client
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) {
    throw new Error(
      'UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN not set — persona DAO store needs a real Upstash DB',
    )
  }
  client = new Redis({ url, token })
  return client
}
