import axios from 'axios';
import logger from '../config/logger.js';

class SearchService {
  constructor() {
    this.serpApiKey = process.env.SERPAPI_API_KEY;
    this.googleApiKey = process.env.GOOGLE_API_KEY;
    this.searchEngine = process.env.SEARCH_ENGINE || 'serpapi';
  }

  async search(query, options = {}) {
    try {
      if (this.searchEngine === 'serpapi') {
        return await this.searchWithSerpApi(query, options);
      } else if (this.searchEngine === 'google') {
        return await this.searchWithGoogle(query, options);
      } else {
        throw new Error(`Unsupported search engine: ${this.searchEngine}`);
      }
    } catch (error) {
      logger.error('Search Service Error:', error);
      throw error;
    }
  }

  async searchWithSerpApi(query, options = {}) {
    try {
      const params = {
        q: query,
        api_key: this.serpApiKey,
        engine: options.engine || 'google',
        num: options.num || 10,
        ...(options.type === 'news' && { tbm: 'nws' }),
        ...(options.type === 'video' && { tbm: 'vid' })
      };

      const response = await axios.get('https://serpapi.com/search', { params });

      return {
        results: response.data.organic_results || [],
        answerBox: response.data.answer_box,
        relatedSearches: response.data.related_searches || [],
        totalResults: response.data.search_information?.total_results || 0
      };
    } catch (error) {
      logger.error('SerpApi Error:', error.response?.data || error.message);
      throw error;
    }
  }

  async searchWithGoogle(query, options = {}) {
    try {
      const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
        params: {
          q: query,
          key: this.googleApiKey,
          cx: process.env.GOOGLE_SEARCH_ENGINE_ID,
          num: options.num || 10
        }
      });

      return {
        results: response.data.items || [],
        totalResults: response.data.queries?.request?.[0]?.totalResults || 0
      };
    } catch (error) {
      logger.error('Google Search Error:', error.response?.data || error.message);
      throw error;
    }
  }

  async searchProgrammingDocs(query) {
    const sources = [
      `site:stackoverflow.com ${query}`,
      `site:github.com ${query}`,
      `site:developer.mozilla.org ${query}`,
      `site:docs.python.org ${query}`
    ];

    const allResults = [];
    for (const source of sources) {
      try {
        const results = await this.search(source, { num: 3 });
        allResults.push(...results.results);
      } catch (error) {
        logger.warn(`Search failed for source: ${source}`, error.message);
      }
    }

    return allResults;
  }

  async getTrendingTopics(category = 'technology') {
    try {
      const response = await axios.get('https://trends.google.com/trends/api/dailytrends', {
        params: {
          hl: 'en-US',
          tz: 0,
          geo: 'US'
        }
      });
      return response.data;
    } catch (error) {
      logger.warn('Could not fetch trending topics:', error.message);
      return [];
    }
  }
}

export default new SearchService();
