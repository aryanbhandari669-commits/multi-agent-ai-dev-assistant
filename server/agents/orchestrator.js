import llmService from '../services/llm.js';
import codingAgent from './coding.js';
import researchAgent from './research.js';
import codeReviewAgent from './codeReview.js';
import notesAgent from './notes.js';
import { buildSystemPrompt, AGENT_DECISION_PROMPT, SYNTHESIS_PROMPT } from '../utils/prompt.js';
import { parseJSONResponse } from '../utils/parser.js';
import logger from '../config/logger.js';

class OrchestratorAgent {
  constructor() {
    this.name = 'Orchestrator Agent';
    this.type = 'orchestrator';
    this.agents = {
      coding: codingAgent,
      research: researchAgent,
      codeReview: codeReviewAgent,
      notes: notesAgent
    };
  }

  async route(userMessage, context = {}) {
    logger.info(`${this.name} - Analyzing user request`);
    
    try {
      // Use LLM to decide which agent(s) to use
      const decisionPrompt = AGENT_DECISION_PROMPT.replace('{userMessage}', userMessage);
      const decision = await llmService.chat(
        [{ role: 'user', content: decisionPrompt }],
        '',
        0.3
      );

      let parsedDecision = parseJSONResponse(decision);
      
      if (!parsedDecision) {
        // Fallback: simple keyword-based routing
        parsedDecision = this.fallbackRoute(userMessage);
      }

      logger.info(`${this.name} - Routing decision:`, parsedDecision);

      // Execute agents based on decision
      const results = await this.executeAgents(parsedDecision, userMessage, context);

      // Synthesize results
      const finalAnswer = await this.synthesize(results, userMessage);

      return {
        orchestratorDecision: parsedDecision,
        agentResults: results,
        finalAnswer,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error(`${this.name} - Routing error:`, error.message);
      return {
        success: false,
        error: error.message,
        agent: this.type
      };
    }
  }

  fallbackRoute(userMessage) {
    const lowerMessage = userMessage.toLowerCase();

    if (
      lowerMessage.includes('build') ||
      lowerMessage.includes('write') ||
      lowerMessage.includes('code') ||
      lowerMessage.includes('implement') ||
      lowerMessage.includes('create') ||
      lowerMessage.includes('function') ||
      lowerMessage.includes('class')
    ) {
      return {
        primaryAgent: 'CODING',
        secondaryAgents: [],
        reasoning: 'User request involves writing or creating code',
        taskBreakdown: ['Write code based on requirements']
      };
    }

    if (
      lowerMessage.includes('research') ||
      lowerMessage.includes('learn') ||
      lowerMessage.includes('explain') ||
      lowerMessage.includes('what') ||
      lowerMessage.includes('how') ||
      lowerMessage.includes('find') ||
      lowerMessage.includes('search')
    ) {
      return {
        primaryAgent: 'RESEARCH',
        secondaryAgents: [],
        reasoning: 'User request requires research and information gathering',
        taskBreakdown: ['Search and synthesize information']
      };
    }

    if (
      lowerMessage.includes('bug') ||
      lowerMessage.includes('debug') ||
      lowerMessage.includes('error') ||
      lowerMessage.includes('fix') ||
      lowerMessage.includes('issue') ||
      lowerMessage.includes('review') ||
      lowerMessage.includes('security') ||
      lowerMessage.includes('performance')
    ) {
      return {
        primaryAgent: 'CODE_REVIEW',
        secondaryAgents: [],
        reasoning: 'User request involves code analysis and debugging',
        taskBreakdown: ['Analyze code for issues', 'Provide suggestions']
      };
    }

    if (
      lowerMessage.includes('summarize') ||
      lowerMessage.includes('summary') ||
      lowerMessage.includes('note') ||
      lowerMessage.includes('learned')
    ) {
      return {
        primaryAgent: 'NOTES',
        secondaryAgents: [],
        reasoning: 'User request involves organizing and summarizing information',
        taskBreakdown: ['Summarize and organize content']
      };
    }

    // Default to research if unclear
    return {
      primaryAgent: 'RESEARCH',
      secondaryAgents: [],
      reasoning: 'General inquiry - research approach recommended',
      taskBreakdown: ['Search and provide information']
    };
  }

  async executeAgents(decision, userMessage, context) {
    const results = {};
    const primaryAgent = decision.primaryAgent?.toLowerCase() || 'research';

    logger.info(`${this.name} - Executing primary agent: ${primaryAgent}`);

    // Execute primary agent
    try {
      if (primaryAgent === 'coding') {
        results.coding = await this.agents.coding.execute(userMessage, context);
      } else if (primaryAgent === 'research') {
        results.research = await this.agents.research.execute(userMessage, context);
      } else if (primaryAgent === 'code_review') {
        results.codeReview = await this.agents.codeReview.execute(userMessage, context);
      } else if (primaryAgent === 'notes') {
        results.notes = await this.agents.notes.execute(userMessage, context);
      } else {
        results.research = await this.agents.research.execute(userMessage, context);
      }
    } catch (error) {
      logger.error(`${this.name} - Primary agent error:`, error.message);
      results.error = error.message;
    }

    // Execute secondary agents if needed
    const secondaryAgents = decision.secondaryAgents || [];
    for (const agent of secondaryAgents) {
      logger.info(`${this.name} - Executing secondary agent: ${agent}`);
      try {
        const agentKey = agent.toLowerCase();
        if (agentKey === 'coding' && !results.coding) {
          results.coding = await this.agents.coding.execute(userMessage, context);
        } else if (agentKey === 'research' && !results.research) {
          results.research = await this.agents.research.execute(userMessage, context);
        } else if (agentKey === 'code_review' && !results.codeReview) {
          results.codeReview = await this.agents.codeReview.execute(userMessage, context);
        } else if (agentKey === 'notes' && !results.notes) {
          results.notes = await this.agents.notes.execute(userMessage, context);
        }
      } catch (error) {
        logger.error(`${this.name} - Secondary agent ${agent} error:`, error.message);
      }
    }

    return results;
  }

  async synthesize(results, userMessage) {
    logger.info(`${this.name} - Synthesizing results`);

    try {
      const agentResultsText = Object.entries(results)
        .filter(([key, value]) => value && value.success)
        .map(([agent, result]) => {
          if (result.synthesis) return `${agent.toUpperCase()}:\n${result.synthesis}`;
          if (result.content) return `${agent.toUpperCase()}:\n${result.content}`;
          return `${agent.toUpperCase()}:\n${JSON.stringify(result, null, 2)}`;
        })
        .join('\n\n');

      if (!agentResultsText) {
        return {
          success: false,
          message: 'No successful agent results to synthesize'
        };
      }

      const synthesisPrompt = SYNTHESIS_PROMPT.replace('{agentResults}', agentResultsText);
      const finalAnswer = await llmService.chat(
        [{ role: 'user', content: synthesisPrompt }],
        buildSystemPrompt('orchestrator'),
        0.7
      );

      return {
        success: true,
        content: finalAnswer,
        agentsUsed: Object.keys(results).filter(k => results[k]?.success)
      };
    } catch (error) {
      logger.error(`${this.name} - Synthesis error:`, error.message);
      
      // Fallback: return first successful result
      for (const [agent, result] of Object.entries(results)) {
        if (result?.success && (result.content || result.synthesis)) {
          return {
            success: true,
            content: result.content || result.synthesis,
            agentsUsed: [agent],
            fallback: true
          };
        }
      }

      return {
        success: false,
        error: error.message
      };
    }
  }

  async explainRepository(repositoryUrl) {
    const prompt = `Explain the structure and purpose of this GitHub repository: ${repositoryUrl}

Provide:
- Repository overview
- Main purpose and use cases
- Key components and their relationships
- Technology stack
- How to get started`;
    
    return this.route(prompt);
  }

  async buildFeature(featureDescription) {
    const prompt = `Help me build this feature: ${featureDescription}

Provide:
- Architecture/design approach
- Step-by-step implementation guide
- Code examples
- Testing strategy
- Deployment considerations`;
    
    return this.route(prompt);
  }

  async debugCode(code, description = '') {
    const prompt = `Help me debug this code problem: ${description}\n\n\`\`\`\n${code}\n\`\`\`

Provide:
- Identify the bug(s)
- Explain what's wrong
- Provide fixed code
- Explain the fix
- Suggest prevention strategies`;
    
    return this.route(prompt);
  }
}

export default new OrchestratorAgent();
