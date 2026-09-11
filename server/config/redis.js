import { createClient } from 'redis';
import logger from './logger.js';

let redisClient = null;

export async function initializeRedis() {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    
    redisClient.on('error', (err) => logger.error('Redis Client Error', err));
    redisClient.on('connect', () => logger.info('Redis connected'));
    
    await redisClient.connect();
    logger.info('Redis initialized successfully');
    return redisClient;
  } catch (error) {
    logger.error('Redis initialization error:', error);
    throw error;
  }
}

export function getRedisClient() {
  if (!redisClient) {
    throw new Error('Redis client not initialized');
  }
  return redisClient;
}

export async function closeRedis() {
  if (redisClient) {
    await redisClient.quit();
    logger.info('Redis connection closed');
  }
}

export default redisClient;
