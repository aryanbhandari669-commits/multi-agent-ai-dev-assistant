import redis from 'redis';
import config from '../config/config.js';
import logger from '../config/logger.js';

class CacheService {
  constructor() {
    this.client = redis.createClient({ url: config.redisUrl });
    this.client.on('error', (err) => logger.error('Redis error:', err));
    this.client.connect().catch((err) => logger.error('Redis connect error:', err));
    this.ttl = config.cache.ttl;
  }

  async get(key) {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Cache get error:', error.message);
      return null;
    }
  }

  async set(key, value, ttl = this.ttl) {
    try {
      await this.client.setEx(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error('Cache set error:', error.message);
      return false;
    }
  }

  async delete(key) {
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error('Cache delete error:', error.message);
      return false;
    }
  }

  async clear() {
    try {
      await this.client.flushDb();
      return true;
    } catch (error) {
      logger.error('Cache clear error:', error.message);
      return false;
    }
  }

  async exists(key) {
    try {
      return (await this.client.exists(key)) === 1;
    } catch (error) {
      logger.error('Cache exists error:', error.message);
      return false;
    }
  }
}

export default new CacheService();
