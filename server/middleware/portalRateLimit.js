const rateBuckets = new Map();

const pruneBucket = (timestamps, windowMs) => {
  const cutoff = Date.now() - windowMs;
  while (timestamps.length && timestamps[0] < cutoff) {
    timestamps.shift();
  }
};

const portalRateLimit = (req, res, next) => {
  const token = req.params.token;
  const windowMs = 60 * 60 * 1000;
  const maxRequests = 20;
  const now = Date.now();

  if (!rateBuckets.has(token)) {
    rateBuckets.set(token, []);
  }

  const timestamps = rateBuckets.get(token);
  pruneBucket(timestamps, windowMs);

  if (timestamps.length >= maxRequests) {
    return res.status(429).json({
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many requests from this portal link. Try again later.',
      },
    });
  }

  timestamps.push(now);
  next();
};

module.exports = portalRateLimit;
