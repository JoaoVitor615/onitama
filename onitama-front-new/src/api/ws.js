import { io } from 'socket.io-client';
import { getUsuarioId } from './http';

let socket;

export function getSalasSocket() {
  if (socket) return socket;
  const base = import.meta.env.VITE_API_BASE?.replace(/\/$/, '') || 'http://localhost:3000';
  socket = io(`${base}/salas`, {
    // permitir fallback para polling quando upgrade WS não é possível
    transports: ['websocket', 'polling'],
    path: '/socket.io',
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    withCredentials: true,
    auth: { userId: getUsuarioId() },
  });
  return socket;
}

export function subscribeLista(cbPresence, cbRoomUpdate, cbRoomDeleted) {
  const s = getSalasSocket();
  s.emit('subscribe_lista');
  if (cbPresence) s.on('presence_update', cbPresence);
  if (cbRoomUpdate) s.on('room_update', cbRoomUpdate);
  if (cbRoomDeleted) s.on('room_deleted', cbRoomDeleted);
  return () => {
    if (cbPresence) s.off('presence_update', cbPresence);
    if (cbRoomUpdate) s.off('room_update', cbRoomUpdate);
    if (cbRoomDeleted) s.off('room_deleted', cbRoomDeleted);
  };
}

export function joinSala(codigo, cbPresence, cbRoomUpdate, cbRoomDeleted) {
  const s = getSalasSocket();
  s.emit('join_sala', { codigo, userId: getUsuarioId() });
  if (cbPresence) s.on('presence_update', (payload) => {
    if (payload?.codigo === codigo) cbPresence(payload);
  });
  if (cbRoomUpdate) s.on('room_update', (payload) => {
    if (payload?.codigo === codigo) cbRoomUpdate(payload);
  });
  if (cbRoomDeleted) s.on('room_deleted', (payload) => {
    if (payload?.codigo === codigo) cbRoomDeleted(payload);
  });
  return () => {
    if (cbPresence) s.off('presence_update');
    if (cbRoomUpdate) s.off('room_update');
    if (cbRoomDeleted) s.off('room_deleted');
  };
}