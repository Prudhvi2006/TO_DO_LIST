import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from './api.ts';

let socketInstance: Socket | null = null;

export function getClientSocket(token?: string): Socket {
  const authToken = token || localStorage.getItem('auth_token') || '';
  if (!socketInstance) {
    socketInstance = io(API_BASE_URL || window.location.origin, {
      auth: { token: authToken },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 10000,
    });
  } else {
    socketInstance.auth = { token: authToken };
    if (!socketInstance.connected) socketInstance.connect();
  }
  return socketInstance;
}

export function disconnectClientSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}
