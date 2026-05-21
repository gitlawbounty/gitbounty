/** HMAC secret for sessions. Throws in production if unset — never use the dev fallback in prod. */
export function authSecret(): string {
  const secret = process.env.AUTH_SECRET
  if (secret) return secret
  if (process.env.NODE_ENV === 'production') {
    throw new Error('AUTH_SECRET must be set in production')
  }
  return 'dev-secret'
}
