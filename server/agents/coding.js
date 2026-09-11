import llmService from '../services/llm.js';
import { buildSystemPrompt } from '../utils/prompt.js';
import { parseJSONResponse, extractCodeBlocks, cleanResponse } from '../utils/parser.js';
import logger from '../config/logger.js';

class CodingAgent {
  constructor() {
    this.name = 'Coding Agent';
    this.type = 'coding';
  }

  async execute(userMessage, context = {}) {
    logger.info(`${this.name} - Processing request`);
    
    const startTime = Date.now();
    try {
      const systemPrompt = buildSystemPrompt('coding');
      const messages = [
        { role: 'user', content: userMessage }
      ];

      const response = await llmService.chat(messages, systemPrompt, 0.7);
      
      const result = {
        success: true,
        content: response,
        codeBlocks: extractCodeBlocks(response),
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

  async writeCode(requirements, language = 'javascript') {
    const prompt = `Write production-ready ${language} code based on these requirements:
${requirements}

Include:
- Clear function/class documentation
- Error handling
- Type hints/JSDoc comments
- Example usage`;

    return this.execute(prompt);
  }

  async refactorCode(code, language = 'javascript') {
    const prompt = `Refactor this ${language} code to improve readability, performance, and maintainability:

\`\`\`${language}
${code}
\`\`\`

Provide:
- Explanation of changes
- Improved code
- Performance benefits`;

    return this.execute(prompt);
  }

  async explainCode(code, language = 'javascript') {
    const prompt = `Explain this ${language} code in detail:

\`\`\`${language}
${code}
\`\`\`

Breakdown:
- What it does
- How it works
- Key concepts
- Potential issues`;

    return this.execute(prompt);
  }

  async generateDocumentation(code, language = 'javascript') {
    const prompt = `Generate comprehensive documentation for this ${language} code:

\`\`\`${language}
${code}
\`\`\`

Include:
- Function/class descriptions
- Parameter documentation
- Return value documentation
- Usage examples
- Edge cases`;

    return this.execute(prompt);
  }
}

export default new CodingAgent();
