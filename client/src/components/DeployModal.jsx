import { useState, useEffect, useContext } from 'react';
import { ToastContext } from '../context/ToastContext.jsx';
import { deployProject, getDeployStatus } from '../services/deployService.js';

function DeployModal({ isOpen, onClose, projectId, projectTitle, code }) {
  const { showToast } = useContext(ToastContext);

  const defaultRepoName = (projectTitle || 'my-web-app')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  const [repoName, setRepoName] = useState(defaultRepoName);
  const [githubToken, setGithubToken] = useState('');
  const [vercelToken, setVercelToken] = useState('');
  const [deploying, setDeploying] = useState(false);
  const [step, setStep] = useState('idle'); // 'idle', 'creating-repo', 'pushing', 'vercel', 'completed'
  const [deployData, setDeployData] = useState(null);

  useEffect(() => {
    if (projectTitle) {
      setRepoName(defaultRepoName);
    }
  }, [projectTitle]);

  useEffect(() => {
    if (isOpen && projectId) {
      const fetchStatus = async () => {
        try {
          const statusData = await getDeployStatus(projectId);
          if (statusData && (statusData.githubRepo || statusData.deployUrl)) {
            setDeployData(statusData);
          }
        } catch (err) {
          // Ignore initial status fetch error
        }
      };
      fetchStatus();
    }
  }, [isOpen, projectId]);

  if (!isOpen) return null;

  const handleDeploy = async (e) => {
    e.preventDefault();
    if (deploying) return;
    if (!code) {
      showToast('No generated code available to deploy.', 'error');
      return;
    }

    setDeploying(true);
    setStep('creating-repo');

    try {
      setTimeout(() => setStep('pushing'), 1500);
      setTimeout(() => setStep('vercel'), 3000);

      const result = await deployProject(projectId, {
        repoName: repoName || defaultRepoName,
        githubToken: githubToken.trim() || undefined,
        vercelToken: vercelToken.trim() || undefined,
      });

      setDeployData(result);
      setStep('completed');
      showToast('Deployment finished successfully!', 'success');
    } catch (err) {
      setStep('idle');
      const message = err.response && err.response.data && err.response.data.message
        ? err.response.data.message
        : err.message || 'Deployment failed. Please check your tokens or try again.';
      showToast(message, 'error');
    } finally {
      setDeploying(false);
    }
  };

  return (
    <div className="deploy-modal-overlay" onClick={onClose}>
      <div className="deploy-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="deploy-modal-header">
          <div className="deploy-modal-title">
            <span className="deploy-modal-icon">🚀</span> One-Click Deploy to Vercel
          </div>
          <button className="deploy-modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="deploy-modal-body">
          <p className="deploy-modal-desc">
            Automatically create a GitHub repository and deploy your live web application to Vercel production.
          </p>

          {deployData && (deployData.deployUrl || deployData.githubRepo) && (
            <div className="deploy-result-box">
              <div className="deploy-result-title">✨ Current Deployment</div>
              {deployData.deployUrl && (
                <div className="deploy-result-item">
                  <span className="deploy-result-label">Live App:</span>
                  <a href={deployData.deployUrl} target="_blank" rel="noreferrer" className="deploy-result-link">
                    {deployData.deployUrl} ↗
                  </a>
                </div>
              )}
              {deployData.githubRepo && (
                <div className="deploy-result-item">
                  <span className="deploy-result-label">GitHub Repo:</span>
                  <a href={deployData.githubRepo} target="_blank" rel="noreferrer" className="deploy-result-link">
                    {deployData.githubRepo} ↗
                  </a>
                </div>
              )}
            </div>
          )}

          <form className="deploy-form" onSubmit={handleDeploy}>
            <div className="deploy-field">
              <label className="deploy-label">Repository Name</label>
              <input
                type="text"
                className="deploy-input"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                placeholder="e.g. my-awesome-app"
                disabled={deploying}
                required
              />
            </div>

            <div className="deploy-field">
              <label className="deploy-label">
                GitHub Personal Access Token <span className="deploy-optional">(Optional if set in .env)</span>
              </label>
              <input
                type="password"
                className="deploy-input"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxx"
                disabled={deploying}
              />
            </div>

            <div className="deploy-field">
              <label className="deploy-label">
                Vercel API Token <span className="deploy-optional">(Optional if set in .env)</span>
              </label>
              <input
                type="password"
                className="deploy-input"
                value={vercelToken}
                onChange={(e) => setVercelToken(e.target.value)}
                placeholder="vercel_token_xxxxxxxx"
                disabled={deploying}
              />
            </div>

            {deploying && (
              <div className="deploy-progress">
                <div className="deploy-progress-spinner" />
                <div className="deploy-progress-text">
                  {step === 'creating-repo' && '1/3 Creating GitHub Repository...'}
                  {step === 'pushing' && '2/3 Pushing web application code...'}
                  {step === 'vercel' && '3/3 Triggering Vercel deployment...'}
                </div>
              </div>
            )}

            <div className="deploy-actions">
              <button type="button" className="deploy-btn-cancel" onClick={onClose} disabled={deploying}>
                Cancel
              </button>
              <button type="submit" className="deploy-btn-submit" disabled={deploying}>
                {deploying ? 'Deploying...' : 'Create Repository & Deploy'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default DeployModal;
