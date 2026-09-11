import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import config from './config/config.js';
import logger from './config/logger.js';
import requestLogger from './middleware/requestLogger.js';
import errorHandler from './middleware/errorHandler.js';
import { rateLimit } from './middleware/rateLimit.js';
import databaseService from './services/database.js';
import chatRoutes from './routes/chat.js';
import notesRoutes from './routes/notes.js';
import tasksRoutes from './routes/tasks.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: config.corsOrigin,
    methods: ['GET', 'POST']
  }
});

// Store io instance on app for route access
app.set('io', io);

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors({ origin: config.corsOrigin }));
app.use(requestLogger);
app.use(rateLimit);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/chat', chatRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/tasks', tasksRoutes);

// WebSocket connection
io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.id}`);

  socket.on('join_conversation', (conversationId) => {
    socket.join(`conversation_${conversationId}`);
    logger.info(`User joined conversation: ${conversationId}`);
  });

  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.id}`);
  });

  socket.on('error', (error) => {
    logger.error(`Socket error: ${error}`);
  });
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Not Found',
      path: req.originalUrl
    }
  });
});

// Server startup
const startServer = async () => {
  try {
    // Connect to database
    await databaseService.connect();
    logger.info('Connected to MongoDB');

    // Start server
    const PORT = config.port;
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${config.env}`);
    });
  } catch (error) {
    logger.error('Server startup error:', error.message);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down server...');
  await databaseService.disconnect();
  server.close(() => {
    logger.info('Server shut down');
    process.exit(0);
  });
});

startServer();

export default app;
