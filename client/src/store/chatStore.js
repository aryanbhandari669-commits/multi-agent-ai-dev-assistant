import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

const useChatStore = create((set) => ({
  conversationId: null,
  messages: [],
  isLoading: false,
  error: null,

  setConversationId: (id) => set({ conversationId: id }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message]
    })),

  addMessages: (messages) =>
    set((state) => ({
      messages: [...state.messages, ...messages]
    })),

  clearMessages: () => set({ messages: [] }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  updateLastMessage: (updates) =>
    set((state) => {
      const newMessages = [...state.messages];
      if (newMessages.length > 0) {
        newMessages[newMessages.length - 1] = {
          ...newMessages[newMessages.length - 1],
          ...updates
        };
      }
      return { messages: newMessages };
    }),

  startNewConversation: () =>
    set({
      conversationId: null,
      messages: [],
      error: null
    })
}));

export default useChatStore;
