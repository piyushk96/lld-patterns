/**
 * Rate Limiting Algorithms using Strategy Pattern
 *
 * Design Decisions:
 * 1. Strategy Pattern: Each algorithm implements the same interface
 * 2. Template Method Pattern: Common logic in base class
 * 3. Single Responsibility: Each algorithm handles one specific approach
 * 4. Open/Closed Principle: Easy to add new algorithms without modifying existing code
 */

import {
  RateLimitAlgorithm,
  RateLimitConfig,
  RateLimitRequest,
  RateLimitResponse,
  RateLimitResult,
  StorageAdapter,
  RateLimitInfo
} from '../types';

// Abstract base class for rate limiting algorithms
export abstract class BaseRateLimiter {
  protected storage: StorageAdapter;
  protected config: RateLimitConfig;

  constructor(storage: StorageAdapter, config: RateLimitConfig) {
    this.storage = storage;
    this.config = config;
  }

  abstract isAllowed(request: RateLimitRequest): Promise<RateLimitResponse>;

  protected generateKey(identifier: string): string {
    return `rate_limit:${identifier}:${this.config.algorithm}`;
  }

  protected getHeaders(remainingRequests: number, resetTime: number, retryAfter?: number): Record<string, string> {
    return {
      'X-RateLimit-Limit': this.config.maxRequests.toString(),
      'X-RateLimit-Remaining': remainingRequests.toString(),
      'X-RateLimit-Reset': resetTime.toString(),
      ...(retryAfter && { 'Retry-After': retryAfter.toString() })
    };
  }

  // Get rate limit information
  async getInfo(identifier: string): Promise<RateLimitInfo | null> {
    try {
      const key = this.generateKey(identifier);
      const data = await this.storage.get(key);

      if (!data) {
        return {
          currentRequests: 0,
          maxRequests: this.config.maxRequests,
          windowStart: Date.now(),
          windowEnd: Date.now() + this.config.windowSizeMs,
          resetTime: Date.now() + this.config.windowSizeMs
        };
      }

      // This is a simplified implementation - each algorithm would need its own logic
      return {
        currentRequests: typeof data === 'number' ? data : 0,
        maxRequests: this.config.maxRequests,
        windowStart: Date.now() - this.config.windowSizeMs,
        windowEnd: Date.now() + this.config.windowSizeMs,
        resetTime: Date.now() + this.config.windowSizeMs
      };
    } catch (error) {
      console.error('Error getting rate limit info:', error);
      return null;
    }
  }

  // Reset rate limit for an identifier
  async reset(identifier: string): Promise<void> {
    try {
      const key = this.generateKey(identifier);
      await this.storage.delete(key);
    } catch (error) {
      console.error('Error resetting rate limit:', error);
      throw error;
    }
  }
}

// Fixed Window Counter Algorithm
export class FixedWindowRateLimiter extends BaseRateLimiter {
  async isAllowed(request: RateLimitRequest): Promise<RateLimitResponse> {
    const now = Date.now();
    const windowStart = Math.floor(now / this.config.windowSizeMs) * this.config.windowSizeMs;
    const windowEnd = windowStart + this.config.windowSizeMs;
    const key = `${this.generateKey(request.identifier)}:${windowStart}`;

    const currentCount = await this.storage.get(key) || 0;
    const weight = request.weight || 1;

    if (currentCount + weight > this.config.maxRequests) {
      const remainingRequests = Math.max(0, this.config.maxRequests - currentCount);
      const retryAfter = Math.ceil((windowEnd - now) / 1000);

      return {
        allowed: false,
        result: RateLimitResult.BLOCKED,
        remainingRequests,
        resetTime: windowEnd,
        retryAfter,
        headers: this.getHeaders(remainingRequests, windowEnd, retryAfter)
      };
    }

    await this.storage.increment(key, weight);
    await this.storage.set(key, currentCount + weight, this.config.windowSizeMs);

    const remainingRequests = this.config.maxRequests - (currentCount + weight);

    return {
      allowed: true,
      result: RateLimitResult.ALLOWED,
      remainingRequests,
      resetTime: windowEnd,
      headers: this.getHeaders(remainingRequests, windowEnd)
    };
  }
}

// Sliding Window Counter Algorithm
export class SlidingWindowRateLimiter extends BaseRateLimiter {
  async isAllowed(request: RateLimitRequest): Promise<RateLimitResponse> {
    const now = Date.now();
    const windowStart = now - this.config.windowSizeMs;
    const key = this.generateKey(request.identifier);

    // Get current window data
    const windowData = await this.storage.get(key) || { requests: [], count: 0 };

    // Remove expired requests
    const validRequests = windowData.requests.filter((timestamp: number) => timestamp > windowStart);
    const currentCount = validRequests.reduce((sum: number, timestamp: number) => sum + 1, 0);

    const weight = request.weight || 1;

    if (currentCount + weight > this.config.maxRequests) {
      const oldestRequest = Math.min(...validRequests);
      const resetTime = oldestRequest + this.config.windowSizeMs;
      const remainingRequests = Math.max(0, this.config.maxRequests - currentCount);
      const retryAfter = Math.ceil((resetTime - now) / 1000);

      return {
        allowed: false,
        result: RateLimitResult.BLOCKED,
        remainingRequests,
        resetTime,
        retryAfter,
        headers: this.getHeaders(remainingRequests, resetTime, retryAfter)
      };
    }

    // Add current request
    validRequests.push(now);
    await this.storage.set(key, { requests: validRequests, count: currentCount + weight }, this.config.windowSizeMs);

    const remainingRequests = this.config.maxRequests - (currentCount + weight);
    const resetTime = now + this.config.windowSizeMs;

    return {
      allowed: true,
      result: RateLimitResult.ALLOWED,
      remainingRequests,
      resetTime,
      headers: this.getHeaders(remainingRequests, resetTime)
    };
  }
}

// Token Bucket Algorithm
export class TokenBucketRateLimiter extends BaseRateLimiter {
  async isAllowed(request: RateLimitRequest): Promise<RateLimitResponse> {
    const now = Date.now();
    const key = this.generateKey(request.identifier);
    const bucketData = await this.storage.get(key) || { tokens: this.config.burstSize || this.config.maxRequests, lastRefill: now };

    // Calculate tokens to add since last refill
    const timePassed = now - bucketData.lastRefill;
    const tokensToAdd = Math.floor(timePassed / this.config.windowSizeMs) * (this.config.maxRequests / 60); // tokens per second
    const newTokens = Math.min(this.config.burstSize || this.config.maxRequests, bucketData.tokens + tokensToAdd);

    const weight = request.weight || 1;

    if (newTokens < weight) {
      const tokensNeeded = weight - newTokens;
      const timeToWait = Math.ceil(tokensNeeded / (this.config.maxRequests / 60)) * 1000;
      const remainingRequests = Math.max(0, Math.floor(newTokens));

      return {
        allowed: false,
        result: RateLimitResult.THROTTLED,
        remainingRequests,
        resetTime: now + timeToWait,
        retryAfter: Math.ceil(timeToWait / 1000),
        headers: this.getHeaders(remainingRequests, now + timeToWait, Math.ceil(timeToWait / 1000))
      };
    }

    // Consume tokens
    const remainingTokens = newTokens - weight;
    await this.storage.set(key, { tokens: remainingTokens, lastRefill: now }, this.config.windowSizeMs * 2);

    const remainingRequests = Math.floor(remainingTokens);
    const resetTime = now + this.config.windowSizeMs;

    return {
      allowed: true,
      result: RateLimitResult.ALLOWED,
      remainingRequests,
      resetTime,
      headers: this.getHeaders(remainingRequests, resetTime)
    };
  }
}

// Leaky Bucket Algorithm
export class LeakyBucketRateLimiter extends BaseRateLimiter {
  async isAllowed(request: RateLimitRequest): Promise<RateLimitResponse> {
    const now = Date.now();
    const key = this.generateKey(request.identifier);
    const bucketData = await this.storage.get(key) || { water: 0, lastLeak: now };

    // Calculate leaked water
    const timePassed = now - bucketData.lastLeak;
    const leakRate = this.config.leakRate || (this.config.maxRequests / 60); // requests per second
    const leakedWater = Math.min(bucketData.water, timePassed * leakRate / 1000);
    const currentWater = bucketData.water - leakedWater;

    const weight = request.weight || 1;

    if (currentWater + weight > this.config.maxRequests) {
      const timeToWait = Math.ceil((weight - (this.config.maxRequests - currentWater)) / leakRate) * 1000;
      const remainingRequests = Math.max(0, this.config.maxRequests - Math.floor(currentWater));
      const resetTime = now + timeToWait;
      const retryAfter = Math.ceil((weight - (this.config.maxRequests - currentWater)) / leakRate);

      return {
        allowed: false,
        result: RateLimitResult.THROTTLED,
        remainingRequests,
        resetTime,
        retryAfter,
        headers: this.getHeaders(remainingRequests, resetTime, retryAfter)
      };
    }

    // Add water to bucket
    const newWater = currentWater + weight;
    await this.storage.set(key, { water: newWater, lastLeak: now }, this.config.windowSizeMs * 2);

    const remainingRequests = this.config.maxRequests - Math.floor(newWater);
    const resetTime = now + this.config.windowSizeMs;

    return {
      allowed: true,
      result: RateLimitResult.ALLOWED,
      remainingRequests,
      resetTime,
      headers: this.getHeaders(remainingRequests, resetTime)
    };
  }
}

// Algorithm Factory using Factory Pattern
export class RateLimiterFactory {
  static create(algorithm: RateLimitAlgorithm, storage: StorageAdapter, config: RateLimitConfig): BaseRateLimiter {
    switch (algorithm) {
      case RateLimitAlgorithm.FIXED_WINDOW:
        return new FixedWindowRateLimiter(storage, config);
      case RateLimitAlgorithm.SLIDING_WINDOW:
        return new SlidingWindowRateLimiter(storage, config);
      case RateLimitAlgorithm.TOKEN_BUCKET:
        return new TokenBucketRateLimiter(storage, config);
      case RateLimitAlgorithm.LEAKY_BUCKET:
        return new LeakyBucketRateLimiter(storage, config);
      default:
        throw new Error(`Unsupported algorithm: ${algorithm}`);
    }
  }
}