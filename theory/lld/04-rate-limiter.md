# Rate Limiter

## Requirements

- Limit how many requests a client can make in a given time period; reject (or queue) requests beyond the limit.
- Implement it three ways — **Token Bucket**, **Leaky Bucket**, **Sliding Window Counter** — because "which algorithm and why" is the actual question being asked, not "can you write one rate limiter."

## Comparison: Which One and Why

| | Token Bucket | Leaky Bucket | Sliding Window Counter |
|---|---|---|---|
| **Definition** | A bucket holds up to `capacity` tokens, refilling at a fixed rate; each request consumes one token. | Requests fill a bucket that drains ("leaks") at a constant rate; a request is rejected if the bucket would overflow. | Approximates a true sliding window using two fixed-window counters (current + previous) weighted by how far into the current window you are. |
| **Allows bursts?** | Yes — up to `capacity` requests can fire instantly if tokens have accumulated. | No — output is smoothed to a constant rate regardless of input burstiness; this is the point (traffic *shaping*, not just limiting). | Small bursts near a window boundary are smoothed out — this is exactly the flaw Fixed-Window has that Sliding Window Counter fixes. |
| **Memory per client** | O(1) — token count + timestamp. | O(1) — water level + timestamp. | O(1) — two counters + window start. |
| **Signal words / use case** | "allow occasional bursts", API gateways (Stripe, AWS API Gateway) | "smooth outgoing traffic to a fragile downstream", network traffic shaping | "accurate approximation with O(1) memory", the default choice for most API rate limiters (Cloudflare, Kong) |

## Class Design Rationale

- All three share the shape `boolean allowRequest()` but have **no common interface** in this file — resist the urge to force one; the classic mistake is designing an abstraction before you understand what varies. In a real system you'd extract an interface once you decide you actually need to swap implementations at runtime.
- Each limiter is **stateful and not thread-safe by default** — every method is `synchronized` because a rate limiter that isn't safe under concurrent calls is a rate limiter that doesn't actually limit anything. This is a good example of a "handle edge cases" moment worth saying out loud in the interview.

```java
public class RateLimiterDemo {

    public static class TokenBucketLimiter {
        private final double capacity;
        private final double refillRatePerSecond;
        private double tokens;
        private long lastRefillNanos = System.nanoTime();

        public TokenBucketLimiter(double capacity, double refillRatePerSecond) {
            this.capacity = capacity;
            this.refillRatePerSecond = refillRatePerSecond;
            this.tokens = capacity; // start full — allows an initial burst up to capacity
        }

        public synchronized boolean allowRequest() {
            refill();
            if (tokens >= 1) {
                tokens -= 1;
                return true;
            }
            return false;
        }

        private void refill() {
            long now = System.nanoTime();
            double elapsedSeconds = (now - lastRefillNanos) / 1_000_000_000.0;
            tokens = Math.min(capacity, tokens + elapsedSeconds * refillRatePerSecond);
            lastRefillNanos = now;
        }
    }

    public static class LeakyBucketLimiter {
        private final double capacity;
        private final double leakRatePerSecond;
        private double currentLevel = 0;
        private long lastLeakNanos = System.nanoTime();

        public LeakyBucketLimiter(double capacity, double leakRatePerSecond) {
            this.capacity = capacity;
            this.leakRatePerSecond = leakRatePerSecond;
        }

        public synchronized boolean allowRequest() {
            leak();
            if (currentLevel + 1 <= capacity) {
                currentLevel += 1;
                return true;
            }
            return false;
        }

        private void leak() {
            long now = System.nanoTime();
            double elapsedSeconds = (now - lastLeakNanos) / 1_000_000_000.0;
            currentLevel = Math.max(0, currentLevel - elapsedSeconds * leakRatePerSecond);
            lastLeakNanos = now;
        }
    }

    public static class SlidingWindowCounterLimiter {
        private final long windowSizeMs;
        private final int limit;
        private long currentWindowStart;
        private int currentCount = 0;
        private int previousCount = 0;

        public SlidingWindowCounterLimiter(long windowSizeMs, int limit) {
            this.windowSizeMs = windowSizeMs;
            this.limit = limit;
            this.currentWindowStart = currentWindowMs();
        }

        private long currentWindowMs() {
            long now = System.currentTimeMillis();
            return now - (now % windowSizeMs);
        }

        public synchronized boolean allowRequest() {
            long now = System.currentTimeMillis();
            long windowStart = now - (now % windowSizeMs);

            if (windowStart != currentWindowStart) {
                // Only carry currentCount into previousCount if exactly one window elapsed;
                // if more time passed (client was idle), there's no meaningful "previous" activity.
                previousCount = (windowStart - currentWindowStart == windowSizeMs) ? currentCount : 0;
                currentCount = 0;
                currentWindowStart = windowStart;
            }

            double elapsedInCurrentWindow = now - currentWindowStart;
            double weightOfPreviousWindow = (windowSizeMs - elapsedInCurrentWindow) / (double) windowSizeMs;
            double estimatedRequests = previousCount * weightOfPreviousWindow + currentCount;

            if (estimatedRequests + 1 <= limit) {
                currentCount++;
                return true;
            }
            return false;
        }
    }

    public static void main(String[] args) throws InterruptedException {
        TokenBucketLimiter tokenBucket = new TokenBucketLimiter(5, 1); // burst of 5, refill 1/sec
        int allowed = 0;
        for (int i = 0; i < 8; i++) {
            if (tokenBucket.allowRequest()) allowed++;
        }
        System.out.println("Token bucket allowed " + allowed + " of 8 instant requests (capacity 5)");

        LeakyBucketLimiter leakyBucket = new LeakyBucketLimiter(5, 1); // capacity 5, leaks 1/sec
        allowed = 0;
        for (int i = 0; i < 8; i++) {
            if (leakyBucket.allowRequest()) allowed++;
        }
        System.out.println("Leaky bucket allowed " + allowed + " of 8 instant requests (capacity 5)");

        SlidingWindowCounterLimiter slidingWindow = new SlidingWindowCounterLimiter(1000, 5);
        allowed = 0;
        for (int i = 0; i < 8; i++) {
            if (slidingWindow.allowRequest()) allowed++;
        }
        System.out.println("Sliding window allowed " + allowed + " of 8 instant requests (limit 5 per second)");
    }
}
```

## What Interviewers Probe Next

- "This is per-instance — how does it work across multiple API server nodes?" → State must move to a shared store (Redis) with an atomic increment/compare (e.g., a Lua script for token bucket logic, or `INCR` + `EXPIRE` for fixed/sliding window) — a single JVM's `synchronized` doesn't help across machines at all.
- "What happens right at a token bucket's refill boundary under heavy concurrent load?" → Discuss whether slightly-stale reads of `tokens` are acceptable (usually yes, rate limiting tolerates approximate enforcement) versus needing strict atomicity.
- "Support different limits per API endpoint or per user tier." → Key the limiter instances by `(userId, endpoint)` in a map, same shape as the per-client extension in [01-parking-lot.md](01-parking-lot.md)'s `SpotAllocationStrategy` discussion — parameterize, don't hardcode.
- "Why would you ever pick Leaky Bucket over Token Bucket?" → When the *downstream* system (not the client) can't handle bursts — e.g., smoothing writes into a fragile legacy system — because Leaky Bucket enforces a constant output rate regardless of input pattern, while Token Bucket happily forwards a burst through.
