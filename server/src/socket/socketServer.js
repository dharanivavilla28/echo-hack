import { Server } from 'socket.io';
import * as Y from 'yjs';
import User from '../models/User.model.js';
import { verifyToken } from '../utils/jwt.utils.js';
import { getProjectRole, addChatMessage } from '../services/team.service.js';
import { SOCKET_EVENTS } from './events.js';
import { projectRoom, leaveProjectRooms } from './projectRoom.js';
import { addPresence, removePresence, getPresence, setTyping } from './presence.js';

const documents = new Map();
const canEdit = (role) => role === 'owner' || role === 'editor';
const projectDoc = (projectId) => {
  if (!documents.has(projectId)) documents.set(projectId, new Y.Doc());
  return documents.get(projectId);
};

export const initialiseSocketServer = (httpServer) => {
  const io = new Server(httpServer, { cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true } });
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) throw new Error('Authentication required.');
      const user = await User.findById(verifyToken(token).id);
      if (!user) throw new Error('User not found.');
      socket.user = user;
      next();
    } catch (error) { next(new Error('Unauthorized socket connection.')); }
  });

  io.on('connection', (socket) => {
    const requireAccess = async (projectId, editor = false) => {
      const access = await getProjectRole(projectId, socket.user);
      if (!access || (editor && !canEdit(access.role))) throw new Error('Forbidden project action.');
      return access;
    };

    socket.on(SOCKET_EVENTS.JOIN_PROJECT, async ({ projectId }, callback = () => {}) => {
      try {
        const access = await requireAccess(projectId);
        leaveProjectRooms(socket);
        socket.join(projectRoom(projectId));
        socket.data.projectId = projectId;
        socket.data.role = access.role;
        const presence = addPresence(projectId, socket.id, socket.user);
        socket.emit(SOCKET_EVENTS.YJS_SYNC, { update: Array.from(Y.encodeStateAsUpdate(projectDoc(projectId))) });
        io.to(projectRoom(projectId)).emit(SOCKET_EVENTS.PRESENCE, presence);
        callback({ ok: true, role: access.role, presence, chatMessages: access.team?.chatMessages || [] });
      } catch (error) { callback({ ok: false, message: error.message }); }
    });

    socket.on(SOCKET_EVENTS.LEAVE_PROJECT, () => {
      const projectId = socket.data.projectId;
      if (projectId) io.to(projectRoom(projectId)).emit(SOCKET_EVENTS.PRESENCE, removePresence(projectId, socket.id));
      leaveProjectRooms(socket);
      socket.data.projectId = null;
    });

    socket.on(SOCKET_EVENTS.YJS_UPDATE, async ({ projectId, update }) => {
      try {
        await requireAccess(projectId, true);
        const binaryUpdate = Uint8Array.from(update);
        Y.applyUpdate(projectDoc(projectId), binaryUpdate);
        socket.to(projectRoom(projectId)).emit(SOCKET_EVENTS.YJS_UPDATE, { update: Array.from(binaryUpdate), userId: socket.user._id.toString() });
      } catch (_) { socket.emit('project-error', { message: 'You cannot edit this project.' }); }
    });

    [SOCKET_EVENTS.CURSOR, SOCKET_EVENTS.SELECTION, SOCKET_EVENTS.FILE_CHANGE].forEach((event) => {
      socket.on(event, async (payload) => {
        try { await requireAccess(payload.projectId, event === SOCKET_EVENTS.FILE_CHANGE); socket.to(projectRoom(payload.projectId)).emit(event, { ...payload, user: { name: socket.user.name, id: socket.id } }); } catch (_) { socket.emit('project-error', { message: 'Permission denied.' }); }
      });
    });

    socket.on(SOCKET_EVENTS.TYPING, async ({ projectId, typing }) => {
      try {
        await requireAccess(projectId);
        const member = setTyping(projectId, socket.id, Boolean(typing));
        if (member) socket.to(projectRoom(projectId)).emit(SOCKET_EVENTS.TYPING, member);
      } catch (_) {}
    });

    socket.on(SOCKET_EVENTS.CHAT_MESSAGE, async ({ projectId, text }, callback = () => {}) => {
      try {
        await requireAccess(projectId);
        if (!text?.trim()) throw new Error('Message cannot be empty.');
        const message = await addChatMessage(projectId, socket.user, text);
        io.to(projectRoom(projectId)).emit(SOCKET_EVENTS.CHAT_MESSAGE, message);
        callback({ ok: true });
      } catch (error) { callback({ ok: false, message: error.message }); }
    });

    socket.on('disconnect', () => {
      const projectId = socket.data.projectId;
      if (projectId) io.to(projectRoom(projectId)).emit(SOCKET_EVENTS.PRESENCE, removePresence(projectId, socket.id));
    });
  });
  return io;
};
