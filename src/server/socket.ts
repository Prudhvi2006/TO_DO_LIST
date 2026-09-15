import { Server as SocketIOServer } from 'socket.io';

let io: SocketIOServer | null = null;

export function setSocketIO(instance: SocketIOServer) {
  io = instance;
}

export function getSocketIO(): SocketIOServer | null {
  return io;
}

export function emitToUser(userId: number, event: string, payload: any) {
  if (io) {
    io.to(`user:${userId}`).emit(event, payload);
  }
}

export function broadcastEvent(event: string, payload: any) {
  if (io) {
    io.emit(event, payload);
  }
}
