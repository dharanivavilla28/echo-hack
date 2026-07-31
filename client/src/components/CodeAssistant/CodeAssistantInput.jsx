import { useRef, useEffect } from 'react';

/**
 * CodeAssistantInput
 * Sticky bottom textarea bar with send button.
 * - Enter → submit
 * - Shift+Enter → newline
 * - Disabled while loading
 */
function CodeAssistantInput({ value, onChange, onSubmit, loading }) {
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!loading && value.trim()) {
        onSubmit();
      }
    }
  };

  return (
    <div className="ca-input-bar">
      <textarea
        ref={textareaRef}
        className="ca-input-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask about your code… (Enter to send)"
        disabled={loading}
        rows={1}
      />
      <button
        className="ca-input-send"
        onClick={onSubmit}
        disabled={loading || !value.trim()}
        title="Send (Enter)"
      >
        {loading ? (
          <span className="ca-input-spinner" />
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        )}
      </button>
    </div>
  );
}

export default CodeAssistantInput;
