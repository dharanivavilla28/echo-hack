import { useRef, useEffect } from 'react';

/**
 * Renders a single message's content, with basic code block formatting.
 * Since the project doesn't have a markdown library installed, we do
 * lightweight regex-based parsing for code blocks and inline code.
 */
function MessageContent({ content }) {
  // Split on fenced code blocks ```lang\ncode\n```
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <span className="ca-msg-content">
      {parts.map((part, i) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          // Extract language and code
          const inner = part.slice(3, -3);
          const newlineIdx = inner.indexOf('\n');
          const lang = newlineIdx > -1 ? inner.slice(0, newlineIdx).trim() : '';
          const code = newlineIdx > -1 ? inner.slice(newlineIdx + 1) : inner;
          return (
            <div key={i} className="ca-code-block">
              {lang && <div className="ca-code-lang">{lang}</div>}
              <pre><code>{code}</code></pre>
            </div>
          );
        }

        // Inline code `code`
        const inlineParts = part.split(/(`[^`]+`)/g);
        return inlineParts.map((inlinePart, j) => {
          if (inlinePart.startsWith('`') && inlinePart.endsWith('`')) {
            return (
              <code key={`${i}-${j}`} className="ca-inline-code">
                {inlinePart.slice(1, -1)}
              </code>
            );
          }
          // Render plain text with line breaks preserved
          return <span key={`${i}-${j}`} style={{ whiteSpace: 'pre-wrap' }}>{inlinePart}</span>;
        });
      })}
    </span>
  );
}

/**
 * CodeAssistantChat
 * Renders the full message history for the AI code assistant.
 */
function CodeAssistantChat({ messages, loading }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  return (
    <div className="ca-chat">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`ca-msg ${msg.role === 'user' ? 'ca-msg-user' : 'ca-msg-assistant'}`}
        >
          <div className={`ca-bubble ${msg.role === 'user' ? 'ca-bubble-user' : 'ca-bubble-assistant'}`}>
            {msg.role === 'assistant' && (
              <div className="ca-bubble-label">⚡ ECHO DEV AI</div>
            )}
            <MessageContent content={msg.content} />
          </div>
        </div>
      ))}

      {loading && (
        <div className="ca-msg ca-msg-assistant">
          <div className="ca-bubble ca-bubble-assistant ca-bubble-loading">
            <div className="ca-bubble-label">⚡ ECHO DEV AI</div>
            <div className="ca-typing">
              <span className="ca-typing-dot" />
              <span className="ca-typing-dot" />
              <span className="ca-typing-dot" />
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}

export default CodeAssistantChat;
