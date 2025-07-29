/**
 * Main Entry Point for Rate Limiter Service
 *
 * This file serves as the application entry point and demonstrates
 * how to use the rate limiter service in different scenarios.
 */

import dotenv from 'dotenv';
import { RateLimiterService } from './services/RateLimiterService';
import { RateLimitAlgorithm } from './types';
import app from './api';

// Load environment variables
dotenv.config();

// Example usage of the rate limiter service
async function demonstrateRateLimiter() {
  console.log('🚀 Rate Limiter Service Demo\n');

  // Create rate limiter service with default configuration
  const rateLimiter = RateLimiterService.builder()
    .withDefaultRules()
    .build();

  // Add a custom rule for premium users
  rateLimiter.addRule({
    id: 'premium-users',
    name: 'Premium User Rate Limit',
    config: {
      algorithm: RateLimitAlgorithm.TOKEN_BUCKET,
      maxRequests: 1000,
      windowSizeMs: 60000, // 1 minute
      burstSize: 100
    },
    priority: 3,
    conditions: [
      {
        field: 'identifier',
        operator: 'contains',
        value: 'premium'
      }
    ]
  });

  // Demo: Test rate limiting
  console.log('📊 Testing Rate Limiting...\n');

  const testIdentifiers = ['user123', 'premium_user456', 'api_key789'];

  for (const identifier of testIdentifiers) {
    console.log(`Testing identifier: ${identifier}`);

    // Simulate multiple requests
    for (let i = 1; i <= 5; i++) {
      const response = await rateLimiter.isAllowed({
        identifier,
        timestamp: Date.now(),
        weight: 1
      });

      console.log(`  Request ${i}: ${response.allowed ? '✅ ALLOWED' : '❌ BLOCKED'} (${response.result})`);
      console.log(`    Remaining: ${response.remainingRequests}, Reset: ${new Date(response.resetTime).toLocaleTimeString()}`);

      if (!response.allowed) {
        console.log(`    Retry after: ${response.retryAfter} seconds`);
        break;
      }
    }
    console.log('');
  }

  // Demo: Get metrics
  console.log('📈 Current Metrics:');
  const metrics = rateLimiter.getMetrics();
  console.log(JSON.stringify(metrics, null, 2));
  console.log('');

  // Demo: Get rate limit info
  console.log('ℹ️  Rate Limit Info for user123:');
  const info = await rateLimiter.getInfo('user123');
  console.log(JSON.stringify(info, null, 2));
  console.log('');

  // Demo: Reset rate limit
  console.log('🔄 Resetting rate limit for user123...');
  await rateLimiter.reset('user123');
  console.log('Rate limit reset successfully!\n');

  // Test again after reset
  const resetResponse = await rateLimiter.isAllowed({
    identifier: 'user123',
    timestamp: Date.now(),
    weight: 1
  });
  console.log(`After reset: ${resetResponse.allowed ? '✅ ALLOWED' : '❌ BLOCKED'}`);
}

// Run demo if this file is executed directly
if (require.main === module) {
  demonstrateRateLimiter().catch(console.error);
}

export { RateLimiterService };