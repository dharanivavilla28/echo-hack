import { useState } from 'react';

const isEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

function TeamModal({ isOpen, onClose, onCreatePersonal, onCreateTeam, loading }) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('personal');
  const [members, setMembers] = useState([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');
  const [error, setError] = useState('');
  if (!isOpen) return null;
  const addMember = () => {
    const value = email.trim().toLowerCase();
    if (!isEmail(value)) return setError('Enter a valid email address.');
    if (members.some((member) => member.email === value)) return setError('That member has already been added.');
    setMembers([...members, { email: value, role }]); setEmail(''); setError('');
  };
  const submit = () => type === 'personal' ? onCreatePersonal(title) : onCreateTeam({ title, members });
  return <div className="team-modal-backdrop" role="dialog" aria-modal="true"><div className="team-modal">
    <button className="team-close" onClick={onClose}>&times;</button><h2>Create Project</h2>
    <label>Project Name<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Untitled Project" /></label>
    <p className="team-label">Project Type</p>
    <label><input type="radio" checked={type === 'personal'} onChange={() => setType('personal')} /> Personal Project</label>
    <label><input type="radio" checked={type === 'team'} onChange={() => setType('team')} /> Team Project</label>
    {type === 'team' && <section className="team-setup"><h3>Team Members</h3><div className="team-add-row"><input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Invite by email" /><select value={role} onChange={(e) => setRole(e.target.value)}><option value="editor">Editor</option><option value="viewer">Viewer</option></select><button type="button" onClick={addMember}>+ Add Member</button></div>{error && <p className="team-error">{error}</p>}
      {members.map((member) => <div className="team-member" key={member.email}><span>{member.email}</span><strong>{member.role}</strong><button onClick={() => setMembers(members.filter((item) => item.email !== member.email))}>Remove</button></div>)}</section>}
    <button className="dashboard-new-btn" disabled={loading} onClick={submit}>{loading ? 'Creating...' : type === 'team' ? 'Create Project' : 'Continue'}</button>
  </div></div>;
}
export default TeamModal;
