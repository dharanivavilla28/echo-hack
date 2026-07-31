import { useState } from 'react';
import CodeAssistantChat from './CodeAssistantChat.jsx';
import CodeAssistantInput from './CodeAssistantInput.jsx';
import { askAssistant } from '../../services/assistantService.js';

const WELCOME_MESSAGE = {
  role: 'assistant',
  content: `Hi! I'm your **ECHO DEV AI Code Assistant**. 🚀

I can help you:
- **Explain** components, hooks, or functions
- **Debug** errors and unexpected behavior
- **Locate** where specific features are implemented
- **Understand** API endpoints or database models

Ask me anything about your project! For example:
- "Why is this useEffect needed?"
- "Where is authentication implemented?"
- "Explain this API endpoint."
- "What causes this error?"`,
};

/**
 * CodeAssistantPanel
 * Right-side AI code assistant panel within the Builder page.
 */
function CodeAssistantPanel({ code, projectTitle, isOpen, onClose }) {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const buildProjectFiles = () => {
    if (!code) return [];
    return [
      {
        path: `${projectTitle || 'App'}/index.html`,
        content: code,
      },
    ];
  };

  const handleSubmit = async () => {
    const question = inputValue.trim();
    if (!question || loading) return;

    setError('');
    setInputValue('');

    // Add user message
    const userMessage = { role: 'user', content: question };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const projectFiles = buildProjectFiles();
      const answer = await askAssistant(question, projectFiles);

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: answer || 'Sorry, I could not generate a response. Please try again.' },
      ]);
    } catch (err) {
      let errorMsg = 'Something went wrong. Please try again.';
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.message) {
        errorMsg = err.message;
      }
      setError(errorMsg);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `⚠️ Error: ${errorMsg}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="ca-panel">
      {/* Header */}
      <div className="ca-panel-header">
        <div className="ca-panel-title">
          <span className="ca-panel-icon">⚡</span>
          <span>AI Code Assistant</span>
        </div>
        <div className="ca-panel-actions">
          <button
            className="ca-panel-clear"
            onClick={() => setMessages([WELCOME_MESSAGE])}
            title="Clear chat"
          >
            Clear
          </button>
          <button className="ca-panel-close" onClick={onClose} title="Close assistant">
            &times;
          </button>
        </div>
      </div>

      {/* Chat messages */}
      <div className="ca-panel-body">
        <CodeAssistantChat messages={messages} loading={loading} />
      </div>

      {/* Input bar */}
      <div className="ca-panel-footer">
        {error && <div className="ca-error-banner">{error}</div>}
        <CodeAssistantInput
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleSubmit}
          loading={loading}
        />
      </div>
    </div>
  );
}

export default CodeAssistantPanel;
