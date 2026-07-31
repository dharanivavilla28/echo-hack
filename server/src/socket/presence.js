const colors = ['#6366f1', '#ec4899', '#14b8a6', '#f97316', '#8b5cf6', '#0ea5e9'];
const clients = new Map();

export const addPresence = (projectId, socketId, user) => {
  const projectClients = clients.get(projectId) || new Map();
  const color = colors[[...projectClients.keys()].length % colors.length];
  projectClients.set(socketId, { id: socketId, name: user.name, email: user.email, color, typing: false });
  clients.set(projectId, projectClients);
  return [...projectClients.values()];
};

export const removePresence = (projectId, socketId) => {
  const projectClients = clients.get(projectId);
  if (!projectClients) return [];
  projectClients.delete(socketId);
  if (!projectClients.size) clients.delete(projectId);
  return [...projectClients.values()];
};

export const getPresence = (projectId) => [...(clients.get(projectId)?.values() || [])];

export const setTyping = (projectId, socketId, typing) => {
  const member = clients.get(projectId)?.get(socketId);
  if (member) member.typing = typing;
  return member;
};
