import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContext } from '../context/ToastContext.jsx';
import { onboardingService } from '../services/onboardingService.js';
import '../styles/onboarding.css';

const fallbackTypes = [
  { id: 'portfolio', name: 'Personal Portfolio', icon: '🎨', description: 'A personal portfolio to showcase work and skills' },
  { id: 'ecommerce', name: 'E-commerce Store', icon: '🛒', description: 'An online store with product listings, cart, and checkout' },
  { id: 'blog', name: 'Blog Platform', icon: '✍️', description: 'A personal or professional blog with posts and comments' },
  { id: 'dashboard', name: 'Admin Dashboard', icon: '📊', description: 'A dashboard with charts, tables, and analytics' },
  { id: 'landing', name: 'Landing Page', icon: '🚀', description: 'A conversion-focused landing page for a product or service' },
  { id: 'todo', name: 'To-Do App', icon: '📋', description: 'A simple task management application' },
  { id: 'custom', name: 'Custom Idea', icon: '✨', description: 'Build something unique' },
];

function OnboardingPage() {
  const navigate = useNavigate();
  const { showToast } = useContext(ToastContext);

  const [types, setTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('portfolio');
  const [customPrompt, setCustomPrompt] = useState('');
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [creating, setCreating] = useState(false);
  const [loadError, setLoadError] = useState('');

  const loadTypes = async () => {
    setLoadingTypes(true);
    setLoadError('');

    try {
      const data = await onboardingService.getTypes();
      setTypes(data);
      setSelectedType(data[0]?.id || 'portfolio');
    } catch (error) {
      setTypes(fallbackTypes);
      setLoadError('Could not load project types from the server. You can still start with the default templates.');
    } finally {
      setLoadingTypes(false);
    }
  };

  useEffect(() => {
    loadTypes();
  }, []);

  const handleStart = async () => {
    if (creating) return;

    if (selectedType === 'custom' && !customPrompt.trim()) {
      showToast('Describe your custom idea before starting.', 'error');
      return;
    }

    setCreating(true);

    try {
      const project = await onboardingService.configureProject(selectedType, customPrompt);
      localStorage.setItem('hasCompletedOnboarding', 'true');
      showToast('Project created. Ready to build.', 'success');
      navigate(`/builder/${project._id}`);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create project. Please try again.';
      showToast(message, 'error');
    } finally {
      setCreating(false);
    }
  };

  return (
    <main className="onboarding">
      <section className="onboarding-hero">
        <p className="onboarding-eyebrow">ECHO DEV</p>
        <h1>What do you want to build?</h1>
        <p className="onboarding-subtitle">
          Pick a project area and ECHO DEV will create a ready-to-edit starting point.
        </p>
      </section>

      {loadingTypes ? (
        <div className="loading-state onboarding-loading">
          <div className="spinner" />
          <p>Loading project types...</p>
        </div>
      ) : (
        <>
          {loadError && (
            <div className="onboarding-alert">
              <span>{loadError}</span>
              <button type="button" onClick={loadTypes}>Retry</button>
            </div>
          )}

          <section className="onboarding-grid" aria-label="Project types">
            {types.map((type) => (
              <button
                key={type.id}
                type="button"
                className={`onboarding-card ${selectedType === type.id ? 'selected' : ''}`}
                onClick={() => setSelectedType(type.id)}
              >
                <span className="onboarding-card-icon" aria-hidden="true">{type.icon}</span>
                <span className="onboarding-card-copy">
                  <strong>{type.name}</strong>
                  <small>{type.description}</small>
                </span>
              </button>
            ))}
          </section>

          <section className="onboarding-custom">
            <label htmlFor="customPrompt">Custom description</label>
            <textarea
              id="customPrompt"
              value={customPrompt}
              onChange={(event) => setCustomPrompt(event.target.value)}
              placeholder="Optional for templates. Required for Custom Idea."
              rows={4}
            />
          </section>

          <div className="onboarding-actions">
            <button
              type="button"
              className="onboarding-start"
              onClick={handleStart}
              disabled={creating}
            >
              {creating ? 'Creating project...' : 'Start Building'}
            </button>
          </div>
        </>
      )}
    </main>
  );
}

export default OnboardingPage;
