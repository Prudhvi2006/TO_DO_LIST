import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { db } from '../db/index.ts';
import { eq, sql } from 'drizzle-orm';
import { users, notificationLogs } from '../db/schema.ts';
import { getSocketIO } from './socket.ts';
import {
  handleSendOtp,
  handleVerifyOtp,
  handleRegister,
  handleLogin,
  handleForgotPassword,
  handleResetPassword,
  handleFirebaseLogin,
  handleGetMe,
  handleConfirmWelcomeEmail,
  handleResendWelcomeEmail,
  handleLogout,
  requireAuth,
} from './auth.ts';
import {
  handleGetTodos,
  handleCreateTodo,
  handleUpdateTodo,
  handleToggleTodo,
  handleDeleteTodo,
} from './todos.ts';
import {
  handleGetTodayDashboard,
  handleGetProductivityGraph,
  handleGetAnalytics,
} from './analytics.ts';
import {
  handleGetSettings,
  handleUpdateSettings,
  handleTestSmtp,
  handleTriggerMorningEmail,
  handleGetNotifications,
} from './settings.ts';

export function createApiApp(): Express {
  const app = express();

  // Common Express middlewares
  app.set('trust proxy', 1);
  app.use(cors({ origin: true, credentials: true, methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Health check
  app.get('/api/health', async (_req, res) => {
    try {
      await db.execute(sql`SELECT 1`);
      res.json({ status: 'ok', database: 'connected', time: new Date().toISOString() });
    } catch (error: any) {
      console.error('[HEALTH] Database check failed:', error?.message || error);
      res.status(503).json({ status: 'error', database: 'disconnected', error: 'Database connection failed.' });
    }
  });

  // Authentication routes
  app.post('/api/auth/send-otp', handleSendOtp);
  app.post('/api/auth/verify-otp', handleVerifyOtp);
  app.post('/api/auth/register', handleRegister);
  app.post('/api/auth/login', handleLogin);
  app.post('/api/auth/forgot-password', handleForgotPassword);
  app.post('/api/auth/reset-password', handleResetPassword);
  app.post('/api/auth/firebase-login', handleFirebaseLogin);
  app.get('/api/auth/me', requireAuth, handleGetMe);
  app.post('/api/auth/confirm-welcome-email', requireAuth, handleConfirmWelcomeEmail);
  app.post('/api/auth/resend-welcome-email', requireAuth, handleResendWelcomeEmail);
  app.post('/api/auth/logout', handleLogout);

  // Welcome email open tracking pixel and link confirmation
  app.get('/api/email-tracking/welcome-pixel/:userId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId, 10);
      if (!isNaN(userId)) {
        const [userRecord] = await db.select().from(users).where(eq(users.id, userId));
        if (userRecord && !userRecord.welcomeEmailSeen) {
          await db
            .update(users)
            .set({
              welcomeEmailSeen: true,
              welcomeEmailSeenAt: new Date(),
            })
            .where(eq(users.id, userId));

          await db.insert(notificationLogs).values({
            userId,
            type: 'welcome_email_seen',
            recipientEmail: userRecord.email,
            title: 'Welcome cover letter viewed via tracking pixel',
            body: 'User loaded the welcome email image asset',
            status: 'sent',
          });

          const io = getSocketIO();
          if (io) {
            io.to(`user:${userId}`).emit('welcome_email_seen_confirmed', {
              seen: true,
              seenAt: new Date().toISOString(),
            });
          }
          console.log(`[EMAIL TRACKING] Welcome email pixel viewed by user ${userId} (${userRecord.email})`);
        }
      }
    } catch (e) {
      console.error('[EMAIL TRACKING] Error processing pixel:', e);
    }

    // Return 1x1 transparent GIF
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.writeHead(200, {
      'Content-Type': 'image/gif',
      'Content-Length': pixel.length,
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    });
    res.end(pixel);
  });

  app.get('/api/email-tracking/welcome-confirm/:userId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId, 10);
      if (!isNaN(userId)) {
        const [userRecord] = await db.select().from(users).where(eq(users.id, userId));
        if (userRecord) {
          await db
            .update(users)
            .set({
              welcomeEmailSeen: true,
              welcomeEmailSeenAt: new Date(),
            })
            .where(eq(users.id, userId));

          await db.insert(notificationLogs).values({
            userId,
            type: 'welcome_email_seen',
            recipientEmail: userRecord.email,
            title: 'Welcome letter confirmed via button click',
            body: 'User clicked verify welcome email button in message',
            status: 'sent',
          });

          const io = getSocketIO();
          if (io) {
            io.to(`user:${userId}`).emit('welcome_email_seen_confirmed', {
              seen: true,
              seenAt: new Date().toISOString(),
            });
          }
        }
      }
    } catch (e) {
      console.error('[EMAIL TRACKING] Error confirming welcome email:', e);
    }
    res.redirect('/?welcome=confirmed');
  });

  // Todos routes
  app.get('/api/todos', requireAuth, handleGetTodos);
  app.post('/api/todos', requireAuth, handleCreateTodo);
  app.put('/api/todos/:id', requireAuth, handleUpdateTodo);
  app.patch('/api/todos/:id/toggle', requireAuth, handleToggleTodo);
  app.delete('/api/todos/:id', requireAuth, handleDeleteTodo);

  // Dashboard & Analytics routes
  app.get('/api/dashboard/today', requireAuth, handleGetTodayDashboard);
  app.get('/api/dashboard/productivity-graph', requireAuth, handleGetProductivityGraph);
  app.get('/api/analytics', requireAuth, handleGetAnalytics);

  // Settings & Notifications routes
  app.get('/api/settings', requireAuth, handleGetSettings);
  app.put('/api/settings', requireAuth, handleUpdateSettings);
  app.post('/api/settings/test-smtp', requireAuth, handleTestSmtp);
  app.post('/api/settings/trigger-morning-email', requireAuth, handleTriggerMorningEmail);
  app.get('/api/notifications', requireAuth, handleGetNotifications);

  // Never leak stack traces or secrets to clients. Individual handlers still
  // return domain-specific errors; this catches unexpected failures.
  app.use((err: any, _req: any, res: any, _next: any) => {
    console.error('[API] Unhandled error:', err);
    if (res.headersSent) return;
    return res.status(500).json({ error: 'Internal server error.' });
  });

  return app;
}
