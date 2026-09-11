import llmService from '../services/llm.js';
import searchService from '../services/search.js';
import cacheService from '../services/cache.js';
import { buildSystemPrompt } from '../utils/prompt.js';
import { extractLinks, cleanResponse } from '../utils/parser.js';
import logger from '../config/logger.js';

class ResearchAgent {
  constructor() {
    this.name = 'Research Agent';
    this.type = 'research';
  }

  async execute(userMessage, context = {}) {
    logger.info(`${this.name} - Processing request`);
    
    const startTime = Date.now();
    try {
      // Check cache first
      const cacheKey = `research_${userMessage.substring(0, 50)}`;
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        logger.info(`${this.name} - Found cached result`);
        return { ...cached, fromCache: true };
      }

      // Search for information
      const searchResults = await searchService.search(userMessage, { num: 10 });
      const topResults = searchResults.results.slice(0, 5);

      // Prepare research context
      const researchContext = topResults.map(r => 
        `Source: ${r.title}\nSnippet: ${r.snippet}`
      ).join('\n\n');

      // Generate synthesis with LLM
      const systemPrompt = buildSystemPrompt('research');
      const messages = [
        { 
          role: 'user', 
          content: `Based on this research, please synthesize findings:\n\n${researchContext}\n\nUser query: ${userMessage}` 
        }
      ];

      const synthesis = await llmService.chat(messages, systemPrompt, 0.5);

      const result = {
        success: true,
        synthesis,
        sources: topResults.map(r => ({
          title: r.title,
          link: r.link,
          snippet: r.snippet
        })),
        links: extractLinks(synthesis),
        executionTime: Date.now() - startTime,
        agent: this.type
      };

      // Cache result
      await cacheService.set(cacheKey, result, 3600);

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

  async researchTopic(topic) {
    return this.execute(`Research the latest developments and best practices for: ${topic}`);
  }

  async compareTechnologies(tech1, tech2) {
    const prompt = `Compare and contrast ${tech1} and ${tech2}. Include:\n- Key features\n- Pros and cons\n- Use cases\n- Performance\n- Community and support`;
    return this.execute(prompt);
  }

  async searchProgrammingDocs(query) {
    logger.info(`${this.name} - Searching programming docs for: ${query}`);
    try {
      const docs = await searchService.searchProgrammingDocs(query);
      return {
        success: true,
        results: docs,
        count: docs.length,
        agent: this.type
      };
    } catch (error) {
      logger.error(`${this.name} - Docs search error:`, error.message);
      return {
        success: false,
        error: error.message,
        agent: this.type
      };
    }
  }

  async getTrendingTechnologies() {
    return this.execute('What are the trending technologies and frameworks in software development right now?');
  }
}

export default new ResearchAgent();
