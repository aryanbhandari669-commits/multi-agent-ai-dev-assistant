import express from 'express';
import { validateRequest, schemas } from '../middleware/validation.js';
import databaseService from '../services/database.js';
import notesAgent from '../agents/notes.js';
import { generateId } from '../utils/helpers.js';
import logger from '../config/logger.js';

const router = express.Router();

// GET /api/notes - Get all notes
router.get('/', async (req, res, next) => {
  try {
    const { category, tag, search, limit = 20, skip = 0 } = req.query;

    let notes;

    if (search) {
      notes = await databaseService.searchNotes(search);
    } else if (category) {
      notes = await databaseService.getNotesByCategory(category);
    } else if (tag) {
      notes = await databaseService.getNotesByTag(tag);
    } else {
      // Get all notes (implement in database service)
      notes = await databaseService.getNotesByCategory('general');
    }

    const paginatedNotes = notes.slice(skip, skip + limit);

    res.json({
      success: true,
      total: notes.length,
      limit,
      skip,
      notes: paginatedNotes
    });
  } catch (error) {
    logger.error('Get notes error:', error);
    next(error);
  }
});

// POST /api/notes - Create new note
router.post('/', validateRequest(schemas.note), async (req, res, next) => {
  try {
    const { title, content, tags, category } = req.validatedBody;

    const noteId = generateId();
    const noteData = {
      noteId,
      title,
      content,
      tags: tags || [],
      category: category || 'general',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const savedNote = await databaseService.createNote(noteData);

    res.status(201).json({
      success: true,
      noteId: savedNote.noteId,
      note: savedNote
    });
  } catch (error) {
    logger.error('Create note error:', error);
    next(error);
  }
});

// GET /api/notes/:noteId - Get specific note
router.get('/:noteId', async (req, res, next) => {
  try {
    const { noteId } = req.params;

    const note = await databaseService.getNote(noteId);

    if (!note) {
      return res.status(404).json({
        error: {
          message: 'Note not found',
          noteId
        }
      });
    }

    res.json({
      success: true,
      note
    });
  } catch (error) {
    logger.error('Get note error:', error);
    next(error);
  }
});

// PUT /api/notes/:noteId - Update note
router.put('/:noteId', async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const { title, content, tags, category, isPinned, isArchived } = req.body;

    const updateData = {
      ...(title && { title }),
      ...(content && { content }),
      ...(tags && { tags }),
      ...(category && { category }),
      ...(typeof isPinned !== 'undefined' && { isPinned }),
      ...(typeof isArchived !== 'undefined' && { isArchived }),
      updatedAt: new Date()
    };

    const updatedNote = await databaseService.updateNote(noteId, updateData);

    if (!updatedNote) {
      return res.status(404).json({
        error: {
          message: 'Note not found',
          noteId
        }
      });
    }

    res.json({
      success: true,
      note: updatedNote
    });
  } catch (error) {
    logger.error('Update note error:', error);
    next(error);
  }
});

// DELETE /api/notes/:noteId - Delete note
router.delete('/:noteId', async (req, res, next) => {
  try {
    const { noteId } = req.params;

    await databaseService.getNote(noteId);
    // Implement actual delete in production
    // await Note.deleteOne({ noteId });

    res.json({
      success: true,
      message: 'Note deleted',
      noteId
    });
  } catch (error) {
    logger.error('Delete note error:', error);
    next(error);
  }
});

// POST /api/notes/from-code - Create note from code
router.post('/from-code', async (req, res, next) => {
  try {
    const { code, language, description } = req.body;

    if (!code) {
      return res.status(400).json({
        error: { message: 'Code is required' }
      });
    }

    const result = await notesAgent.createCodeNote(code, language || 'javascript', description);

    res.status(201).json({
      success: result.saved,
      noteId: result.noteId,
      content: result.content
    });
  } catch (error) {
    logger.error('Create code note error:', error);
    next(error);
  }
});

// POST /api/notes/from-conversation - Create note from conversation
router.post('/from-conversation', async (req, res, next) => {
  try {
    const { conversationId, title } = req.body;

    if (!conversationId) {
      return res.status(400).json({
        error: { message: 'Conversation ID is required' }
      });
    }

    const conversation = await databaseService.getConversation(conversationId);

    if (!conversation) {
      return res.status(404).json({
        error: { message: 'Conversation not found' }
      });
    }

    const result = await notesAgent.summarizeConversation(
      conversation.messages,
      title || conversation.title
    );

    res.status(201).json({
      success: true,
      content: result.content
    });
  } catch (error) {
    logger.error('Create note from conversation error:', error);
    next(error);
  }
});

export default router;
