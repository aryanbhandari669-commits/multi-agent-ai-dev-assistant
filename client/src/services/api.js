import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const chatAPI = {
  sendMessage: (conversationId, message, context = {}) =>
    apiClient.post('/chat', { conversationId, message, context }),

  getConversation: (conversationId) =>
    apiClient.get(`/chat/${conversationId}`),

  deleteConversation: (conversationId) =>
    apiClient.delete(`/chat/${conversationId}`),

  reviewCode: (conversationId, code, language = 'javascript') =>
    apiClient.post(`/chat/${conversationId}/review-code`, {
      code,
      language
    }),

  research: (conversationId, topic) =>
    apiClient.post(`/chat/${conversationId}/research`, { topic })
};

export const notesAPI = {
  getNotes: (category, tag, search, limit = 20, skip = 0) =>
    apiClient.get('/notes', {
      params: { category, tag, search, limit, skip }
    }),

  createNote: (title, content, tags = [], category = 'general') =>
    apiClient.post('/notes', { title, content, tags, category }),

  getNote: (noteId) => apiClient.get(`/notes/${noteId}`),

  updateNote: (noteId, updates) =>
    apiClient.put(`/notes/${noteId}`, updates),

  deleteNote: (noteId) => apiClient.delete(`/notes/${noteId}`),

  createFromCode: (code, language, description) =>
    apiClient.post('/notes/from-code', { code, language, description }),

  createFromConversation: (conversationId, title) =>
    apiClient.post('/notes/from-conversation', { conversationId, title })
};

export const tasksAPI = {
  getTasks: (status, type, conversationId, limit = 20, skip = 0) =>
    apiClient.get('/tasks', {
      params: { status, type, conversationId, limit, skip }
    }),

  createTask: (title, description, type = 'general', priority = 'medium') =>
    apiClient.post('/tasks', { title, description, type, priority }),

  getTask: (taskId) => apiClient.get(`/tasks/${taskId}`),

  updateTask: (taskId, updates) =>
    apiClient.put(`/tasks/${taskId}`, updates),

  executeTask: (taskId) =>
    apiClient.post(`/tasks/${taskId}/execute`),

  getQueueStatus: () => apiClient.get('/tasks/queue/status')
};

export default apiClient;
