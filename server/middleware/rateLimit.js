const rateLimitStore = new Map();

const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100;

export const rateLimit = (req, res, next) => {
  const identifier = req.ip;
  const now = Date.now();

  if (!rateLimitStore.has(identifier)) {
    rateLimitStore.set(identifier, { requests: [], lastCleanup: now });
  }

  const data = rateLimitStore.get(identifier);

  // Clean up old requests
  if (now - data.lastCleanup > RATE_LIMIT_WINDOW) {
    data.requests = data.requests.filter(
      (timestamp) => now - timestamp < RATE_LIMIT_WINDOW
    );
    data.lastCleanup = now;
  }

  if (data.requests.length >= MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({
      error: {
        message: 'Rate limit exceeded',
        retryAfter: RATE_LIMIT_WINDOW / 1000
      }
    });
  }

  data.requests.push(now);
  next();
};
