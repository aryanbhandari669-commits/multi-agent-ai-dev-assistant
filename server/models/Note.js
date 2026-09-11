import mongoose from 'mongoose';

const NoteSchema = new mongoose.Schema({
  noteId: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true
  },
  summary: String,
  category: {
    type: String,
    enum: ['code', 'research', 'learning', 'bug', 'feature', 'general'],
    default: 'general',
    index: true
  },
  tags: [{
    type: String,
    index: true
  }],
  sourceConversation: {
    conversationId: String,
    messageIds: [String]
  },
  codeBlocks: [
    {
      language: String,
      code: String,
      description: String
    }
  ],
  references: [
    {
      title: String,
      url: String,
      type: String
    }
  ],
  relatedNotes: [String],
  isPinned: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

NoteSchema.index({ category: 1, createdAt: -1 });
NoteSchema.index({ tags: 1 });
NoteSchema.index({ title: 'text', content: 'text' });

export default mongoose.model('Note', NoteSchema);
