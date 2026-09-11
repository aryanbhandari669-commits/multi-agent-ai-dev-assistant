import { useEffect, useRef } from 'react';
import { useChat } from '../hooks/useChat';
import Message from '../components/Message';
import ChatInput from '../components/ChatInput';
import './ChatPage.css';

function ChatPage() {
  const { messages, isLoading, error, sendMessage } = useChat();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-page">
      <div className="chat-header">
        <h2>Multi-Agent AI Assistant</h2>
        <p className="text-sm text-gray-400">Chat with your AI development assistant</p>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <h3>Start a conversation</h3>
            <p>Ask me anything about coding, research, reviews, or notes!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <Message key={msg.id} {...msg} />
          ))
        )}
        {isLoading && <Message role="assistant" content="" isLoading={true} />}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="chat-error">
          <p>{error}</p>
        </div>
      )}

      <ChatInput onSend={sendMessage} disabled={isLoading} />
    </div>
  );
}

export default ChatPage;
