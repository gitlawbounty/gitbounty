import { createHash } from 'node:crypto'

/** Anonymous, stable per-voter id from ip + user-agent. Not reversible to PII;
 *  used only to dedupe one vote per persona per week. */
export function voterHash(ip: string, userAgent: string): string {
  return createHash('sha256').update(`${ip}|${userAgent}`).digest('hex').slice(0, 16)
}
