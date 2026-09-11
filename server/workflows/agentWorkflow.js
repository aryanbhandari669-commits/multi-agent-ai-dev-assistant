import orchestratorAgent from '../agents/orchestrator.js';
import databaseService from '../services/database.js';
import { generateId, generateConversationId } from '../utils/helpers.js';
import logger from '../config/logger.js';

class AgentWorkflow {
  constructor() {
    this.name = 'Agent Workflow';
  }

  async processUserMessage(userMessage, conversationId = null, context = {}) {
    logger.info(`${this.name} - Processing: ${userMessage.substring(0, 50)}...`);
    
    const startTime = Date.now();
    
    try {
      // Create conversation if needed
      if (!conversationId) {
        conversationId = generateConversationId();
        await databaseService.createConversation(conversationId);
        logger.info(`${this.name} - Created new conversation: ${conversationId}`);
      }

      // Get orchestrator response
      const orchestratorResult = await orchestratorAgent.route(userMessage, context);

      // Store user message
      const userMessageId = generateId();
      await databaseService.addMessage(conversationId, {
        id: userMessageId,
        role: 'user',
        content: userMessage,
        timestamp: new Date(),
        metadata: {
          conversationId,
          wordCount: userMessage.split(' ').length
        }
      });

      // Store assistant message
      const assistantMessageId = generateId();
      await databaseService.addMessage(conversationId, {
        id: assistantMessageId,
        role: 'assistant',
        content: orchestratorResult.finalAnswer?.content || orchestratorResult.error || 'No response',
        agentType: 'orchestrator',
        timestamp: new Date(),
        metadata: {
          orchestratorDecision: orchestratorResult.orchestratorDecision,
          agentsUsed: orchestratorResult.finalAnswer?.agentsUsed || [],
          executionTime: Date.now() - startTime
        }
      });

      // Store agent history
      for (const [agentType, result] of Object.entries(orchestratorResult.agentResults)) {
        if (result?.success) {
          await databaseService.addAgentHistory(conversationId, {
            agent: agentType,
            task: userMessage.substring(0, 100),
            status: 'completed',
            result,
            timestamp: new Date()
          });
        }
      }

      logger.info(`${this.name} - Completed in ${Date.now() - startTime}ms`);

      return {
        success: true,
        conversationId,
        userMessageId,
        assistantMessageId,
        response: orchestratorResult.finalAnswer?.content,
        metadata: {
          orchestratorDecision: orchestratorResult.orchestratorDecision,
          agentsUsed: orchestratorResult.finalAnswer?.agentsUsed,
          executionTime: Date.now() - startTime
        }
      };
    } catch (error) {
      logger.error(`${this.name} - Error:`, error.message);
      return {
        success: false,
        conversationId,
        error: error.message,
        executionTime: Date.now() - startTime
      };
    }
  }

  async processMultiAgentTask(taskDescription, agents = ['research', 'notes'], context = {}) {
    logger.info(`${this.name} - Multi-agent task: ${agents.join(', ')}`);
    
    const conversationId = generateConversationId();
    const results = {};

    try {
      await databaseService.createConversation(conversationId, taskDescription);

      // Create task record
      const taskId = generateId();
      await databaseService.createTask({
        taskId,
        conversationId,
        title: taskDescription,
        type: agents[0] || 'general',
        status: 'in-progress',
        agentsInvolved: agents
      });

      // Execute workflow
      const workflowResult = await this.processUserMessage(
        taskDescription,
        conversationId,
        context
      );

      // Update task
      await databaseService.updateTask(taskId, {
        status: 'completed',
        result: workflowResult,
        completedAt: new Date(),
        actualDuration: workflowResult.metadata?.executionTime || 0
      });

      return {
        success: true,
        taskId,
        conversationId,
        result: workflowResult
      };
    } catch (error) {
      logger.error(`${this.name} - Multi-agent task error:`, error.message);
      return {
        success: false,
        conversationId,
        error: error.message
      };
    }
  }

  async processSequentialAgentTask(tasks) {
    logger.info(`${this.name} - Sequential task with ${tasks.length} steps`);
    
    const conversationId = generateConversationId();
    const results = [];

    try {
      await databaseService.createConversation(conversationId);

      for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        logger.info(`${this.name} - Executing step ${i + 1}/${tasks.length}`);

        const result = await this.processUserMessage(
          task.message,
          conversationId,
          task.context || {}
        );

        results.push({
          step: i + 1,
          task: task.message,
          result
        });

        // Allow for context passing between steps
        if (task.onResult) {
          await task.onResult(result);
        }
      }

      return {
        success: true,
        conversationId,
        results,
        summary: `Completed ${results.length} sequential tasks`
      };
    } catch (error) {
      logger.error(`${this.name} - Sequential task error:`, error.message);
      return {
        success: false,
        conversationId,
        error: error.message,
        completedSteps: results.length
      };
    }
  }

  async createResearchAndNotesWorkflow(researchTopic) {
    logger.info(`${this.name} - Research & Notes workflow for: ${researchTopic}`);
    
    const tasks = [
      {
        message: `Research the following topic: ${researchTopic}

Provide:
- Overview
- Key concepts
- Current trends
- Resources for learning`,
        context: { type: 'research' }
      },
      {
        message: `Based on the research above, create a comprehensive learning note

Include:
- Main takeaways
- Key concepts explained
- Practical applications
- Further learning resources`,
        context: { type: 'notes' }
      }
    ];

    return this.processSequentialAgentTask(tasks);
  }

  async createCodeReviewAndRefactorWorkflow(code, language = 'javascript') {
    logger.info(`${this.name} - Code Review & Refactor workflow`);
    
    const tasks = [
      {
        message: `Review this ${language} code for bugs, security, and performance:\n\`\`\`${language}\n${code}\n\`\`\``,
        context: { type: 'review' }
      },
      {
        message: `Based on the review above, provide refactored code with improvements`,
        context: { type: 'refactor' }
      }
    ];

    return this.processSequentialAgentTask(tasks);
  }

  async createFeatureBuildWorkflow(featureDescription) {
    logger.info(`${this.name} - Feature build workflow`);
    
    const tasks = [
      {
        message: `Design and plan the implementation for: ${featureDescription}

Provide:
- Architecture
- Key components
- Implementation steps
- Testing strategy`,
        context: { type: 'design' }
      },
      {
        message: `Based on the design, provide production-ready code implementation`,
        context: { type: 'code' }
      },
      {
        message: `Review the implementation code for quality and security`,
        context: { type: 'review' }
      }
    ];

    return this.processSequentialAgentTask(tasks);
  }
}

export default new AgentWorkflow();
