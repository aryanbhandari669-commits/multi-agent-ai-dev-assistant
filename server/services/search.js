import axios from 'axios';
import config from '../config/config.js';
import logger from '../config/logger.js';

class SearchService {
  constructor() {
    this.engine = config.search.engine;
    this.serpapiKey = config.search.serpapiKey;
    this.googleKey = config.search.googleKey;
    this.googleSearchEngineId = config.search.googleSearchEngineId;
  }

  async search(query, options = {}) {
    try {
      if (this.engine === 'serpapi') {
        return await this.searchSerpAPI(query, options);
      } else if (this.engine === 'google') {
        return await this.searchGoogle(query, options);
      } else {
        throw new Error(`Unknown search engine: ${this.engine}`);
      }
    } catch (error) {
      logger.error('Search error:', error.message);
      throw error;
    }
  }

  async searchSerpAPI(query, options = {}) {
    try {
      const response = await axios.get('https://serpapi.com/search', {
        params: {
          q: query,
          api_key: this.serpapiKey,
          num: options.limit || 10,
          ...options
        }
      });

      return {
        results: response.data.organic_results || [],
        answerBox: response.data.answer_box,
        knowledge: response.data.knowledge_graph
      };
    } catch (error) {
      logger.error('SerpAPI search error:', error.message);
      throw error;
    }
  }

  async searchGoogle(query, options = {}) {
    try {
      const response = await axios.get(
        'https://www.googleapis.com/customsearch/v1',
        {
          params: {
            q: query,
            key: this.googleKey,
            cx: this.googleSearchEngineId,
            num: options.limit || 10
          }
        }
      );

      return {
        results: response.data.items || [],
        totalResults: response.data.queries.request[0].totalResults
      };
    } catch (error) {
      logger.error('Google Search error:', error.message);
      throw error;
    }
  }
}

export default new SearchService();
