import express from 'express';
import databaseService from '../services/database.js';
import taskProcessor from '../workflows/taskProcessor.js';
import agentWorkflow from '../workflows/agentWorkflow.js';
import { generateId } from '../utils/helpers.js';
import logger from '../config/logger.js';

const router = express.Router();

// GET /api/tasks - List all tasks
router.get('/', async (req, res, next) => {
  try {
    const { status, type, conversationId, limit = 20, skip = 0 } = req.query;

    let tasks;

    if (status) {
      tasks = await databaseService.getTasksByStatus(status);
    } else if (conversationId) {
      tasks = await databaseService.getTasksByConversation(conversationId);
    } else {
      // Get all tasks (implement in database service)
      tasks = [];
    }

    const paginatedTasks = tasks.slice(skip, skip + limit);

    res.json({
      success: true,
      total: tasks.length,
      limit,
      skip,
      tasks: paginatedTasks
    });
  } catch (error) {
    logger.error('Get tasks error:', error);
    next(error);
  }
});

// POST /api/tasks - Create new task
router.post('/', async (req, res, next) => {
  try {
    const { title, description, type, priority, conversationId, agentsInvolved } = req.body;

    if (!title) {
      return res.status(400).json({
        error: { message: 'Title is required' }
      });
    }

    const taskId = generateId();
    const taskData = {
      taskId,
      title,
      description,
      type: type || 'general',
      priority: priority || 'medium',
      conversationId: conversationId || generateId(),
      agentsInvolved: agentsInvolved || [],
      status: 'pending',
      createdAt: new Date()
    };

    const savedTask = await databaseService.createTask(taskData);

    res.status(201).json({
      success: true,
      taskId: savedTask.taskId,
      task: savedTask
    });
  } catch (error) {
    logger.error('Create task error:', error);
    next(error);
  }
});

// GET /api/tasks/:taskId - Get specific task
router.get('/:taskId', async (req, res, next) => {
  try {
    const { taskId } = req.params;

    const task = await databaseService.getTask(taskId);

    if (!task) {
      return res.status(404).json({
        error: {
          message: 'Task not found',
          taskId
        }
      });
    }

    res.json({
      success: true,
      task
    });
  } catch (error) {
    logger.error('Get task error:', error);
    next(error);
  }
});

// PUT /api/tasks/:taskId - Update task
router.put('/:taskId', async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { status, result, error } = req.body;

    const updateData = {
      ...(status && { status }),
      ...(result && { result }),
      ...(error && { error }),
      updatedAt: new Date()
    };

    const updatedTask = await databaseService.updateTask(taskId, updateData);

    if (!updatedTask) {
      return res.status(404).json({
        error: {
          message: 'Task not found',
          taskId
        }
      });
    }

    res.json({
      success: true,
      task: updatedTask
    });
  } catch (error) {
    logger.error('Update task error:', error);
    next(error);
  }
});

// POST /api/tasks/:taskId/execute - Execute a task
router.post('/:taskId/execute', async (req, res, next) => {
  try {
    const { taskId } = req.params;

    const task = await databaseService.getTask(taskId);

    if (!task) {
      return res.status(404).json({
        error: {
          message: 'Task not found',
          taskId
        }
      });
    }

    // Update task status to in-progress
    await databaseService.updateTask(taskId, { status: 'in-progress' });

    // Execute through workflow
    const result = await agentWorkflow.processUserMessage(
      task.description || task.title,
      task.conversationId
    );

    // Update task with result
    const updatedTask = await databaseService.updateTask(taskId, {
      status: 'completed',
      result,
      completedAt: new Date()
    });

    res.json({
      success: true,
      task: updatedTask
    });
  } catch (error) {
    logger.error('Execute task error:', error);
    await databaseService.updateTask(req.params.taskId, {
      status: 'failed',
      error: error.message
    });
    next(error);
  }
});

// GET /api/tasks/queue/status - Get task queue status
router.get('/queue/status', (req, res) => {
  try {
    const status = taskProcessor.getQueueStatus();
    res.json({
      success: true,
      queueStatus: status
    });
  } catch (error) {
    logger.error('Get queue status error:', error);
    res.status(500).json({
      error: { message: error.message }
    });
  }
});

export default router;
