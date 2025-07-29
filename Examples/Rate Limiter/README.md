# Rate Limiter Service - System Design

A comprehensive, production-ready rate limiter service built in TypeScript with multiple algorithms and design patterns.

## 🏗️ System Architecture

### Design Patterns Used

1. **Strategy Pattern**: Different rate limiting algorithms (Fixed Window, Sliding Window, Token Bucket, Leaky Bucket)
2. **Factory Pattern**: Easy creation of storage adapters and rate limiter instances
3. **Singleton Pattern**: Single rate limiter service instance across the application
4. **Builder Pattern**: Fluent API for configuring rate limiter service
5. **Facade Pattern**: Simplified interface for complex rate limiting operations
6. **Chain of Responsibility**: Multiple rules applied in sequence
7. **Observer Pattern**: Metrics collection and monitoring
8. **Middleware Pattern**: Express middleware for HTTP rate limiting

### Core Components

```
src/
├── types/           # Type definitions and interfaces
├── storage/         # Storage adapters (Memory, Redis)
├── algorithms/      # Rate limiting algorithms
├── services/        # Main rate limiter service
├── api/            # HTTP API layer
└── index.ts        # Entry point
```

## 🚀 Features

### Rate Limiting Algorithms

1. **Fixed Window Counter**
   - Simple, memory-efficient
   - Good for basic rate limiting
   - May allow burst at window boundaries

2. **Sliding Window Counter**
   - More accurate than fixed window
   - Prevents burst at window boundaries
   - Higher memory usage

3. **Token Bucket**
   - Allows burst traffic up to bucket size
   - Smooth rate limiting
   - Good for API rate limiting

4. **Leaky Bucket**
   - Smooths out traffic spikes
   - Constant output rate
   - Good for traffic shaping

### Storage Backends

- **In-Memory**: Fast, good for testing and single-instance deployments
- **Redis**: Distributed, persistent, good for production multi-instance deployments

### Key Features

- ✅ Multiple rate limiting algorithms
- ✅ Configurable rules with priorities
- ✅ Request weighting support
- ✅ Metrics collection and monitoring
- ✅ HTTP API with middleware
- ✅ RESTful endpoints for management
- ✅ Proper HTTP headers (X-RateLimit-*)
- ✅ Error handling and graceful degradation
- ✅ TypeScript with strict typing
- ✅ Comprehensive test coverage

## 📦 Installation

```bash
npm install
npm run build
```

## 🎯 Usage Examples

### Basic Usage

```typescript
import { RateLimiterService } from './src/services/RateLimiterService';

// Create rate limiter with default configuration
const rateLimiter = RateLimiterService.builder()
  .withDefaultRules()
  .build();

// Check if request is allowed
const response = await rateLimiter.isAllowed({
  identifier: 'user123',
  timestamp: Date.now(),
  weight: 1
});

console.log(response.allowed); // true/false
```

### Advanced Configuration

```typescript
import { RateLimiterService, StorageType } from './src/services/RateLimiterService';
import { RateLimitAlgorithm } from './src/types';

const rateLimiter = RateLimiterService.builder()
  .withStorage(StorageType.REDIS, { redisUrl: 'redis://localhost:6379' })
  .withRule({
    id: 'api-limit',
    name: 'API Rate Limit',
    config: {
      algorithm: RateLimitAlgorithm.SLIDING_WINDOW,
      maxRequests: 100,
      windowSizeMs: 60000 // 1 minute
    },
    priority: 1
  })
  .withRule({
    id: 'burst-protection',
    name: 'Burst Protection',
    config: {
      algorithm: RateLimitAlgorithm.TOKEN_BUCKET,
      maxRequests: 10,
      windowSizeMs: 1000, // 1 second
      burstSize: 5
    },
    priority: 2
  })
  .build();
```

### Express Middleware

```typescript
import express from 'express';
import { rateLimitMiddleware } from './src/api';

const app = express();

// Apply rate limiting to all routes
app.use(rateLimitMiddleware());

// Or with custom identifier extraction
app.use(rateLimitMiddleware((req) => req.headers['x-api-key'] as string));

app.get('/api/data', (req, res) => {
  res.json({ data: 'protected resource' });
});
```

## 🌐 HTTP API

### Endpoints

- `GET /health` - Health check
- `POST /api/rate-limit/check` - Check rate limit
- `GET /api/rate-limit/info/:identifier` - Get rate limit info
- `DELETE /api/rate-limit/reset/:identifier` - Reset rate limit
- `GET /api/metrics` - Get metrics
- `DELETE /api/metrics` - Reset metrics
- `GET /api/rules` - Get all rules
- `POST /api/rules` - Add new rule
- `DELETE /api/rules/:ruleId` - Remove rule

### Example API Usage

```bash
# Check rate limit
curl -X POST http://localhost:3000/api/rate-limit/check \
  -H "Content-Type: application/json" \
  -d '{"identifier": "user123", "weight": 1}'

# Get metrics
curl http://localhost:3000/api/metrics

# Add custom rule
curl -X POST http://localhost:3000/api/rules \
  -H "Content-Type: application/json" \
  -d '{
    "id": "premium-users",
    "name": "Premium User Limit",
    "config": {
      "algorithm": "TOKEN_BUCKET",
      "maxRequests": 1000,
      "windowSizeMs": 60000,
      "burstSize": 100
    },
    "priority": 3
  }'
```

## 🔧 Configuration

### Environment Variables

```bash
PORT=3000                    # Server port
REDIS_URL=redis://localhost:6379  # Redis connection URL
NODE_ENV=production          # Environment
```

### Rate Limit Rules

Rules are applied in priority order (highest priority first). Each rule can have:

- **Algorithm**: Rate limiting algorithm to use
- **Max Requests**: Maximum requests allowed in the window
- **Window Size**: Time window in milliseconds
- **Burst Size**: For token bucket algorithm
- **Leak Rate**: For leaky bucket algorithm
- **Conditions**: When to apply this rule
- **Priority**: Order of application

## 📊 Monitoring

The service provides comprehensive metrics:

- Total requests processed
- Allowed/blocked/throttled requests
- Average response time
- Error rate
- Per-identifier rate limit information

## 🧪 Testing

```bash
npm test
npm run test:watch
```

## 🚀 Production Deployment

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rate-limiter
spec:
  replicas: 3
  selector:
    matchLabels:
      app: rate-limiter
  template:
    metadata:
      labels:
        app: rate-limiter
    spec:
      containers:
      - name: rate-limiter
        image: rate-limiter:latest
        ports:
        - containerPort: 3000
        env:
        - name: REDIS_URL
          value: "redis://redis-service:6379"
```

## 🔍 Design Decisions Explained

### 1. Strategy Pattern for Algorithms
- **Why**: Different rate limiting algorithms have different trade-offs
- **Benefit**: Easy to switch algorithms without changing client code
- **Implementation**: Each algorithm implements the same interface

### 2. Factory Pattern for Storage
- **Why**: Different storage backends for different deployment scenarios
- **Benefit**: Easy to switch between memory and Redis storage
- **Implementation**: Factory creates appropriate storage adapter

### 3. Singleton Pattern for Service
- **Why**: Single instance ensures consistent state across the application
- **Benefit**: Prevents multiple instances from conflicting
- **Implementation**: Static getInstance method

### 4. Builder Pattern for Configuration
- **Why**: Complex configuration with many optional parameters
- **Benefit**: Fluent, readable API for configuration
- **Implementation**: Method chaining for configuration

### 5. Facade Pattern for Service
- **Why**: Complex interactions between algorithms, storage, and rules
- **Benefit**: Simple interface for clients
- **Implementation**: Service orchestrates all components

### 6. Chain of Responsibility for Rules
- **Why**: Multiple rules can apply to the same request
- **Benefit**: Flexible rule application with priorities
- **Implementation**: Rules applied in priority order

## 🎯 Interview Discussion Points

### Scalability
- **Horizontal Scaling**: Redis storage enables multiple instances
- **Performance**: In-memory storage for high-throughput scenarios
- **Caching**: Redis provides fast access to rate limit data

### Reliability
- **Fail-Open**: Service continues working even if rate limiting fails
- **Error Handling**: Comprehensive error handling and logging
- **Monitoring**: Built-in metrics for observability

### Security
- **Input Validation**: All inputs are validated and sanitized
- **Rate Limit Headers**: Standard HTTP headers for client information
- **CORS and Security**: Proper security headers and CORS configuration

### Maintainability
- **TypeScript**: Strong typing for better development experience
- **Design Patterns**: Well-structured, extensible code
- **Documentation**: Comprehensive documentation and examples

## 🔮 Future Enhancements

1. **Distributed Rate Limiting**: Support for distributed deployments
2. **Machine Learning**: Adaptive rate limiting based on traffic patterns
3. **WebSocket Support**: Real-time rate limiting for WebSocket connections
4. **GraphQL Integration**: Rate limiting for GraphQL APIs
5. **Advanced Analytics**: Detailed traffic analysis and reporting
6. **Rate Limit Templates**: Predefined templates for common use cases
7. **A/B Testing**: Support for testing different rate limiting strategies
8. **Geographic Rate Limiting**: Different limits based on geographic location

## 📝 License

MIT License - see LICENSE file for details.