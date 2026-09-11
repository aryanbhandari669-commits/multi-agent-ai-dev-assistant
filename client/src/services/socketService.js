import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

let socket = null;

export const useWebSocket = (conversationId) => {
  const [connected, setConnected] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!conversationId) return;

    // Initialize socket connection
    socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join_conversation', conversationId);
    });

    socket.on('message_processing', (msg) => {
      setData({ type: 'processing', ...msg });
    });

    socket.on('message_completed', (msg) => {
      setData({ type: 'completed', ...msg });
    });

    socket.on('error', (err) => {
      setError(err);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [conversationId]);

  return { connected, data, error };
};

export const getSocket = () => socket;
