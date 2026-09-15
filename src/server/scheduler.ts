import { db } from '../db/index.ts';
import { todos, users, userSettings, notificationLogs } from '../db/schema.ts';
import { eq, and, lte, isNotNull, ne, sql, gte } from 'drizzle-orm';
import {
  sendScheduledReminderEmail,
  sendMissedTaskEmail,
  sendMorningDigestEmail,
} from './email.ts';
import { emitToUser } from './socket.ts';

export function getTodayInTimezone(tz: string): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(new Date()); // Returns YYYY-MM-DD
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

export function getCurrentTimeInTimezone(tz: string): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return formatter.format(new Date()); // Returns HH:mm
  } catch {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
}

export function computeReminderTimestamp(
  dueDate: string,
  dueTime: string | null | undefined,
  minutesBefore: number | null | undefined,
  userTz: string
): Date | null {
  if (!minutesBefore || minutesBefore <= 0) return null;
  const timeStr = dueTime || '18:00';

  try {
    const [year, month, day] = dueDate.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);

    const baseUtc = new Date(Date.UTC(year, month - 1, day, hours, minutes));
    const tzString = baseUtc.toLocaleString('en-US', { timeZone: userTz });
    const offsetDiff = baseUtc.getTime() - new Date(tzString).getTime();
    const actualDueTimeUtc = baseUtc.getTime() + offsetDiff;

    return new Date(actualDueTimeUtc - minutesBefore * 60 * 1000);
  } catch {
    const fallback = new Date(`${dueDate}T${timeStr}:00Z`);
    return new Date(fallback.getTime() - (minutesBefore || 30) * 60 * 1000);
  }
}

// Main background cycle
export async function runSchedulerCycle() {
  const now = new Date();

  try {
    // 1. Check Scheduled Task Reminders
    const pendingReminders = await db
      .select({
        todo: todos,
        user: users,
      })
      .from(todos)
      .innerJoin(users, eq(todos.userId, users.id))
      .where(
        and(
          eq(todos.completed, false),
          eq(todos.reminderSent, false),
          isNotNull(todos.reminderMinutesBefore),
          isNotNull(todos.reminderScheduledTime),
          lte(todos.reminderScheduledTime, now)
        )
      );

    for (const item of pendingReminders) {
      const [settings] = await db
        .select()
        .from(userSettings)
        .where(eq(userSettings.userId, item.user.id));

      const result = await sendScheduledReminderEmail(item.user, item.todo, settings);

      // Mark reminder as processed
      await db
        .update(todos)
        .set({ reminderSent: true })
        .where(eq(todos.id, item.todo.id));

      emitToUser(item.user.id, 'todo:updated', { ...item.todo, reminderSent: true });
      if (result && result.log) {
        emitToUser(item.user.id, 'notification:sent', result.log);
      }
    }

    // 2. Check Missed and Overdue Tasks
    // If due date < today (in user's timezone) or (due date == today and current time >= due time)
    const activeTodos = await db
      .select({
        todo: todos,
        user: users,
      })
      .from(todos)
      .innerJoin(users, eq(todos.userId, users.id))
      .where(eq(todos.completed, false));

    for (const item of activeTodos) {
      const userTz = item.user.timezone || 'Asia/Kolkata';
      const todayStr = getTodayInTimezone(userTz);
      const currentTimeStr = getCurrentTimeInTimezone(userTz);

      let isTimeCompleted = false;
      if (item.todo.dueDate < todayStr) {
        isTimeCompleted = true;
      } else if (item.todo.dueDate === todayStr && item.todo.dueTime) {
        if (currentTimeStr >= item.todo.dueTime) {
          isTimeCompleted = true;
        }
      }

      if (isTimeCompleted) {
        // Emit real-time notification to the user's browser until marked completed
        emitToUser(item.user.id, 'task:time_completed_alert', { todo: item.todo });

        // If email hasn't been sent yet, send the missed/due task email notice
        if (!item.todo.missedTaskEmailSent) {
          const [settings] = await db
            .select()
            .from(userSettings)
            .where(eq(userSettings.userId, item.user.id));

          const result = await sendMissedTaskEmail(item.user, item.todo, settings);

          await db
            .update(todos)
            .set({ missedTaskEmailSent: true })
            .where(eq(todos.id, item.todo.id));

          emitToUser(item.user.id, 'todo:updated', { ...item.todo, missedTaskEmailSent: true });
          if (result && result.log) {
            emitToUser(item.user.id, 'notification:sent', result.log);
          }
        }
      }
    }

    // 3. Morning Digest
    const usersWithDigest = await db
      .select({
        user: users,
        settings: userSettings,
      })
      .from(users)
      .innerJoin(userSettings, eq(users.id, userSettings.userId))
      .where(
        and(
          eq(userSettings.emailNotificationsEnabled, true),
          eq(userSettings.morningDigestEmail, true)
        )
      );

    for (const record of usersWithDigest) {
      const userTz = record.user.timezone || 'Asia/Kolkata';
      const todayStr = getTodayInTimezone(userTz);
      const currentTimeStr = getCurrentTimeInTimezone(userTz);
      const digestTime = record.settings.morningDigestTime || '08:00';

      if (record.settings.lastMorningEmailDate !== todayStr && currentTimeStr >= digestTime) {
        // Fetch tasks scheduled for today
        const todaysTasks = await db
          .select()
          .from(todos)
          .where(and(eq(todos.userId, record.user.id), eq(todos.dueDate, todayStr)));

        const result = await sendMorningDigestEmail(record.user, todaysTasks, record.settings);

        await db
          .update(userSettings)
          .set({ lastMorningEmailDate: todayStr })
          .where(eq(userSettings.userId, record.user.id));

        if (result && result.log) {
          emitToUser(record.user.id, 'notification:sent', result.log);
        }
      }
    }
  } catch (err: any) {
    console.error('[SCHEDULER] Error during scheduler execution cycle:', err);
  }
}

let schedulerTimer: NodeJS.Timeout | null = null;

export function startBackgroundScheduler() {
  if (schedulerTimer) return;
  console.log('[SCHEDULER] Background email and notification worker started (cycle: 30s)');
  // Run immediately once
  runSchedulerCycle();
  schedulerTimer = setInterval(runSchedulerCycle, 30000);
}

export function stopBackgroundScheduler() {
  if (schedulerTimer) {
    clearInterval(schedulerTimer);
    schedulerTimer = null;
  }
}
