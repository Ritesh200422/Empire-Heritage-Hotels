/**
 * Simple in-memory rate limiter using a sliding window.
 * Per session/IP, allows a max number of requests in a time window.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

const MAX_REQUESTS = 20; // per window
const WINDOW_MS = 60 * 1000; // 1 minute

/** Clean up expired entries periodically */
setInterval(() => {
  const cutoff = Date.now() - WINDOW_MS;
  for (const [key, entry] of store.entries()) {
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
    if (entry.timestamps.length === 0) {
      store.delete(key);
    }
  }
}, 60_000);

/**
 * Check if a request is rate-limited.
 * @returns null if allowed, or { retryAfterMs } if rate-limited
 */
export function checkRateLimit(key: string): { retryAfterMs: number } | null {
  const now = Date.now();
  const cutoff = now - WINDOW_MS;

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Remove expired timestamps
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  if (entry.timestamps.length >= MAX_REQUESTS) {
    const oldestInWindow = entry.timestamps[0];
    const retryAfterMs = oldestInWindow + WINDOW_MS - now;
    return { retryAfterMs: Math.max(retryAfterMs, 1000) };
  }

  entry.timestamps.push(now);
  return null;
}
