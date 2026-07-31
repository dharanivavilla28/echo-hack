import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContext } from '../context/ToastContext.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import TeamModal from '../components/ProjectTeam/TeamModal.jsx';
import InvitationDialog from '../components/Invitations/InvitationDialog.jsx';
import { getProjects, deleteProject } from '../services/projectService.js';
import { createTeamProject } from '../services/teamService.js';
import { getInvitations, respondToInvitation } from '../services/invitationService.js';
import '../styles/dashboard.css';
import '../styles/collaboration.css';

function DashboardPage() {
  const navigate = useNavigate();
  const { showToast } = useContext(ToastContext);

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [invitations, setInvitations] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProjects();
        setProjects(data);
        if (data.length === 0) {
          navigate('/onboarding', { replace: true });
        }
      } catch (err) {
        showToast('Failed to load projects.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [navigate]);

  useEffect(() => { getInvitations().then(setInvitations).catch(() => {}); }, []);

  const handleInvitation = async (teamId, status) => {
    try { await respondToInvitation(teamId, status); setInvitations((items) => items.filter((item) => item._id !== teamId)); if (status === 'accepted') setProjects(await getProjects()); showToast(`Invitation ${status}.`, 'success'); } catch (_) { showToast('Unable to update invitation.', 'error'); }
  };

  const handleNewProject = () => {
    setShowCreateModal(false);
    navigate('/onboarding');
  };

  const handleNewTeamProject = async ({ title, members }) => {
    try {
      setCreating(true);
      const result = await createTeamProject({ title, members });
      setShowCreateModal(false);
      navigate(`/builder/${result.project._id}`);
    } catch (err) { showToast(err.response?.data?.message || 'Failed to create team project.', 'error'); } finally { setCreating(false); }
  };

  const handleOpen = (id) => {
    navigate(`/builder/${id}`);
  };

  const handleDelete = async (id) => {
    try {
      await deleteProject(id);
      setProjects(projects.filter((p) => p._id !== id));
      showToast('Project deleted.', 'success');
    } catch (err) {
      showToast('Failed to delete project.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="loading-state" style={{ flex: 1 }}>
        <div className="spinner" />
        <p>Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Your Projects</h1>
          <p className="dashboard-subtitle">
            {projects.length} project{projects.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button className="dashboard-new-btn" onClick={() => setShowCreateModal(true)}>
          + New Project
        </button>
      </div>
      <InvitationDialog invitations={invitations} onRespond={handleInvitation} />

      {projects.length === 0 ? (
        <div className="dashboard-empty">
          <p className="dashboard-empty-icon">&#9830;</p>
          <h2 className="dashboard-empty-title">No projects yet</h2>
          <p className="dashboard-empty-subtitle">Create your first project and start building with AI.</p>
          <button className="dashboard-new-btn" onClick={() => setShowCreateModal(true)}>
            + Create First Project
          </button>
        </div>
      ) : (
        <div className="dashboard-grid">
          {projects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onOpen={handleOpen}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
      <TeamModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onCreatePersonal={handleNewProject} onCreateTeam={handleNewTeamProject} loading={creating} />
    </div>
  );
}

export default DashboardPage;
