import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ToastContext } from '../context/ToastContext.jsx';
import ChatMessage from '../components/ChatMessage.jsx';
import ChatInput from '../components/ChatInput.jsx';
import CodeEditor from '../components/CodeEditor.jsx';
import LivePreview from '../components/LivePreview.jsx';
import DeployButton from '../components/DeployButton.jsx';
import CodeAssistantPanel from '../components/CodeAssistant/CodeAssistantPanel.jsx';
import { getProject, updateProject, updateProjectCode } from '../services/projectService.js';
import { generateCode } from '../services/generationService.js';
import '../styles/builder.css';

const EXAMPLE_PROMPTS = [
  'A personal portfolio website with a dark theme',
  'A simple calculator app',
  'A weather dashboard with cards',
  'A landing page for a coffee shop',
  'A to-do list app',
  'A countdown timer for New Year',
];

function BuilderPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useContext(ToastContext);
  const [assistantOpen, setAssistantOpen] = useState(false);

  const [project, setProject] = useState(null);
  const [messages, setMessages] = useState([]);
  const [code, setCode] = useState('');
  const [activeTab, setActiveTab] = useState('preview');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'unsaved'

  const initialLoadRef = useRef(true);
  const isAiUpdateRef = useRef(false);

  useEffect(() => {
    const loadProject = async () => {
      try {
        const data = await getProject(projectId);
        setProject(data);
        setMessages(data.messages || []);
        setCode(data.generatedCode || '');
        setEditTitle(data.title || 'Untitled Project');
      } catch (err) {
        showToast('Project not found.', 'error');
        navigate('/dashboard');
      } finally {
        setPageLoading(false);
      }
    };
    loadProject();
  }, [projectId]);

  // Debounced auto-save for code edits
  useEffect(() => {
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      return;
    }

    if (isAiUpdateRef.current) {
      isAiUpdateRef.current = false;
      setSaveStatus('saved');
      return;
    }

    setSaveStatus('unsaved');

    const timer = setTimeout(async () => {
      try {
        setSaveStatus('saving');
        await updateProjectCode(projectId, code);
        setSaveStatus('saved');
      } catch (error) {
        console.error('Failed to auto-save code:', error);
        setSaveStatus('unsaved');
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [code, projectId]);

  const handleSend = async (prompt) => {
    if (loading) return;

    const userMessage = { role: 'user', content: prompt, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const result = await generateCode(projectId, prompt);

      setMessages((prev) => [...prev, result.message]);

      if (result.generatedCode) {
        isAiUpdateRef.current = true;
        setCode(result.generatedCode);
        setActiveTab('preview');
      }

      if (project && project.title === 'Untitled Project') {
        const newTitle = prompt.length > 50 ? prompt.substring(0, 50) + '...' : prompt;
        setProject((prev) => ({ ...prev, title: newTitle }));
        setEditTitle(newTitle);
      }
    } catch (err) {
      console.error('Generation Error:', err);
      const message = err.response && err.response.data && err.response.data.message
        ? err.response.data.message
        : err.message || 'Generation failed. Please try again.';
      showToast(message, 'error');
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleTitleSave = async () => {
    setIsEditingTitle(false);
    if (editTitle.trim() && editTitle !== project.title) {
      try {
        await updateProject(projectId, { title: editTitle.trim() });
        setProject((prev) => ({ ...prev, title: editTitle.trim() }));
      } catch (error) {
        showToast('Failed to rename project.', 'error');
      }
    }
  };

  const handleDownload = () => {
    if (!code) return;
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project && project.title ? project.title : 'my-app'}.html`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Code downloaded!', 'success');
  };

  if (pageLoading) {
    return (
      <div className="loading-state" style={{ flex: 1 }}>
        <div className="spinner" />
        <p>Loading project...</p>
      </div>
    );
  }

  return (
    <div className="builder">
      <div className="builder-chat">
        <div className="builder-chat-header">
          {isEditingTitle ? (
            <input
              className="builder-title-input"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={(e) => { if (e.key === 'Enter') handleTitleSave(); }}
              autoFocus
            />
          ) : (
            <h2
              className="builder-chat-title"
              onClick={() => setIsEditingTitle(true)}
              title="Click to rename"
            >
              {project && project.title ? project.title : 'Untitled Project'}
            </h2>
          )}
        </div>

        <div className="builder-messages">
          {messages.length === 0 ? (
            <div className="builder-empty-chat">
              <p className="builder-empty-icon">&#128736;</p>
              <p className="builder-empty-title">What would you like to build?</p>
              <p className="builder-empty-subtitle">Describe your idea and ECHO DEV will generate the code.</p>
              <div className="builder-examples">
                {EXAMPLE_PROMPTS.map((prompt, index) => (
                  <button
                    key={index}
                    className="builder-example-chip"
                    onClick={() => handleSend(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="builder-messages-list">
              {messages.map((msg, index) => (
                <ChatMessage key={index} message={msg} />
              ))}
              {loading && (
                <div className="builder-developing">
                  <div className="builder-developing-icon">
                    <span className="builder-developing-spinner" />
                  </div>
                  <div className="builder-developing-info">
                    <span className="builder-developing-label">ECHO DEV is building your app</span>
                    <div className="builder-developing-bar">
                      <div className="builder-developing-bar-fill" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <ChatInput onSend={handleSend} loading={loading} disabled={false} />
      </div>

      <div className="builder-preview">
        <div className="builder-tabs">
          <div className="builder-tabs-left">
            <button
              className={`builder-tab ${activeTab === 'preview' ? 'active' : ''}`}
              onClick={() => setActiveTab('preview')}
            >
              Preview
            </button>
            <button
              className={`builder-tab ${activeTab === 'code' ? 'active' : ''}`}
              onClick={() => setActiveTab('code')}
            >
              Code
            </button>
          </div>
          <div className="builder-tabs-right">
            {code && (
              <>
                <button className="builder-action-btn" onClick={handleDownload}>Download</button>
                <DeployButton projectId={projectId} projectTitle={project?.title} code={code} />
              </>
            )}
            <button
              className={`builder-action-btn ca-toggle-btn ${assistantOpen ? 'ca-toggle-btn-active' : ''}`}
              onClick={() => setAssistantOpen((prev) => !prev)}
              title="Toggle AI Code Assistant"
            >
              ⚡ AI Assistant
            </button>
          </div>
        </div>

        <div className="builder-content">
          {activeTab === 'preview' ? (
            <LivePreview code={code} />
          ) : (
            <CodeEditor code={code} onChange={setCode} readOnly={false} saveStatus={saveStatus} />
          )}
        </div>
      </div>

      <CodeAssistantPanel
        code={code}
        projectTitle={project?.title}
        isOpen={assistantOpen}
        onClose={() => setAssistantOpen(false)}
      />
    </div>
  );
}

export default BuilderPage;