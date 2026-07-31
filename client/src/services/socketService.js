import { io } from 'socket.io-client';
import Cookies from 'js-cookie';
import * as Y from 'yjs';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
let socket;

const getSocket = () => {
  if (!socket) socket = io(SOCKET_URL, { auth: { token: Cookies.get('token') }, autoConnect: false });
  socket.auth = { token: Cookies.get('token') };
  if (!socket.connected) socket.connect();
  return socket;
};

export const joinCollaboration = (projectId, onState) => {
  const client = getSocket();
  const doc = new Y.Doc();
  const text = doc.getText('code');
  let remote = false;
  const emitUpdate = (update) => { if (!remote) client.emit('yjs-update', { projectId, update: Array.from(update) }); };
  doc.on('update', emitUpdate);
  const onSync = ({ update }) => { remote = true; Y.applyUpdate(doc, Uint8Array.from(update)); remote = false; };
  const onUpdate = ({ update }) => { remote = true; Y.applyUpdate(doc, Uint8Array.from(update)); remote = false; };
  client.on('yjs-sync', onSync);
  client.on('yjs-update', onUpdate);
  client.emit('join-project', { projectId }, onState);
  return { doc, text, socket: client, leave: () => { doc.off('update', emitUpdate); client.off('yjs-sync', onSync); client.off('yjs-update', onUpdate); client.emit('leave-project'); doc.destroy(); } };
};

export const socketEvents = { getSocket };
