import { Response } from 'express';
import { db } from '../db/index.ts';
import { userSettings, users, notificationLogs, todos } from '../db/schema.ts';
import { eq, and, desc } from 'drizzle-orm';
import { AuthRequest } from './auth.ts';
import {
  sendEmailDirect,
  sendMorningDigestEmail,
  isAstronautUiEmail,
  DEFAULT_FROM_EMAIL,
  DEFAULT_SMTP_USER,
  DEFAULT_SMTP_PASSWORD,
} from './email.ts';
import { getTodayInTimezone } from './scheduler.ts';
import { emitToUser } from './socket.ts';

export async function handleGetSettings(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    let [settings] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, req.user.id));

    if (!settings) {
      const [newSettings] = await db
        .insert(userSettings)
        .values({
          userId: req.user.id,
          timezone: req.user.timezone || 'Asia/Kolkata',
          emailNotificationsEnabled: true,
          taskCompletionEmail: true,
          scheduledRemindersEmail: true,
          morningDigestEmail: true,
          morningDigestTime: '08:00',
          missedTaskEmail: true,
        })
        .returning();
      settings = newSettings;
    }

    const isSmtpConfigured = !!(DEFAULT_SMTP_PASSWORD && DEFAULT_SMTP_PASSWORD.trim());

    return res.json({
      settings: {
        ...settings,
        // Mask passwords for safety
        customSmtpPassword: settings.customSmtpPassword ? '••••••••' : null,
      },
      smtpStatus: {
        isConfigured: isSmtpConfigured,
        activeSource: 'Server Delivery Engine',
        senderEmail: DEFAULT_FROM_EMAIL || DEFAULT_SMTP_USER,
      },
    });
  } catch (err: any) {
    console.error('Error fetching settings:', err);
    return res.status(500).json({ error: 'Failed to retrieve settings.' });
  }
}

export async function handleUpdateSettings(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const {
      timezone,
      emailNotificationsEnabled,
      taskCompletionEmail,
      scheduledRemindersEmail,
      morningDigestEmail,
      morningDigestTime,
      missedTaskEmail,
      customSmtpHost,
      customSmtpPort,
      customSmtpUser,
      customSmtpPassword,
      customFromEmail,
    } = req.body;

    const updatePayload: any = {
      updatedAt: new Date(),
    };

    if (timezone !== undefined) {
      updatePayload.timezone = timezone;
      // Also update users table
      await db.update(users).set({ timezone }).where(eq(users.id, req.user.id));
    }
    if (emailNotificationsEnabled !== undefined) updatePayload.emailNotificationsEnabled = Boolean(emailNotificationsEnabled);
    if (taskCompletionEmail !== undefined) updatePayload.taskCompletionEmail = Boolean(taskCompletionEmail);
    if (scheduledRemindersEmail !== undefined) updatePayload.scheduledRemindersEmail = Boolean(scheduledRemindersEmail);
    if (morningDigestEmail !== undefined) updatePayload.morningDigestEmail = Boolean(morningDigestEmail);
    if (morningDigestTime !== undefined) updatePayload.morningDigestTime = morningDigestTime;
    if (missedTaskEmail !== undefined) updatePayload.missedTaskEmail = Boolean(missedTaskEmail);
    if (customSmtpHost !== undefined) updatePayload.customSmtpHost = customSmtpHost || null;
    if (customSmtpPort !== undefined) updatePayload.customSmtpPort = customSmtpPort ? Number(customSmtpPort) : null;
    if (customSmtpUser !== undefined) updatePayload.customSmtpUser = customSmtpUser || null;
    if (customFromEmail !== undefined) updatePayload.customFromEmail = customFromEmail || null;

    // Only update password if a new value is actually passed (not placeholder bullets)
    if (customSmtpPassword !== undefined && customSmtpPassword !== '••••••••') {
      updatePayload.customSmtpPassword = customSmtpPassword || null;
    }

    const [updated] = await db
      .update(userSettings)
      .set(updatePayload)
      .where(eq(userSettings.userId, req.user.id))
      .returning();

    return res.json({
      success: true,
      settings: {
        ...updated,
        customSmtpPassword: updated.customSmtpPassword ? '••••••••' : null,
      },
    });
  } catch (err: any) {
    console.error('Error updating settings:', err);
    return res.status(500).json({ error: 'Failed to save settings.' });
  }
}

export async function handleTestSmtp(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const [settings] = await db.select().from(userSettings).where(eq(userSettings.userId, req.user.id));
    const [user] = await db.select().from(users).where(eq(users.id, req.user.id));

    if (!user) return res.status(404).json({ error: 'User not found' });

    const customConfig = settings
      ? {
          host: settings.customSmtpHost,
          port: settings.customSmtpPort,
          user: settings.customSmtpUser,
          password: settings.customSmtpPassword,
          fromEmail: settings.customFromEmail,
        }
      : undefined;

    const testSubject = '🚀 Astronaut Mission Control: SMTP Connection Verified!';
    const testHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 32px 24px; background-color: #090d16; border: 1px solid #2e1065; border-radius: 20px; color: #cbd5e1;">
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="display: inline-block; padding: 6px 14px; border-radius: 9999px; background-color: rgba(168, 85, 247, 0.2); border: 1px solid rgba(192, 132, 252, 0.4); color: #e9d5ff; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px;">
            🚀 MISSION CONTROL • FLIGHT SYSTEMS ONLINE
          </div>
          <div style="margin: 8px auto 16px auto;">
            <img src="https://uiverse.io/astronaut.png" width="110" height="110" alt="Astronaut" style="display: block; margin: 0 auto; border: 0; filter: drop-shadow(0 10px 20px rgba(168, 85, 247, 0.6));" />
          </div>
          <h2 style="color: #ffffff; margin: 0 0 8px 0; font-size: 24px; font-weight: 800;">SMTP Transmission Successful! 🌌</h2>
          <p style="color: #94a3b8; font-size: 14px; margin: 0;">Spacecraft communication relay is fully operational.</p>
        </div>
        <div style="background-color: #111827; border: 1px solid #1f2937; border-radius: 14px; padding: 20px; margin-bottom: 20px;">
          <p style="color: #e2e8f0; font-size: 14px; line-height: 1.6; margin: 0 0 10px 0;">
            Congratulations <strong>${user.name}</strong>! Your SMTP email delivery system is functioning at peak velocity.
          </p>
          <p style="color: #94a3b8; font-size: 13px; line-height: 1.6; margin: 0;">
            You will now receive all mission task notifications, time-completed alerts, scheduled reminders, and velocity digests directly in your inbox.
          </p>
        </div>
        <div style="text-align: center; font-size: 11px; color: #64748b;">
          Sent to <strong>${user.email}</strong> by Real-Time Productivity Engine • Orbit 2026
        </div>
      </div>
    `;

    const result = await sendEmailDirect({
      userId: user.id,
      type: 'system_test',
      recipientEmail: user.email,
      subject: testSubject,
      html: testHtml,
      customConfig,
    });

    if (result.log) {
      emitToUser(user.id, 'notification:sent', result.log);
    }

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
        log: result.log,
      });
    }

    return res.json({
      success: true,
      message: `Test email successfully dispatched to ${user.email}`,
      log: result.log,
    });
  } catch (err: any) {
    console.error('Error during SMTP test:', err);
    return res.status(500).json({ error: 'Failed to test SMTP email delivery.' });
  }
}

export async function handleTriggerMorningEmail(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const [user] = await db.select().from(users).where(eq(users.id, req.user.id));
    const [settings] = await db.select().from(userSettings).where(eq(userSettings.userId, req.user.id));

    if (!user) return res.status(404).json({ error: 'User not found' });

    const userTz = user.timezone || 'Asia/Kolkata';
    const todayStr = getTodayInTimezone(userTz);

    const todaysTasks = await db
      .select()
      .from(todos)
      .where(and(eq(todos.userId, user.id), eq(todos.dueDate, todayStr)));

    const result = await sendMorningDigestEmail(user, todaysTasks, settings);

    if (result && result.log) {
      emitToUser(user.id, 'notification:sent', result.log);
    }

    return res.json({
      success: result ? result.success : false,
      message: result?.success
        ? `Morning plan dispatched with ${todaysTasks.length} task(s)`
        : result?.error || 'Email sending disabled or unconfigured',
      log: result?.log || null,
    });
  } catch (err: any) {
    console.error('Error triggering morning email:', err);
    return res.status(500).json({ error: 'Failed to trigger morning email.' });
  }
}

export async function handleGetNotifications(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const logs = await db
      .select()
      .from(notificationLogs)
      .where(eq(notificationLogs.userId, req.user.id))
      .orderBy(desc(notificationLogs.createdAt))
      .limit(50);

    return res.json(logs);
  } catch (err: any) {
    console.error('Error fetching notification logs:', err);
    return res.status(500).json({ error: 'Failed to retrieve notification history.' });
  }
}
