import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ToastContext } from '../context/ToastContext.jsx';
import ChatMessage from '../components/ChatMessage.jsx';
import ChatInput from '../components/ChatInput.jsx';
import CodeEditor from '../components/CodeEditor.jsx';
import LivePreview from '../components/LivePreview.jsx';
import DeployButton from '../components/DeployButton.jsx';
import CodeAssistantPanel from '../components/CodeAssistant/CodeAssistantPanel.jsx';
import SnapshotTimeline from '../components/Snapshots/SnapshotTimeline.jsx';
import SaveSnapshotModal from '../components/Snapshots/SaveSnapshotModal.jsx';
import { getProject, updateProject, updateProjectCode } from '../services/projectService.js';
import { chatWithAgent } from '../services/agentService.js';
import { snapshotService } from '../services/snapshotService.js';
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

  const [project, setProject] = useState(null);
  const [messages, setMessages] = useState([]);
  const [code, setCode] = useState('');
  const [activeTab, setActiveTab] = useState('preview');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'unsaved'
  const [showHistory, setShowHistory] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isSavingSnapshot, setIsSavingSnapshot] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [autoSaveEnabled] = useState(true);
  const [snapshotRefreshKey, setSnapshotRefreshKey] = useState(0);
  const [assistantOpen, setAssistantOpen] = useState(false);

  const initialLoadRef = useRef(true);
  const isAiUpdateRef = useRef(false);
  const snapshotInitialLoadRef = useRef(true);

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

  useEffect(() => {
    if (snapshotInitialLoadRef.current) {
      snapshotInitialLoadRef.current = false;
      return;
    }

    if (!autoSaveEnabled || loading || !projectId || !code.trim()) {
      return;
    }

    const latestPrompt = [...messages].reverse().find((message) => message.role === 'user')?.content || '';
    const timer = setTimeout(() => {
      snapshotService.createSnapshot(projectId, code, latestPrompt, 'Auto-snapshot')
        .then(() => setSnapshotRefreshKey((value) => value + 1))
        .catch((err) => console.error('Auto-save failed:', err));
    }, 5000);

    return () => clearTimeout(timer);
  }, [code, projectId, messages, autoSaveEnabled, loading]);

  const handleSend = async (prompt) => {
    if (loading) return;

    const userMessage = { role: 'user', content: prompt, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const result = await chatWithAgent(projectId, prompt);

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

  const handleSaveSnapshot = async (message) => {
    if (!code.trim()) {
      showToast('There is no code to snapshot yet.', 'error');
      return;
    }

    const latestPrompt = [...messages].reverse().find((item) => item.role === 'user')?.content || '';
    setIsSavingSnapshot(true);

    try {
      await snapshotService.createSnapshot(projectId, code, latestPrompt, message || 'Manual snapshot');
      setSnapshotRefreshKey((value) => value + 1);
      showToast('Snapshot saved.', 'success');
    } catch (err) {
      const messageText = err.response?.data?.message || 'Failed to save snapshot.';
      showToast(messageText, 'error');
      throw err;
    } finally {
      setIsSavingSnapshot(false);
    }
  };

  const handleRestore = (restoredProject) => {
    setIsRestoring(true);
    try {
      setProject(restoredProject);
      setMessages(restoredProject.messages || []);
      isAiUpdateRef.current = true;
      setCode(restoredProject.generatedCode || '');
      setActiveTab('preview');
      setSaveStatus('saved');
      setSnapshotRefreshKey((value) => value + 1);
    } finally {
      setTimeout(() => setIsRestoring(false), 300);
    }
  };

  const handleDeleteSnapshot = () => {
    setSnapshotRefreshKey((value) => value + 1);
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
            <button className="builder-action-btn" onClick={() => setShowSaveModal(true)}>
              &#128190; Save Snapshot
            </button>
            <button className="builder-action-btn" onClick={() => setShowHistory(!showHistory)}>
              &#9201; History
            </button>
            <button
              className={`builder-action-btn ca-toggle-btn ${assistantOpen ? 'ca-toggle-btn-active' : ''}`}
              onClick={() => setAssistantOpen((prev) => !prev)}
              title="Toggle AI Code Assistant"
            >
              &#9889; AI Assistant
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
      <div className="snapshot-sidebar" style={{ right: showHistory ? '0' : '-360px' }}>
        <SnapshotTimeline
          projectId={projectId}
          refreshKey={snapshotRefreshKey}
          onRestore={handleRestore}
          onDelete={handleDeleteSnapshot}
          onClose={() => setShowHistory(false)}
          isOpen={showHistory}
        />
      </div>
      <SaveSnapshotModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveSnapshot}
        isLoading={isSavingSnapshot}
      />
      {isRestoring && <div className="restore-overlay">Restoring...</div>}

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
