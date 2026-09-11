import axios from 'axios';
import config from '../config/config.js';
import logger from '../config/logger.js';

class LLMService {
  constructor() {
    this.openaiKey = config.llm.openaiKey;
    this.claudeKey = config.llm.claudeKey;
    this.model = config.llm.model;
    this.temperature = config.llm.temperature;
    this.maxTokens = config.llm.maxTokens;
  }

  async chat(messages, systemPrompt = '', temperature = this.temperature) {
    try {
      if (this.model.includes('gpt')) {
        return await this.chatOpenAI(messages, systemPrompt, temperature);
      } else if (this.model.includes('claude')) {
        return await this.chatClaude(messages, systemPrompt, temperature);
      } else {
        throw new Error(`Unknown model: ${this.model}`);
      }
    } catch (error) {
      logger.error('LLM chat error:', error.message);
      throw error;
    }
  }

  async chatOpenAI(messages, systemPrompt = '', temperature) {
    try {
      const formattedMessages = systemPrompt
        ? [{ role: 'system', content: systemPrompt }, ...messages]
        : messages;

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: this.model,
          messages: formattedMessages,
          temperature,
          max_tokens: this.maxTokens
        },
        {
          headers: {
            Authorization: `Bearer ${this.openaiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      logger.error('OpenAI API error:', error.response?.data || error.message);
      throw error;
    }
  }

  async chatClaude(messages, systemPrompt = '', temperature) {
    try {
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: this.model,
          max_tokens: this.maxTokens,
          system: systemPrompt,
          messages: messages.map((msg) => ({
            role: msg.role,
            content: msg.content
          }))
        },
        {
          headers: {
            'x-api-key': this.claudeKey,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.content[0].text;
    } catch (error) {
      logger.error('Claude API error:', error.response?.data || error.message);
      throw error;
    }
  }

  async generateEmbedding(text) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/embeddings',
        {
          model: 'text-embedding-ada-002',
          input: text
        },
        {
          headers: {
            Authorization: `Bearer ${this.openaiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.data[0].embedding;
    } catch (error) {
      logger.error('Embedding error:', error.message);
      throw error;
    }
  }
}

export default new LLMService();
