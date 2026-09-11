import { useState } from 'react';
import { Send } from 'lucide-react';
import './ChatInput.css';

function ChatInput({ onSend, disabled }) {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSend(input);
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="chat-input-form">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={disabled}
        placeholder="Type your message..."
        className="chat-input"
      />
      <button
        type="submit"
        disabled={disabled || !input.trim()}
        className="chat-input-button"
      >
        <Send size={20} />
      </button>
    </form>
  );
}

export default ChatInput;
