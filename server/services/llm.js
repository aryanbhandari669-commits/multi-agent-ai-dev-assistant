import axios from 'axios';
import logger from '../config/logger.js';

const LLM_MODELS = {
  gpt4: 'gpt-4',
  gpt35: 'gpt-3.5-turbo',
  claude3: 'claude-3-opus-20240229'
};

class LLMService {
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.claudeApiKey = process.env.CLAUDE_API_KEY;
    this.model = process.env.LLM_MODEL || LLM_MODELS.gpt35;
  }

  async chat(messages, systemPrompt = '', temperature = 0.7) {
    try {
      if (this.model.startsWith('gpt')) {
        return await this.callOpenAI(messages, systemPrompt, temperature);
      } else if (this.model.startsWith('claude')) {
        return await this.callClaude(messages, systemPrompt, temperature);
      } else {
        throw new Error(`Unsupported model: ${this.model}`);
      }
    } catch (error) {
      logger.error('LLM Service Error:', error);
      throw error;
    }
  }

  async callOpenAI(messages, systemPrompt = '', temperature = 0.7) {
    const formattedMessages = [
      ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
      ...messages
    ];

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: this.model,
          messages: formattedMessages,
          temperature,
          max_tokens: 2000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      logger.error('OpenAI API Error:', error.response?.data || error.message);
      throw error;
    }
  }

  async callClaude(messages, systemPrompt = '', temperature = 0.7) {
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    try {
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: this.model,
          max_tokens: 2000,
          system: systemPrompt,
          messages: formattedMessages,
          temperature
        },
        {
          headers: {
            'x-api-key': this.claudeApiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json'
          }
        }
      );

      return response.data.content[0].text;
    } catch (error) {
      logger.error('Claude API Error:', error.response?.data || error.message);
      throw error;
    }
  }

  async generateEmbedding(text) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/embeddings',
        {
          input: text,
          model: 'text-embedding-3-small'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.data[0].embedding;
    } catch (error) {
      logger.error('Embedding Error:', error.message);
      throw error;
    }
  }

  setModel(model) {
    if (Object.values(LLM_MODELS).includes(model)) {
      this.model = model;
    } else {
      throw new Error(`Invalid model: ${model}`);
    }
  }
}

export default new LLMService();
