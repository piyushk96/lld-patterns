/**
 * Storage Adapters using Strategy Pattern
 *
 * Design Decisions:
 * 1. Strategy Pattern: Allows switching between different storage backends
 * 2. Interface-based design: Loose coupling between rate limiter and storage
 * 3. Factory Pattern: Easy creation of storage instances
 * 4. Error handling: Graceful degradation and retry mechanisms
 */

import { StorageAdapter } from '../types';

// In-Memory Storage (for testing and simple use cases)
export class InMemoryStorageAdapter implements StorageAdapter {
  private store = new Map<string, { value: any; expiry?: number }>();

  async get(key: string): Promise<any | null> {
    const item = this.store.get(key);
    if (!item) return null;

    if (item.expiry && Date.now() > item.expiry) {
      this.store.delete(key);
      return null;
    }

    return item.value;
  }

  async set(key: string, value: any, ttlMs?: number): Promise<void> {
    const expiry = ttlMs ? Date.now() + ttlMs : undefined;
    this.store.set(key, { value, expiry });
  }

  async increment(key: string, amount: number = 1): Promise<number> {
    const current = await this.get(key) || 0;
    const newValue = current + amount;
    await this.set(key, newValue);
    return newValue;
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    return this.store.has(key);
  }

  // Cleanup expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.store.entries()) {
      if (item.expiry && now > item.expiry) {
        this.store.delete(key);
      }
    }
  }
}

// Redis Storage Adapter (for production use)
export class RedisStorageAdapter implements StorageAdapter {
  private client: any;
  private isConnected = false;

  constructor(redisUrl?: string) {
    this.initializeRedis(redisUrl);
  }

  private async initializeRedis(redisUrl?: string): Promise<void> {
    try {
      const { createClient } = await import('redis');
      this.client = createClient({
        url: redisUrl || process.env.REDIS_URL || 'redis://localhost:6379'
      });

      this.client.on('error', (err: Error) => {
        console.error('Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('Connected to Redis');
        this.isConnected = true;
      });

      await this.client.connect();
    } catch (error) {
      console.error('Failed to initialize Redis:', error);
      throw new Error('Redis initialization failed');
    }
  }

  async get(key: string): Promise<any | null> {
    if (!this.isConnected) {
      throw new Error('Redis not connected');
    }

    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttlMs?: number): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Redis not connected');
    }

    try {
      const serializedValue = JSON.stringify(value);
      if (ttlMs) {
        await this.client.setEx(key, Math.ceil(ttlMs / 1000), serializedValue);
      } else {
        await this.client.set(key, serializedValue);
      }
    } catch (error) {
      console.error('Redis set error:', error);
      throw error;
    }
  }

  async increment(key: string, amount: number = 1): Promise<number> {
    if (!this.isConnected) {
      throw new Error('Redis not connected');
    }

    try {
      return await this.client.incrBy(key, amount);
    } catch (error) {
      console.error('Redis increment error:', error);
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Redis not connected');
    }

    try {
      await this.client.del(key);
    } catch (error) {
      console.error('Redis delete error:', error);
      throw error;
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.isConnected) {
      throw new Error('Redis not connected');
    }

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis exists error:', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
    }
  }
}

// Storage Factory using Factory Pattern
export enum StorageType {
  MEMORY = 'memory',
  REDIS = 'redis'
}

export class StorageFactory {
  static create(type: StorageType, config?: any): StorageAdapter {
    switch (type) {
      case StorageType.MEMORY:
        return new InMemoryStorageAdapter();
      case StorageType.REDIS:
        return new RedisStorageAdapter(config?.redisUrl);
      default:
        throw new Error(`Unsupported storage type: ${type}`);
    }
  }
}