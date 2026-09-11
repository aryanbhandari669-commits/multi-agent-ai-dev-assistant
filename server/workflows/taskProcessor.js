import logger from '../config/logger.js';
import databaseService from '../services/database.js';
import { generateId } from '../utils/helpers.js';

class TaskProcessor {
  constructor() {
    this.name = 'Task Processor';
    this.queue = [];
    this.processing = false;
  }

  async enqueueTask(task) {
    logger.info(`${this.name} - Enqueuing task: ${task.title}`);
    
    const taskId = generateId();
    const fullTask = {
      taskId,
      ...task,
      status: 'pending',
      createdAt: new Date()
    };

    this.queue.push(fullTask);

    try {
      await databaseService.createTask(fullTask);
    } catch (error) {
      logger.warn('Could not save task to database:', error.message);
    }

    this.processNext();
    return taskId;
  }

  async processNext() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;
    const task = this.queue.shift();

    logger.info(`${this.name} - Processing task: ${task.taskId}`);

    try {
      await databaseService.updateTask(task.taskId, { status: 'in-progress' });

      const result = await task.processor(task);

      await databaseService.updateTask(task.taskId, {
        status: 'completed',
        result,
        completedAt: new Date()
      });

      logger.info(`${this.name} - Task completed: ${task.taskId}`);
    } catch (error) {
      logger.error(`${this.name} - Task failed:`, error.message);
      await databaseService.updateTask(task.taskId, {
        status: 'failed',
        error: error.message
      });
    } finally {
      this.processing = false;
      this.processNext();
    }
  }

  getQueueStatus() {
    return {
      queueLength: this.queue.length,
      processing: this.processing,
      tasks: this.queue.map(t => ({ taskId: t.taskId, title: t.title }))
    };
  }
}

export default new TaskProcessor();
