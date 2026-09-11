import dotenv from 'dotenv';

dotenv.config();

const config = {
  port: process.env.PORT || 5000,
  env: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-dev-assistant',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  
  llm: {
    openaiKey: process.env.OPENAI_API_KEY,
    claudeKey: process.env.CLAUDE_API_KEY,
    model: process.env.LLM_MODEL || 'gpt-3.5-turbo',
    temperature: 0.7,
    maxTokens: 2000
  },

  search: {
    engine: process.env.SEARCH_ENGINE || 'serpapi',
    serpapiKey: process.env.SERPAPI_API_KEY,
    googleKey: process.env.GOOGLE_API_KEY,
    googleSearchEngineId: process.env.GOOGLE_SEARCH_ENGINE_ID
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: '7d'
  },

  cache: {
    ttl: 3600,
    maxSize: 1000
  }
};

export default config;
