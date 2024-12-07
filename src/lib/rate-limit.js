import { LRUCache } from 'lru-cache';

// Create a new cache instance
const rateLimit = new LRUCache({
  max: 500,
  ttl: 60 * 1000, // 1 minute
});

export default async function rateLimiter(request) {
  const ip = request.headers.get('x-forwarded-for') || 'anonymous';
  const tokenCount = rateLimit.get(ip) || 0;

  if (tokenCount >= 10) {
    return false;
  }

  rateLimit.set(ip, tokenCount + 1);
  return true;
}
