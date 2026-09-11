import { getRedisClient } from '../config/redis.js';
import logger from '../config/logger.js';

class CacheService {
  async get(key) {
    try {
      const client = getRedisClient();
      const value = await client.get(key);
      if (value) {
        logger.debug(`Cache HIT: ${key}`);
        return JSON.parse(value);
      }
      logger.debug(`Cache MISS: ${key}`);
      return null;
    } catch (error) {
      logger.warn('Cache get error:', error.message);
      return null;
    }
  }

  async set(key, value, ttl = 3600) {
    try {
      const client = getRedisClient();
      await client.setEx(key, ttl, JSON.stringify(value));
      logger.debug(`Cache SET: ${key} (TTL: ${ttl}s)`);
    } catch (error) {
      logger.warn('Cache set error:', error.message);
    }
  }

  async delete(key) {
    try {
      const client = getRedisClient();
      await client.del(key);
      logger.debug(`Cache DELETE: ${key}`);
    } catch (error) {
      logger.warn('Cache delete error:', error.message);
    }
  }

  async clear(pattern = '*') {
    try {
      const client = getRedisClient();
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(keys);
        logger.debug(`Cache CLEARED: ${keys.length} keys`);
      }
    } catch (error) {
      logger.warn('Cache clear error:', error.message);
    }
  }

  async getOrSet(key, fetchFn, ttl = 3600) {
    try {
      const cached = await this.get(key);
      if (cached) return cached;

      const value = await fetchFn();
      await this.set(key, value, ttl);
      return value;
    } catch (error) {
      logger.error('Cache getOrSet error:', error.message);
      throw error;
    }
  }
}

export default new CacheService();
