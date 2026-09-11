import llmService from '../services/llm.js';
import databaseService from '../services/database.js';
import { buildSystemPrompt } from '../utils/prompt.js';
import { generateId } from '../utils/helpers.js';
import logger from '../config/logger.js';

class NotesAgent {
  constructor() {
    this.name = 'Notes Agent';
    this.type = 'notes';
  }

  async execute(userMessage, context = {}) {
    logger.info(`${this.name} - Processing request`);
    
    const startTime = Date.now();
    try {
      const systemPrompt = buildSystemPrompt('notes');
      const messages = [
        { role: 'user', content: userMessage }
      ];

      const response = await llmService.chat(messages, systemPrompt, 0.7);
      
      const result = {
        success: true,
        content: response,
        executionTime: Date.now() - startTime,
        agent: this.type
      };

      logger.info(`${this.name} - Completed successfully`);
      return result;
    } catch (error) {
      logger.error(`${this.name} - Error:`, error.message);
      return {
        success: false,
        error: error.message,
        executionTime: Date.now() - startTime,
        agent: this.type
      };
    }
  }

  async summarizeConversation(messages, conversationTitle = 'Conversation') {
    const messageContent = messages
      .map(m => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n\n');

    const prompt = `Summarize this conversation into a structured note:

${messageContent}

Provide:
- Executive summary (2-3 sentences)
- Key points and concepts
- Action items (if any)
- Tags and categories
- Related learning outcomes`;

    return this.execute(prompt);
  }

  async createLearningNote(topic, content, references = []) {
    const prompt = `Create a comprehensive learning note on ${topic}:

Content:
${content}

${references.length > 0 ? `References:\n${references.map(r => `- ${r}`).join('\n')}` : ''}

Organize as:
- Definition/Overview
- Key Concepts
- Practical Applications
- Examples
- Resources for Further Learning`;

    const result = await this.execute(prompt);
    
    if (result.success) {
      const noteId = generateId();
      const noteData = {
        noteId,
        title: `Learning: ${topic}`,
        content: result.content,
        category: 'learning',
        tags: [topic, 'learning'],
        references: references.map(r => ({ title: r, type: 'reference' }))
      };
      
      try {
        const savedNote = await databaseService.createNote(noteData);
        return { ...result, noteId: savedNote.noteId, saved: true };
      } catch (error) {
        logger.warn('Could not save note to database:', error.message);
        return { ...result, noteId, saved: false };
      }
    }
    
    return result;
  }

  async createCodeNote(code, language, description = '') {
    const prompt = `Create a comprehensive note for this ${language} code:

\`\`\`${language}
${code}
\`\`\`

Description: ${description}

Provide:
- What this code does
- Key algorithms or patterns used
- How to use it
- Edge cases
- Potential improvements
- Related concepts`;

    const result = await this.execute(prompt);
    
    if (result.success) {
      const noteId = generateId();
      const noteData = {
        noteId,
        title: `Code: ${description || language.toUpperCase()}`,
        content: result.content,
        category: 'code',
        tags: [language, 'code'],
        codeBlocks: [{
          language,
          code
        }]
      };
      
      try {
        const savedNote = await databaseService.createNote(noteData);
        return { ...result, noteId: savedNote.noteId, saved: true };
      } catch (error) {
        logger.warn('Could not save note to database:', error.message);
        return { ...result, noteId, saved: false };
      }
    }
    
    return result;
  }

  async organizeNotes(notes) {
    const notesContent = notes
      .map(n => `- ${n.title}: ${n.content.substring(0, 100)}...`)
      .join('\n');

    const prompt = `Organize and consolidate these notes:

${notesContent}

Provide:
- Suggested categories
- Tags for each note
- Related notes that could be merged
- Knowledge gaps`;

    return this.execute(prompt);
  }

  async extractKeyTakeaways(content) {
    const prompt = `Extract the key takeaways and learning points from this content:

${content}

Provide as:
- 3-5 main points
- 2-3 actionable insights
- Related topics to explore`;

    return this.execute(prompt);
  }
}

export default new NotesAgent();
