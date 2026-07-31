import { useContext, useEffect, useMemo, useState } from 'react';
import { ToastContext } from '../../context/ToastContext.jsx';
import { deleteSnapshot, getSnapshots, restoreSnapshot } from '../../services/snapshotService.js';
import './SnapshotTimeline.css';

const truncateText = (value) => {
  if (!value) return 'No message';
  return value.length > 72 ? `${value.substring(0, 72)}...` : value;
};

const formatRelativeTime = (dateValue) => {
  const date = new Date(dateValue);
  const seconds = Math.max(1, Math.floor((Date.now() - date.getTime()) / 1000));
  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];

  for (const [label, value] of units) {
    const amount = Math.floor(seconds / value);
    if (amount >= 1) {
      return `${amount} ${label}${amount > 1 ? 's' : ''} ago`;
    }
  }

  return 'Just now';
};

function SnapshotTimeline({ projectId, refreshKey, onRestore, onDelete, onClose, isOpen = true }) {
  const { showToast } = useContext(ToastContext);
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [restoringId, setRestoringId] = useState(null);

  const sortedSnapshots = useMemo(() => {
    return [...snapshots].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [snapshots]);

  const latestSnapshotId = sortedSnapshots[0]?._id;

  const loadSnapshots = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getSnapshots(projectId);
      setSnapshots(data || []);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load snapshots.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    loadSnapshots();
  }, [projectId, refreshKey, isOpen]);

  const handleRestore = async (snapshotId) => {
    if (!window.confirm('Restore this snapshot? Your current editor state will be replaced.')) {
      return;
    }

    setRestoringId(snapshotId);
    try {
      const restoredProject = await restoreSnapshot(projectId, snapshotId);
      showToast('Snapshot restored.', 'success');
      if (onRestore) {
        onRestore(restoredProject);
      }
      await loadSnapshots();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to restore snapshot.';
      showToast(message, 'error');
    } finally {
      setRestoringId(null);
    }
  };

  const handleDelete = async (snapshotId) => {
    if (!window.confirm('Delete this snapshot? This cannot be undone.')) {
      return;
    }

    setDeletingId(snapshotId);
    try {
      await deleteSnapshot(projectId, snapshotId);
      showToast('Snapshot deleted.', 'success');
      if (onDelete) {
        onDelete();
      }
      await loadSnapshots();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete snapshot.';
      showToast(message, 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <aside className="snapshot-timeline">
      <div className="snapshot-timeline-header">
        <h3>Project History</h3>
        <div className="snapshot-header-actions">
          <button className="builder-action-btn" onClick={loadSnapshots} disabled={loading}>
            Refresh
          </button>
          <button
            className="builder-action-btn snapshot-close-btn"
            onClick={onClose}
            type="button"
            aria-label="Close project history"
          >
            &times;
          </button>
        </div>
      </div>

      {loading && (
        <div className="snapshot-state">
          <div className="spinner" />
          <p>Loading snapshots...</p>
        </div>
      )}

      {!loading && error && (
        <div className="snapshot-state snapshot-state-error">
          <p>{error}</p>
          <button className="builder-action-btn" onClick={loadSnapshots}>Try Again</button>
        </div>
      )}

      {!loading && !error && sortedSnapshots.length === 0 && (
        <div className="snapshot-state">
          <p>No snapshots yet.</p>
        </div>
      )}

      {!loading && !error && sortedSnapshots.length > 0 && (
        <div className="snapshot-list">
          {sortedSnapshots.map((snapshot) => (
            <div className="snapshot-item" key={snapshot._id}>
              <span className="snapshot-dot" />
              <div className="snapshot-card">
                <div className="snapshot-card-header">
                  <span className="snapshot-version">Version {snapshot.version || snapshots.indexOf(snapshot) + 1}</span>
                  {snapshot._id === latestSnapshotId && (
                    <span className="snapshot-current-badge">Current</span>
                  )}
                  {snapshot.restoredAt && (
                    <span className="snapshot-restored-badge">Restored</span>
                  )}
                </div>
                <p className="snapshot-time">
                  {formatRelativeTime(snapshot.createdAt)}
                </p>
                <p className="snapshot-message">{truncateText(snapshot.message || snapshot.prompt)}</p>
                {snapshot.prompt && snapshot.message !== snapshot.prompt && (
                  <p className="snapshot-prompt">{truncateText(snapshot.prompt)}</p>
                )}
                <div className="snapshot-actions">
                  <button
                    className="builder-action-btn snapshot-action-btn"
                    onClick={() => handleRestore(snapshot._id)}
                    disabled={restoringId === snapshot._id}
                  >
                    {restoringId === snapshot._id ? 'Restoring...' : 'Restore'}
                  </button>
                  <button
                    className="builder-action-btn snapshot-action-btn"
                    onClick={() => handleDelete(snapshot._id)}
                    disabled={deletingId === snapshot._id}
                  >
                    {deletingId === snapshot._id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}

export default SnapshotTimeline;
