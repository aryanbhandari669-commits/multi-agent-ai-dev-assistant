import { useState, useCallback } from 'react';
import { chatAPI } from '../services/api.js';
import useChatStore from '../store/chatStore.js';

export const useChat = () => {
  const {
    conversationId,
    messages,
    isLoading,
    error,
    setConversationId,
    addMessage,
    setLoading,
    setError,
    startNewConversation
  } = useChatStore();

  const sendMessage = useCallback(
    async (userMessage) => {
      if (!userMessage.trim()) return;

      setLoading(true);
      setError(null);

      // Add user message immediately
      addMessage({
        id: Date.now(),
        role: 'user',
        content: userMessage,
        timestamp: new Date()
      });

      try {
        const response = await chatAPI.sendMessage(
          conversationId,
          userMessage
        );

        setConversationId(response.data.conversationId);

        // Add assistant response
        addMessage({
          id: response.data.assistantMessageId,
          role: 'assistant',
          content: response.data.response,
          timestamp: new Date(),
          metadata: response.data.metadata
        });
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Failed to send message');
        console.error('Send message error:', err);
      } finally {
        setLoading(false);
      }
    },
    [conversationId, setConversationId, addMessage, setLoading, setError]
  );

  const reviewCode = useCallback(
    async (code, language = 'javascript') => {
      setLoading(true);
      setError(null);

      try {
        const response = await chatAPI.reviewCode(
          conversationId,
          code,
          language
        );
        addMessage({
          id: response.data.assistantMessageId,
          role: 'assistant',
          content: response.data.response,
          timestamp: new Date(),
          metadata: response.data.metadata
        });
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Failed to review code');
      } finally {
        setLoading(false);
      }
    },
    [conversationId, addMessage, setLoading, setError]
  );

  const researchTopic = useCallback(
    async (topic) => {
      setLoading(true);
      setError(null);

      try {
        const response = await chatAPI.research(conversationId, topic);
        addMessage({
          id: response.data.assistantMessageId,
          role: 'assistant',
          content: response.data.response,
          timestamp: new Date(),
          metadata: response.data.metadata
        });
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Failed to research topic');
      } finally {
        setLoading(false);
      }
    },
    [conversationId, addMessage, setLoading, setError]
  );

  return {
    conversationId,
    messages,
    isLoading,
    error,
    sendMessage,
    reviewCode,
    researchTopic,
    startNewConversation
  };
};
