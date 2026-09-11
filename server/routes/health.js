import express from 'express';
import logger from '../config/logger.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    logger.error('Health check error:', error);
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});

export default router;
