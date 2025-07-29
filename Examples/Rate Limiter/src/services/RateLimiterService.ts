/**
 * Main Rate Limiter Service using Facade Pattern
 *
 * Design Decisions:
 * 1. Facade Pattern: Simplifies complex interactions between algorithms, storage, and rules
 * 2. Chain of Responsibility: Multiple rules can be applied in sequence
 * 3. Observer Pattern: Metrics collection and monitoring
 * 4. Singleton Pattern: Single instance for the entire application
 * 5. Builder Pattern: Easy configuration of rate limiter instances
 */

import {
  RateLimitAlgorithm,
  RateLimitConfig,
  RateLimitRequest,
  RateLimitResponse,
  RateLimitResult,
  RateLimitRule,
  RateLimitInfo,
  RateLimitMetrics,
  StorageAdapter
} from '../types';
import { RateLimiterFactory } from '../algorithms';
import { StorageFactory, StorageType } from '../storage';

export class RateLimiterService {
  private static instance: RateLimiterService;
  private storage: StorageAdapter;
  private rules: Map<string, RateLimitRule> = new Map();
  private metrics: RateLimitMetrics = {
    totalRequests: 0,
    allowedRequests: 0,
    blockedRequests: 0,
    throttledRequests: 0,
    averageResponseTime: 0,
    errorRate: 0
  };
  private responseTimes: number[] = [];

  private constructor(storageType: StorageType = StorageType.MEMORY, config?: any) {
    this.storage = StorageFactory.create(storageType, config);
  }

  // Singleton Pattern
  static getInstance(storageType?: StorageType, config?: any): RateLimiterService {
    if (!RateLimiterService.instance) {
      RateLimiterService.instance = new RateLimiterService(storageType, config);
    }
    return RateLimiterService.instance;
  }

  // Builder Pattern for easy configuration
  static builder(): RateLimiterBuilder {
    return new RateLimiterBuilder();
  }

  // Add rate limiting rule
  addRule(rule: RateLimitRule): void {
    this.rules.set(rule.id, rule);
  }

  // Remove rate limiting rule
  removeRule(ruleId: string): boolean {
    return this.rules.delete(ruleId);
  }

  // Get all rules
  getRules(): RateLimitRule[] {
    return Array.from(this.rules.values()).sort((a, b) => b.priority - a.priority);
  }

  // Main rate limiting logic
  async isAllowed(request: RateLimitRequest): Promise<RateLimitResponse> {
    const startTime = Date.now();

    try {
      // Find applicable rules
      const applicableRules = this.findApplicableRules(request);

      if (applicableRules.length === 0) {
        // No rules apply, allow the request
        return this.createAllowedResponse(request);
      }

      // Apply rules in priority order (highest priority first)
      for (const rule of applicableRules) {
        const rateLimiter = RateLimiterFactory.create(
          rule.config.algorithm,
          this.storage,
          rule.config
        );

        const response = await rateLimiter.isAllowed(request);

        if (!response.allowed) {
          this.updateMetrics(response.result, Date.now() - startTime);
          return response;
        }
      }

      // All rules passed
      const response = this.createAllowedResponse(request);
      this.updateMetrics(response.result, Date.now() - startTime);
      return response;

    } catch (error) {
      console.error('Rate limiting error:', error);
      this.updateMetrics(RateLimitResult.BLOCKED, Date.now() - startTime);

      // Fail open - allow request on error
      return this.createAllowedResponse(request);
    }
  }

  // Get rate limit information for an identifier
  async getInfo(identifier: string): Promise<RateLimitInfo | null> {
    try {
      const rules = this.getRules();
      if (rules.length === 0) return null;

      // Use the highest priority rule for info
      const rule = rules[0];
      if (!rule) return null;

      const rateLimiter = RateLimiterFactory.create(
        rule.config.algorithm,
        this.storage,
        rule.config
      );

      return await rateLimiter.getInfo(identifier);
    } catch (error) {
      console.error('Error getting rate limit info:', error);
      return null;
    }
  }

  // Reset rate limit for an identifier
  async reset(identifier: string): Promise<void> {
    try {
      const rules = this.getRules();
      for (const rule of rules) {
        if (!rule) continue;

        const rateLimiter = RateLimiterFactory.create(
          rule.config.algorithm,
          this.storage,
          rule.config
        );
        await rateLimiter.reset(identifier);
      }
    } catch (error) {
      console.error('Error resetting rate limit:', error);
      throw error;
    }
  }

  // Get metrics
  getMetrics(): RateLimitMetrics {
    return { ...this.metrics };
  }

  // Reset metrics
  resetMetrics(): void {
    this.metrics = {
      totalRequests: 0,
      allowedRequests: 0,
      blockedRequests: 0,
      throttledRequests: 0,
      averageResponseTime: 0,
      errorRate: 0
    };
    this.responseTimes = [];
  }

  // Find rules that apply to the request
  private findApplicableRules(request: RateLimitRequest): RateLimitRule[] {
    return this.getRules().filter(rule => {
      if (!rule.conditions || rule.conditions.length === 0) {
        return true; // No conditions means rule applies to all requests
      }

      return rule.conditions.every(condition => {
        // For now, we'll use a simple identifier-based condition
        // In a real implementation, you'd extract fields from the request
        if (condition.field === 'identifier') {
          switch (condition.operator) {
            case 'equals':
              return request.identifier === condition.value;
            case 'contains':
              return typeof condition.value === 'string' &&
                     request.identifier.includes(condition.value);
            case 'in':
              return Array.isArray(condition.value) &&
                     condition.value.includes(request.identifier);
            default:
              return false;
          }
        }
        return false;
      });
    });
  }

  // Create allowed response
  private createAllowedResponse(request: RateLimitRequest): RateLimitResponse {
    return {
      allowed: true,
      result: RateLimitResult.ALLOWED,
      remainingRequests: 999, // Default for no rules
      resetTime: Date.now() + 60000, // 1 minute from now
      headers: {
        'X-RateLimit-Limit': '999',
        'X-RateLimit-Remaining': '999',
        'X-RateLimit-Reset': (Date.now() + 60000).toString()
      }
    };
  }

  // Update metrics
  private updateMetrics(result: RateLimitResult, responseTime: number): void {
    this.metrics.totalRequests++;
    this.responseTimes.push(responseTime);

    switch (result) {
      case RateLimitResult.ALLOWED:
        this.metrics.allowedRequests++;
        break;
      case RateLimitResult.BLOCKED:
        this.metrics.blockedRequests++;
        break;
      case RateLimitResult.THROTTLED:
        this.metrics.throttledRequests++;
        break;
    }

    // Calculate average response time (keep last 1000 requests)
    if (this.responseTimes.length > 1000) {
      this.responseTimes = this.responseTimes.slice(-1000);
    }
    this.metrics.averageResponseTime = this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;

    // Calculate error rate
    const totalErrors = this.metrics.blockedRequests + this.metrics.throttledRequests;
    this.metrics.errorRate = this.metrics.totalRequests > 0 ? totalErrors / this.metrics.totalRequests : 0;
  }
}

// Builder Pattern for RateLimiterService
export class RateLimiterBuilder {
  private storageType: StorageType = StorageType.MEMORY;
  private storageConfig: any = {};
  private rules: RateLimitRule[] = [];

  withStorage(type: StorageType, config?: any): RateLimiterBuilder {
    this.storageType = type;
    this.storageConfig = config || {};
    return this;
  }

  withRule(rule: RateLimitRule): RateLimiterBuilder {
    this.rules.push(rule);
    return this;
  }

  withDefaultRules(): RateLimiterBuilder {
    // Add some default rules
    this.rules.push(
      {
        id: 'default-api',
        name: 'Default API Rate Limit',
        config: {
          algorithm: RateLimitAlgorithm.SLIDING_WINDOW,
          maxRequests: 100,
          windowSizeMs: 60000 // 1 minute
        },
        priority: 1
      },
      {
        id: 'burst-protection',
        name: 'Burst Protection',
        config: {
          algorithm: RateLimitAlgorithm.TOKEN_BUCKET,
          maxRequests: 10,
          windowSizeMs: 1000, // 1 second
          burstSize: 5
        },
        priority: 2
      }
    );
    return this;
  }

  build(): RateLimiterService {
    const service = RateLimiterService.getInstance(this.storageType, this.storageConfig);

    // Add rules
    for (const rule of this.rules) {
      service.addRule(rule);
    }

    return service;
  }
}