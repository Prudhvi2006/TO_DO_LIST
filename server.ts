import 'dotenv/config';
import express from 'express';
import http from 'http';
import path from 'path';
import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { createServer as createViteServer } from 'vite';

import { setSocketIO } from './src/server/socket.ts';
import { startBackgroundScheduler } from './src/server/scheduler.ts';
import { verifySmtpConnection } from './src/server/email.ts';
import { createApiApp } from './src/server/app.ts';
import { ensureDatabaseSchema } from './src/db/index.ts';

const PORT = Number(process.env.PORT || 3000);
const JWT_SECRET = process.env.JWT_SECRET?.trim();
if (!JWT_SECRET) throw new Error('JWT_SECRET is required. Set it in the environment before starting OrbitFlow.');

async function startServer() {
  await ensureDatabaseSchema();
  console.log('[DB] PostgreSQL schema is ready.');
  const app = createApiApp();
  const server = http.createServer(app);

  // Setup Socket.IO for real-time synchronization
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL || true,
      methods: ['GET', 'POST'],
    },
  });
  setSocketIO(io);

  // Authenticate socket connections
  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace('Bearer ', '');

    if (!token) return next(new Error('Authentication required'));
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
      if (!decoded?.id) return next(new Error('Invalid session'));
      socket.data.userId = decoded.id;
      return next();
    } catch {
      return next(new Error('Invalid or expired session'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data?.userId;
    if (userId) {
      socket.join(`user:${userId}`);
      console.log(`[SOCKET] User ${userId} joined room user:${userId}`);
    }

    socket.on('join_user_room', (uid: number) => {
      if (uid && uid === socket.data.userId) {
        socket.join(`user:${uid}`);
      }
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });

  // Start the scheduler only on a long-running server (Render/Railway/Cloud Run/VPS).
  // Set ENABLE_SCHEDULER=false if this process is used only for API serving.
  if (process.env.ENABLE_SCHEDULER !== 'false') startBackgroundScheduler();

  // Verify and log SMTP email connection status for production readiness
  verifySmtpConnection().catch((err) => {
    console.warn('[SERVER] Non-blocking SMTP verification alert:', err.message || err);
  });

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[SERVER] Real-Time Productivity Engine running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[FATAL SERVER ERROR]', err);
});
