/**
 * HTTP API Layer using Express and Middleware Pattern
 *
 * Design Decisions:
 * 1. Middleware Pattern: Rate limiting as Express middleware
 * 2. RESTful API: Clean, predictable endpoints
 * 3. Error Handling: Centralized error handling middleware
 * 4. Request Validation: Input validation and sanitization
 * 5. CORS and Security: Proper security headers
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { RateLimiterService } from '../services/RateLimiterService';
import { RateLimitRequest, RateLimitRule, RateLimitAlgorithm } from '../types';

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiter service instance
const rateLimiterService = RateLimiterService.builder()
  .withDefaultRules()
  .build();

// Rate limiting middleware
export const rateLimitMiddleware = (identifierExtractor?: (req: Request) => string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Extract identifier (IP, user ID, API key, etc.)
      const identifier = identifierExtractor ? identifierExtractor(req) : req.ip;

      const rateLimitRequest: RateLimitRequest = {
        identifier,
        timestamp: Date.now(),
        weight: 1
      };

      const response = await rateLimiterService.isAllowed(rateLimitRequest);

      // Add rate limit headers to response
      Object.entries(response.headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });

      if (!response.allowed) {
        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: `Too many requests. Try again in ${response.retryAfter} seconds.`,
          retryAfter: response.retryAfter,
          remainingRequests: response.remainingRequests,
          resetTime: response.resetTime
        });
      }

      next();
    } catch (error) {
      console.error('Rate limiting middleware error:', error);
      next(); // Continue on error (fail open)
    }
  };
};

// API Routes

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Rate limit check endpoint
app.post('/api/rate-limit/check', rateLimitMiddleware(), async (req: Request, res: Response) => {
  try {
    const { identifier, weight = 1 } = req.body;

    if (!identifier) {
      return res.status(400).json({ error: 'Identifier is required' });
    }

    const rateLimitRequest: RateLimitRequest = {
      identifier,
      timestamp: Date.now(),
      weight
    };

    const response = await rateLimiterService.isAllowed(rateLimitRequest);

    // Add rate limit headers
    Object.entries(response.headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    res.json({
      allowed: response.allowed,
      result: response.result,
      remainingRequests: response.remainingRequests,
      resetTime: response.resetTime,
      retryAfter: response.retryAfter
    });
  } catch (error) {
    console.error('Rate limit check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get rate limit info
app.get('/api/rate-limit/info/:identifier', async (req: Request, res: Response) => {
  try {
    const { identifier } = req.params;
    const info = await rateLimiterService.getInfo(identifier);

    if (!info) {
      return res.status(404).json({ error: 'Rate limit info not found' });
    }

    res.json(info);
  } catch (error) {
    console.error('Get rate limit info error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset rate limit
app.delete('/api/rate-limit/reset/:identifier', async (req: Request, res: Response) => {
  try {
    const { identifier } = req.params;
    await rateLimiterService.reset(identifier);
    res.json({ message: 'Rate limit reset successfully' });
  } catch (error) {
    console.error('Reset rate limit error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get metrics
app.get('/api/metrics', (req: Request, res: Response) => {
  try {
    const metrics = rateLimiterService.getMetrics();
    res.json(metrics);
  } catch (error) {
    console.error('Get metrics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset metrics
app.delete('/api/metrics', (req: Request, res: Response) => {
  try {
    rateLimiterService.resetMetrics();
    res.json({ message: 'Metrics reset successfully' });
  } catch (error) {
    console.error('Reset metrics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Manage rules
app.get('/api/rules', (req: Request, res: Response) => {
  try {
    const rules = rateLimiterService.getRules();
    res.json(rules);
  } catch (error) {
    console.error('Get rules error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/rules', (req: Request, res: Response) => {
  try {
    const rule: RateLimitRule = req.body;

    // Validate required fields
    if (!rule.id || !rule.name || !rule.config) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    rateLimiterService.addRule(rule);
    res.status(201).json({ message: 'Rule added successfully', rule });
  } catch (error) {
    console.error('Add rule error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/rules/:ruleId', (req: Request, res: Response) => {
  try {
    const { ruleId } = req.params;
    const removed = rateLimiterService.removeRule(ruleId);

    if (!removed) {
      return res.status(404).json({ error: 'Rule not found' });
    }

    res.json({ message: 'Rule removed successfully' });
  } catch (error) {
    console.error('Remove rule error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Rate Limiter Service running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`API docs: http://localhost:${PORT}/api`);
  });
}

export default app;