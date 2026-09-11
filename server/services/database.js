import { MongoClient } from 'mongodb';
import config from '../config/config.js';
import logger from '../config/logger.js';

class DatabaseService {
  constructor() {
    this.client = null;
    this.db = null;
  }

  async connect() {
    try {
      this.client = new MongoClient(config.mongoUri);
      await this.client.connect();
      this.db = this.client.db('ai-dev-assistant');
      logger.info('Database connected successfully');
      return this.db;
    } catch (error) {
      logger.error('Database connection error:', error.message);
      throw error;
    }
  }

  async createConversation(conversationId, title = 'New Conversation') {
    try {
      const conversation = {
        conversationId,
        title,
        messages: [],
        agentHistory: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      await this.db.collection('conversations').insertOne(conversation);
      return conversation;
    } catch (error) {
      logger.error('Create conversation error:', error.message);
      throw error;
    }
  }

  async getConversation(conversationId) {
    try {
      return await this.db
        .collection('conversations')
        .findOne({ conversationId });
    } catch (error) {
      logger.error('Get conversation error:', error.message);
      throw error;
    }
  }

  async addMessage(conversationId, message) {
    try {
      await this.db.collection('conversations').updateOne(
        { conversationId },
        {
          $push: { messages: message },
          $set: { updatedAt: new Date() }
        }
      );
      return message;
    } catch (error) {
      logger.error('Add message error:', error.message);
      throw error;
    }
  }

  async addAgentHistory(conversationId, history) {
    try {
      await this.db.collection('conversations').updateOne(
        { conversationId },
        {
          $push: { agentHistory: history },
          $set: { updatedAt: new Date() }
        }
      );
      return history;
    } catch (error) {
      logger.error('Add agent history error:', error.message);
      throw error;
    }
  }

  async createNote(noteData) {
    try {
      await this.db.collection('notes').insertOne(noteData);
      return noteData;
    } catch (error) {
      logger.error('Create note error:', error.message);
      throw error;
    }
  }

  async getNote(noteId) {
    try {
      return await this.db.collection('notes').findOne({ noteId });
    } catch (error) {
      logger.error('Get note error:', error.message);
      throw error;
    }
  }

  async getNotesByCategory(category) {
    try {
      return await this.db
        .collection('notes')
        .find({ category })
        .toArray();
    } catch (error) {
      logger.error('Get notes by category error:', error.message);
      throw error;
    }
  }

  async getNotesByTag(tag) {
    try {
      return await this.db
        .collection('notes')
        .find({ tags: tag })
        .toArray();
    } catch (error) {
      logger.error('Get notes by tag error:', error.message);
      throw error;
    }
  }

  async searchNotes(searchText) {
    try {
      return await this.db
        .collection('notes')
        .find({
          $or: [
            { title: { $regex: searchText, $options: 'i' } },
            { content: { $regex: searchText, $options: 'i' } }
          ]
        })
        .toArray();
    } catch (error) {
      logger.error('Search notes error:', error.message);
      throw error;
    }
  }

  async updateNote(noteId, updates) {
    try {
      const result = await this.db.collection('notes').findOneAndUpdate(
        { noteId },
        { $set: { ...updates, updatedAt: new Date() } },
        { returnDocument: 'after' }
      );
      return result.value;
    } catch (error) {
      logger.error('Update note error:', error.message);
      throw error;
    }
  }

  async createTask(taskData) {
    try {
      await this.db.collection('tasks').insertOne(taskData);
      return taskData;
    } catch (error) {
      logger.error('Create task error:', error.message);
      throw error;
    }
  }

  async getTask(taskId) {
    try {
      return await this.db.collection('tasks').findOne({ taskId });
    } catch (error) {
      logger.error('Get task error:', error.message);
      throw error;
    }
  }

  async getTasksByStatus(status) {
    try {
      return await this.db
        .collection('tasks')
        .find({ status })
        .toArray();
    } catch (error) {
      logger.error('Get tasks by status error:', error.message);
      throw error;
    }
  }

  async getTasksByConversation(conversationId) {
    try {
      return await this.db
        .collection('tasks')
        .find({ conversationId })
        .toArray();
    } catch (error) {
      logger.error('Get tasks by conversation error:', error.message);
      throw error;
    }
  }

  async updateTask(taskId, updates) {
    try {
      const result = await this.db.collection('tasks').findOneAndUpdate(
        { taskId },
        { $set: { ...updates, updatedAt: new Date() } },
        { returnDocument: 'after' }
      );
      return result.value;
    } catch (error) {
      logger.error('Update task error:', error.message);
      throw error;
    }
  }

  async disconnect() {
    try {
      await this.client.close();
      logger.info('Database disconnected');
    } catch (error) {
      logger.error('Database disconnect error:', error.message);
      throw error;
    }
  }
}

export default new DatabaseService();
