function InvitationDialog({ invitations, onRespond }) {
  if (!invitations.length) return null;
  return <div className="invitation-panel"><strong>Pending Invitations</strong>{invitations.map((item) => <div className="invitation-row" key={item._id}><span>{item.projectId?.title || 'Team Project'}</span><button onClick={() => onRespond(item._id, 'accepted')}>Accept</button><button onClick={() => onRespond(item._id, 'rejected')}>Reject</button></div>)}</div>;
}
export default InvitationDialog;
