function PresenceBar({ members = [], role }) {
  return <div className="presence-bar"><span className="permission-badge">{role || 'personal'}</span>{members.map((member) => <span className="presence-user" key={member.id} title={member.email}><i style={{ background: member.color }} />{member.name}</span>)}</div>;
}
export default PresenceBar;
