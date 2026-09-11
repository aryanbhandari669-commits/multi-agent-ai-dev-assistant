import Conversation from '../models/Conversation.js';
import Note from '../models/Note.js';
import CodeReview from '../models/CodeReview.js';
import Task from '../models/Task.js';
import logger from '../config/logger.js';

class DatabaseService {
  // Conversation operations
  async createConversation(conversationId, title = 'New Conversation') {
    try {
      const conversation = new Conversation({
        conversationId,
        title
      });
      await conversation.save();
      logger.debug(`Conversation created: ${conversationId}`);
      return conversation;
    } catch (error) {
      logger.error('Error creating conversation:', error);
      throw error;
    }
  }

  async getConversation(conversationId) {
    try {
      return await Conversation.findOne({ conversationId });
    } catch (error) {
      logger.error('Error fetching conversation:', error);
      throw error;
    }
  }

  async addMessage(conversationId, message) {
    try {
      return await Conversation.findOneAndUpdate(
        { conversationId },
        { $push: { messages: message } },
        { new: true }
      );
    } catch (error) {
      logger.error('Error adding message:', error);
      throw error;
    }
  }

  async addAgentHistory(conversationId, agentEntry) {
    try {
      return await Conversation.findOneAndUpdate(
        { conversationId },
        { $push: { agentHistory: agentEntry } },
        { new: true }
      );
    } catch (error) {
      logger.error('Error adding agent history:', error);
      throw error;
    }
  }

  // Note operations
  async createNote(noteData) {
    try {
      const note = new Note(noteData);
      await note.save();
      logger.debug(`Note created: ${noteData.noteId}`);
      return note;
    } catch (error) {
      logger.error('Error creating note:', error);
      throw error;
    }
  }

  async getNote(noteId) {
    try {
      return await Note.findOne({ noteId });
    } catch (error) {
      logger.error('Error fetching note:', error);
      throw error;
    }
  }

  async getNotesByCategory(category) {
    try {
      return await Note.find({ category, isArchived: false }).sort({ createdAt: -1 });
    } catch (error) {
      logger.error('Error fetching notes by category:', error);
      throw error;
    }
  }

  async getNotesByTag(tag) {
    try {
      return await Note.find({ tags: tag, isArchived: false }).sort({ createdAt: -1 });
    } catch (error) {
      logger.error('Error fetching notes by tag:', error);
      throw error;
    }
  }

  async updateNote(noteId, updateData) {
    try {
      return await Note.findOneAndUpdate(
        { noteId },
        { ...updateData, updatedAt: new Date() },
        { new: true }
      );
    } catch (error) {
      logger.error('Error updating note:', error);
      throw error;
    }
  }

  async searchNotes(query) {
    try {
      return await Note.find(
        { $text: { $search: query }, isArchived: false },
        { score: { $meta: 'textScore' } }
      ).sort({ score: { $meta: 'textScore' } });
    } catch (error) {
      logger.error('Error searching notes:', error);
      throw error;
    }
  }

  // Code Review operations
  async createCodeReview(reviewData) {
    try {
      const review = new CodeReview(reviewData);
      await review.save();
      logger.debug(`Code review created: ${reviewData.reviewId}`);
      return review;
    } catch (error) {
      logger.error('Error creating code review:', error);
      throw error;
    }
  }

  async getCodeReview(reviewId) {
    try {
      return await CodeReview.findOne({ reviewId });
    } catch (error) {
      logger.error('Error fetching code review:', error);
      throw error;
    }
  }

  // Task operations
  async createTask(taskData) {
    try {
      const task = new Task(taskData);
      await task.save();
      logger.debug(`Task created: ${taskData.taskId}`);
      return task;
    } catch (error) {
      logger.error('Error creating task:', error);
      throw error;
    }
  }

  async getTask(taskId) {
    try {
      return await Task.findOne({ taskId });
    } catch (error) {
      logger.error('Error fetching task:', error);
      throw error;
    }
  }

  async updateTask(taskId, updateData) {
    try {
      return await Task.findOneAndUpdate(
        { taskId },
        { ...updateData, updatedAt: new Date() },
        { new: true }
      );
    } catch (error) {
      logger.error('Error updating task:', error);
      throw error;
    }
  }

  async getTasksByConversation(conversationId) {
    try {
      return await Task.find({ conversationId }).sort({ createdAt: -1 });
    } catch (error) {
      logger.error('Error fetching tasks by conversation:', error);
      throw error;
    }
  }

  async getTasksByStatus(status) {
    try {
      return await Task.find({ status }).sort({ createdAt: -1 });
    } catch (error) {
      logger.error('Error fetching tasks by status:', error);
      throw error;
    }
  }
}

export default new DatabaseService();
