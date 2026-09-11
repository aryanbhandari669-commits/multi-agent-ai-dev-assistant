import { Loader } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './Message.css';

function Message({ role, content, isLoading, metadata }) {
  if (isLoading) {
    return (
      <div className="message loading">
        <div className="flex items-center space-x-2">
          <Loader className="animate-spin" size={20} />
          <span>Thinking...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`message ${role}`}>
      <div className="message-content">
        <ReactMarkdown
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <SyntaxHighlighter
                  style={atomDark}
                  language={match[1]}
                  PreTag="div"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code className="bg-gray-800 px-2 py-1 rounded text-sm" {...props}>
                  {children}
                </code>
              );
            }
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
      
      {metadata && (
        <div className="message-metadata text-xs text-gray-500 mt-2">
          {metadata.agentsUsed && (
            <div className="flex space-x-2 flex-wrap">
              {metadata.agentsUsed.map((agent) => (
                <span key={agent} className="badge badge-secondary">
                  {agent}
                </span>
              ))}
            </div>
          )}
          {metadata.executionTime && (
            <div>Execution time: {(metadata.executionTime / 1000).toFixed(2)}s</div>
          )}
        </div>
      )}
    </div>
  );
}

export default Message;
