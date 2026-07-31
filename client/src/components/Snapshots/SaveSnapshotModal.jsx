import { useState } from 'react';
import './SaveSnapshotModal.css';

function SaveSnapshotModal({ isOpen, onClose, onSave, isLoading = false }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const saving = loading || isLoading;

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await onSave(message);
      setMessage('');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="snapshot-modal-backdrop">
      <form className="snapshot-modal" onSubmit={handleSubmit}>
        <div className="snapshot-modal-header">
          <h3>Save Snapshot</h3>
          <button type="button" className="snapshot-modal-close" onClick={onClose} disabled={saving}>
            &times;
          </button>
        </div>
        <label className="snapshot-modal-label" htmlFor="snapshot-message">
          Message
        </label>
        <input
          id="snapshot-message"
          className="snapshot-modal-input"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="What changed?"
          autoFocus
        />
        <div className="snapshot-modal-actions">
          <button type="button" className="builder-action-btn" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="builder-tab active" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SaveSnapshotModal;
