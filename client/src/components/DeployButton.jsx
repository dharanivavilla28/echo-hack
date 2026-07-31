import { useState } from 'react';
import DeployModal from './DeployModal.jsx';

function DeployButton({ projectId, projectTitle, code }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button
        className="builder-action-btn deploy-trigger-btn"
        onClick={() => setModalOpen(true)}
        title="Deploy to Vercel & GitHub"
      >
        <span className="deploy-btn-icon">🚀</span> Deploy
      </button>

      <DeployModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        projectId={projectId}
        projectTitle={projectTitle}
        code={code}
      />
    </>
  );
}

export default DeployButton;
