/**
 * Simple Test Demo for Rate Limiter Service
 *
 * This file demonstrates the core functionality of the rate limiter
 * without external dependencies for easy testing in interviews.
 */

import { RateLimiterService } from './services/RateLimiterService';
import { RateLimitAlgorithm } from './types';

async function runDemo() {
  console.log('🚀 Rate Limiter Service Demo\n');

  // Create rate limiter with default configuration
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

  // Demo: Test different algorithms
  console.log('\n🔬 Testing Different Algorithms...\n');

  // Test Fixed Window
  const fixedWindowRule = {
    id: 'fixed-window-test',
    name: 'Fixed Window Test',
    config: {
      algorithm: RateLimitAlgorithm.FIXED_WINDOW,
      maxRequests: 3,
      windowSizeMs: 10000 // 10 seconds
    },
    priority: 1
  };

  rateLimiter.addRule(fixedWindowRule);

  console.log('Testing Fixed Window (3 requests per 10 seconds):');
  for (let i = 1; i <= 5; i++) {
    const response = await rateLimiter.isAllowed({
      identifier: 'fixed_test_user',
      timestamp: Date.now(),
      weight: 1
    });
    console.log(`  Request ${i}: ${response.allowed ? '✅ ALLOWED' : '❌ BLOCKED'}`);
  }

  // Test Token Bucket
  const tokenBucketRule = {
    id: 'token-bucket-test',
    name: 'Token Bucket Test',
    config: {
      algorithm: RateLimitAlgorithm.TOKEN_BUCKET,
      maxRequests: 2,
      windowSizeMs: 1000, // 1 second
      burstSize: 3
    },
    priority: 1
  };

  rateLimiter.removeRule('fixed-window-test');
  rateLimiter.addRule(tokenBucketRule);

  console.log('\nTesting Token Bucket (2 tokens per second, burst of 3):');
  for (let i = 1; i <= 5; i++) {
    const response = await rateLimiter.isAllowed({
      identifier: 'token_test_user',
      timestamp: Date.now(),
      weight: 1
    });
    console.log(`  Request ${i}: ${response.allowed ? '✅ ALLOWED' : '❌ BLOCKED'}`);
  }

  console.log('\n🎉 Demo completed successfully!');
}

// Run the demo
runDemo().catch(console.error);