import express from 'express';
import { validateRequest, schemas } from '../middleware/validation.js';
import agentWorkflow from '../workflows/agentWorkflow.js';
import databaseService from '../services/database.js';
import { generateConversationId } from '../utils/helpers.js';
import logger from '../config/logger.js';

const router = express.Router();

// POST /api/chat - Send message and get response from orchestrator
router.post('/', validateRequest(schemas.chat), async (req, res, next) => {
  try {
    const { conversationId, message, context } = req.validatedBody;
    const io = req.app.get('io');

    // Generate conversation ID if not provided
    const convId = conversationId || generateConversationId();

    // Emit starting event to WebSocket
    if (io) {
      io.to(`conversation_${convId}`).emit('message_processing', {
        status: 'processing',
        timestamp: new Date()
      });
    }

    // Process message through workflow
    const result = await agentWorkflow.processUserMessage(message, convId, context);

    // Emit completion event to WebSocket
    if (io) {
      io.to(`conversation_${convId}`).emit('message_completed', {
        status: 'completed',
        result,
        timestamp: new Date()
      });
    }

    res.json(result);
  } catch (error) {
    logger.error('Chat endpoint error:', error);
    next(error);
  }
});

// GET /api/chat/:conversationId - Get conversation history
router.get('/:conversationId', async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    const conversation = await databaseService.getConversation(conversationId);

    if (!conversation) {
      return res.status(404).json({
        error: {
          message: 'Conversation not found',
          conversationId
        }
      });
    }

    res.json({
      success: true,
      conversationId,
      title: conversation.title,
      messageCount: conversation.messages.length,
      messages: conversation.messages,
      agentHistory: conversation.agentHistory,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt
    });
  } catch (error) {
    logger.error('Get conversation error:', error);
    next(error);
  }
});

// DELETE /api/chat/:conversationId - Delete conversation
router.delete('/:conversationId', async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    await databaseService.getConversation(conversationId);
    // In production, implement actual delete logic
    // await Conversation.deleteOne({ conversationId });

    res.json({
      success: true,
      message: 'Conversation deleted',
      conversationId
    });
  } catch (error) {
    logger.error('Delete conversation error:', error);
    next(error);
  }
});

// POST /api/chat/:conversationId/research - Research specific topic
router.post('/:conversationId/research', async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({
        error: { message: 'Topic is required' }
      });
    }

    const result = await agentWorkflow.processUserMessage(
      `Research this topic: ${topic}`,
      conversationId
    );

    res.json(result);
  } catch (error) {
    logger.error('Research endpoint error:', error);
    next(error);
  }
});

// POST /api/chat/:conversationId/review-code - Review code
router.post('/:conversationId/review-code', async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { code, language } = req.body;

    if (!code) {
      return res.status(400).json({
        error: { message: 'Code is required' }
      });
    }

    const result = await agentWorkflow.processUserMessage(
      `Review this ${language || 'javascript'} code for bugs, security, and performance issues:\n\`\`\`\n${code}\n\`\`\``,
      conversationId
    );

    res.json(result);
  } catch (error) {
    logger.error('Code review endpoint error:', error);
    next(error);
  }
});

export default router;
