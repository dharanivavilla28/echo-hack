export const projectRoom = (projectId) => `project:${projectId}`;

export const leaveProjectRooms = (socket) => {
  [...socket.rooms].filter((room) => room.startsWith('project:')).forEach((room) => socket.leave(room));
};
