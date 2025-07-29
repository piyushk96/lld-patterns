/**
 * Core types and interfaces for the Rate Limiter Service
 *
 * Design Decisions:
 * 1. Using interfaces for loose coupling and testability
 * 2. Strict typing for better error handling and IDE support
 * 3. Enums for rate limit algorithms to ensure type safety
 * 4. Generic types for flexibility across different storage backends
 */

export enum RateLimitAlgorithm {
  FIXED_WINDOW = 'FIXED_WINDOW',
  SLIDING_WINDOW = 'SLIDING_WINDOW',
  LEAKY_BUCKET = 'LEAKY_BUCKET',
  TOKEN_BUCKET = 'TOKEN_BUCKET'
}

export enum RateLimitResult {
  ALLOWED = 'ALLOWED',
  BLOCKED = 'BLOCKED',
  THROTTLED = 'THROTTLED'
}

export interface RateLimitConfig {
  algorithm: RateLimitAlgorithm;
  maxRequests: number;
  windowSizeMs: number;
  burstSize?: number; // For token bucket
  leakRate?: number;  // For leaky bucket
}

export interface RateLimitRequest {
  identifier: string; // User ID, IP, API Key, etc.
  timestamp: number;
  weight?: number; // Request weight (default: 1)
}

export interface RateLimitResponse {
  allowed: boolean;
  result: RateLimitResult;
  remainingRequests: number;
  resetTime: number;
  retryAfter?: number; // Seconds to wait before retry
  headers: Record<string, string>;
}

export interface RateLimitInfo {
  currentRequests: number;
  maxRequests: number;
  windowStart: number;
  windowEnd: number;
  resetTime: number;
}

export interface StorageAdapter<T = any> {
  get(key: string): Promise<T | null>;
  set(key: string, value: T, ttlMs?: number): Promise<void>;
  increment(key: string, amount?: number): Promise<number>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}

export interface RateLimiter {
  isAllowed(request: RateLimitRequest): Promise<RateLimitResponse>;
  getInfo(identifier: string): Promise<RateLimitInfo | null>;
  reset(identifier: string): Promise<void>;
}

export interface RateLimitRule {
  id: string;
  name: string;
  config: RateLimitConfig;
  priority: number;
  conditions?: RateLimitCondition[];
}

export interface RateLimitCondition {
  field: string; // 'ip', 'user_id', 'endpoint', etc.
  operator: 'equals' | 'contains' | 'regex' | 'in';
  value: string | string[];
}

export interface RateLimitMetrics {
  totalRequests: number;
  allowedRequests: number;
  blockedRequests: number;
  throttledRequests: number;
  averageResponseTime: number;
  errorRate: number;
}