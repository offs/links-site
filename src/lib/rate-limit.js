import { LRUCache } from 'lru-cache';

const rateLimits = {
  auth: new LRUCache({
    max: 500,
    ttl: 60 * 60 * 1000,
  }),
  api: new LRUCache({
    max: 1000,
    ttl: 60 * 1000,
  })
};

const LIMITS = {
  auth: Number(process.env.RATE_LIMIT_AUTH) || 5,
  api: Number(process.env.RATE_LIMIT_API) || 30
};

const getClientIp = (request) => {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  return forwardedFor?.split(',')[0] || realIp || 'anonymous';
};

export default async function rateLimiter(request, type = 'api') {
  if (process.env.NODE_ENV === 'development') {
    return false;
  }

  if (!rateLimits[type]) {
    throw new Error('Invalid rate limit type');
  }

  const cache = rateLimits[type];
  const limit = LIMITS[type];
  const ip = getClientIp(request);

  const tokenCount = cache.get(ip) || 0;

  if (tokenCount >= limit) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn(`Rate limit exceeded for ${ip} on ${type} endpoint`);
    }
    return true;
  }

  cache.set(ip, tokenCount + 1);
  return false;
}

export const authRateLimiter = (req) => rateLimiter(req, 'auth');
