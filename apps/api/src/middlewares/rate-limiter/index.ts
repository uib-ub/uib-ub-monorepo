import { Context, Next } from 'hono'
import { RateLimiterMemory } from 'rate-limiter-flexible'

const rateLimiter2 = new RateLimiterMemory({
  points: 6,
  duration: 1,
})

export const rateLimiter = () => {
  return async function rateLimiter(c: Context, next: Next) {
    const ip = c.req.raw.headers.get('x-forwarded-for')
    if (!ip) {
      return next()
    }
    try {
      await rateLimiter2.consume(ip)
    } catch (e) {
      return c.text(
        'Too many requests',
        429,
      )
    }
    await next()
  }
}
