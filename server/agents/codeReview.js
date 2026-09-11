import llmService from '../services/llm.js';
import { buildSystemPrompt } from '../utils/prompt.js';
import { extractCodeBlocks } from '../utils/parser.js';
import logger from '../config/logger.js';

class CodeReviewAgent {
  constructor() {
    this.name = 'Code Review Agent';
    this.type = 'codeReview';
  }

  async execute(userMessage, context = {}) {
    logger.info(`${this.name} - Processing request`);
    
    const startTime = Date.now();
    try {
      const systemPrompt = buildSystemPrompt('codeReview');
      const messages = [
        { role: 'user', content: userMessage }
      ];

      const response = await llmService.chat(messages, systemPrompt, 0.5);
      
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

  async reviewCode(code, language = 'javascript') {
    const prompt = `Perform a comprehensive code review of this ${language} code:

\`\`\`${language}
${code}
\`\`\`

Analyze for:
1. **Bugs and Logic Errors** - Identify any functional issues
2. **Security Vulnerabilities** - Check for security risks (SQL injection, XSS, etc.)
3. **Performance Issues** - Find optimization opportunities
4. **Code Quality** - Evaluate readability, maintainability, naming
5. **Best Practices** - Ensure adherence to ${language} standards
6. **Error Handling** - Check exception handling and edge cases

Provide:
- List of issues with severity levels (CRITICAL, HIGH, MEDIUM, LOW)
- Specific line numbers where possible
- Suggested fixes
- Overall quality score (0-100)`;

    return this.execute(prompt);
  }

  async findVulnerabilities(code, language = 'javascript') {
    const prompt = `Identify security vulnerabilities in this ${language} code:

\`\`\`${language}
${code}
\`\`\`

Check for:
- Injection vulnerabilities (SQL, command, etc.)
- Cross-site scripting (XSS)
- Authentication/Authorization issues
- Cryptography problems
- Data exposure
- Insecure dependencies

Provide:
- Detailed description of each vulnerability
- Impact assessment
- Remediation steps`;

    return this.execute(prompt);
  }

  async optimizePerformance(code, language = 'javascript') {
    const prompt = `Analyze this ${language} code for performance improvements:

\`\`\`${language}
${code}
\`\`\`

Consider:
- Time complexity (Big O analysis)
- Space complexity
- Algorithm efficiency
- Caching opportunities
- Unnecessary operations
- Memory leaks

Provide:
- Performance bottlenecks
- Optimization suggestions with examples
- Expected improvements`;

    return this.execute(prompt);
  }

  async parseIssues(reviewContent) {
    try {
      const issues = [];
      const lines = reviewContent.split('\n');
      
      let currentIssue = null;
      for (const line of lines) {
        if (line.includes('CRITICAL') || line.includes('HIGH') || line.includes('MEDIUM') || line.includes('LOW')) {
          if (currentIssue) issues.push(currentIssue);
          currentIssue = { severity: 'MEDIUM', description: line };
          
          if (line.includes('CRITICAL')) currentIssue.severity = 'CRITICAL';
          else if (line.includes('HIGH')) currentIssue.severity = 'HIGH';
          else if (line.includes('LOW')) currentIssue.severity = 'LOW';
        }
      }
      if (currentIssue) issues.push(currentIssue);
      
      return issues;
    } catch (error) {
      logger.error(`${this.name} - Parse issues error:`, error.message);
      return [];
    }
  }
}

export default new CodeReviewAgent();
