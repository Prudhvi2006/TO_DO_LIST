import { Response } from 'express';
import { db } from '../db/index.ts';
import { todos, users, userSettings } from '../db/schema.ts';
import { eq, and, desc, asc } from 'drizzle-orm';
import { AuthRequest } from './auth.ts';
import { computeReminderTimestamp, getTodayInTimezone } from './scheduler.ts';
import { sendTaskCompletionEmail } from './email.ts';
import { emitToUser } from './socket.ts';

export async function handleGetTodos(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const filter = (req.query.filter as string) || 'all';
    const userTz = req.user.timezone || 'Asia/Kolkata';
    const todayStr = getTodayInTimezone(userTz);

    let query = db
      .select()
      .from(todos)
      .where(eq(todos.userId, req.user.id))
      .orderBy(asc(todos.completed), asc(todos.dueDate), asc(todos.dueTime), desc(todos.createdAt));

    const allTodos = await query;

    let filtered = allTodos;
    if (filter === 'today') {
      filtered = allTodos.filter((t) => t.dueDate === todayStr);
    } else if (filter === 'upcoming') {
      filtered = allTodos.filter((t) => t.dueDate >= todayStr && !t.completed);
    } else if (filter === 'completed') {
      filtered = allTodos.filter((t) => t.completed);
    }

    return res.json(filtered);
  } catch (err: any) {
    console.error('Error fetching todos:', err);
    return res.status(500).json({ error: 'Failed to retrieve tasks.' });
  }
}

export async function handleCreateTodo(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const {
      title,
      description = '',
      dueDate,
      dueTime = null,
      reminderMinutesBefore = null,
      priority = 'medium',
      category = 'General',
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Task title is required.' });
    }

    const userTz = req.user.timezone || 'Asia/Kolkata';
    const targetDueDate = dueDate || getTodayInTimezone(userTz);

    const reminderTimestamp = computeReminderTimestamp(
      targetDueDate,
      dueTime,
      reminderMinutesBefore ? Number(reminderMinutesBefore) : null,
      userTz
    );

    const [newTodo] = await db
      .insert(todos)
      .values({
        userId: req.user.id,
        title: title.trim(),
        description: description.trim(),
        dueDate: targetDueDate,
        dueTime: dueTime || null,
        reminderMinutesBefore: reminderMinutesBefore ? Number(reminderMinutesBefore) : null,
        reminderScheduledTime: reminderTimestamp,
        reminderSent: false,
        completed: false,
        priority,
        category,
      })
      .returning();

    // Broadcast real-time event to this user's active sockets
    emitToUser(req.user.id, 'todo:created', newTodo);
    emitToUser(req.user.id, 'progress:updated', { trigger: 'create' });

    return res.status(201).json(newTodo);
  } catch (err: any) {
    console.error('Error creating todo:', err);
    return res.status(500).json({ error: 'Failed to save task to database.' });
  }
}

export async function handleUpdateTodo(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    const id = Number(req.params.id);

    const [existing] = await db
      .select()
      .from(todos)
      .where(and(eq(todos.id, id), eq(todos.userId, req.user.id)));

    if (!existing) {
      return res.status(404).json({ error: 'Task not found or access denied.' });
    }

    const {
      title,
      description,
      dueDate,
      dueTime,
      reminderMinutesBefore,
      priority,
      category,
    } = req.body;

    const userTz = req.user.timezone || 'Asia/Kolkata';
    const updatedDueDate = dueDate !== undefined ? dueDate : existing.dueDate;
    const updatedDueTime = dueTime !== undefined ? dueTime : existing.dueTime;
    const updatedReminderMinutes =
      reminderMinutesBefore !== undefined
        ? (reminderMinutesBefore ? Number(reminderMinutesBefore) : null)
        : existing.reminderMinutesBefore;

    const reminderTimestamp = computeReminderTimestamp(
      updatedDueDate,
      updatedDueTime,
      updatedReminderMinutes,
      userTz
    );

    const [updated] = await db
      .update(todos)
      .set({
        title: title !== undefined ? title.trim() : existing.title,
        description: description !== undefined ? description.trim() : existing.description,
        dueDate: updatedDueDate,
        dueTime: updatedDueTime,
        reminderMinutesBefore: updatedReminderMinutes,
        reminderScheduledTime: reminderTimestamp,
        reminderSent:
          updatedDueDate !== existing.dueDate || updatedDueTime !== existing.dueTime
            ? false
            : existing.reminderSent,
        missedTaskEmailSent:
          updatedDueDate !== existing.dueDate ? false : existing.missedTaskEmailSent,
        priority: priority !== undefined ? priority : existing.priority,
        category: category !== undefined ? category : existing.category,
        updatedAt: new Date(),
      })
      .where(and(eq(todos.id, id), eq(todos.userId, req.user.id)))
      .returning();

    emitToUser(req.user.id, 'todo:updated', updated);
    emitToUser(req.user.id, 'progress:updated', { trigger: 'update' });

    return res.json(updated);
  } catch (err: any) {
    console.error('Error updating todo:', err);
    return res.status(500).json({ error: 'Failed to update task.' });
  }
}

export async function handleToggleTodo(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    const id = Number(req.params.id);

    const [existing] = await db
      .select()
      .from(todos)
      .where(and(eq(todos.id, id), eq(todos.userId, req.user.id)));

    if (!existing) {
      return res.status(404).json({ error: 'Task not found or access denied.' });
    }

    const nextCompleted = !existing.completed;
    const completedAt = nextCompleted ? new Date() : null;

    const [updated] = await db
      .update(todos)
      .set({
        completed: nextCompleted,
        completedAt,
        completionEmailSent: nextCompleted ? true : false,
        updatedAt: new Date(),
      })
      .where(and(eq(todos.id, id), eq(todos.userId, req.user.id)))
      .returning();

    // If marked completed, trigger real-time completion email!
    if (nextCompleted) {
      const [userRecord] = await db.select().from(users).where(eq(users.id, req.user.id));
      const [settings] = await db.select().from(userSettings).where(eq(userSettings.userId, req.user.id));

      if (userRecord) {
        // Send email in background / handle response
        sendTaskCompletionEmail(userRecord, updated, settings).then(async (result) => {
          if (result) {
            await db
              .update(todos)
              .set({ completionEmailSent: true })
              .where(eq(todos.id, id));
            if (result.log) {
              emitToUser(req.user!.id, 'notification:sent', result.log);
            }
          }
        }).catch((err) => {
          console.error('[TASK COMPLETION EMAIL ERROR]', err);
        });
      }
    }

    emitToUser(req.user.id, nextCompleted ? 'todo:completed' : 'todo:updated', updated);
    emitToUser(req.user.id, 'progress:updated', { trigger: 'toggle', completed: nextCompleted });
    emitToUser(req.user.id, 'streak:updated', { trigger: 'toggle' });

    return res.json({ ...updated, emailDispatched: nextCompleted });
  } catch (err: any) {
    console.error('Error toggling todo:', err);
    return res.status(500).json({ error: 'Failed to update task completion state.' });
  }
}

export async function handleDeleteTodo(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    const id = Number(req.params.id);

    const [existing] = await db
      .select()
      .from(todos)
      .where(and(eq(todos.id, id), eq(todos.userId, req.user.id)));

    if (!existing) {
      return res.status(404).json({ error: 'Task not found or access denied.' });
    }

    await db.delete(todos).where(and(eq(todos.id, id), eq(todos.userId, req.user.id)));

    emitToUser(req.user.id, 'todo:deleted', { id });
    emitToUser(req.user.id, 'progress:updated', { trigger: 'delete' });

    return res.json({ success: true, id });
  } catch (err: any) {
    console.error('Error deleting todo:', err);
    return res.status(500).json({ error: 'Failed to delete task.' });
  }
}
