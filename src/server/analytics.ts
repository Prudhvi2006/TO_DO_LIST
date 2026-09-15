import { Response } from 'express';
import { db } from '../db/index.ts';
import { todos } from '../db/schema.ts';
import { eq, and, desc, asc } from 'drizzle-orm';
import { AuthRequest } from './auth.ts';
import { getTodayInTimezone } from './scheduler.ts';

export function calculateMotivation(completedCount: number, totalCount: number, percentage: number): string {
  if (totalCount === 0 || completedCount === 0) {
    return "Let's get started. One small task is enough.";
  }
  if (percentage === 100) {
    return 'Perfect! You completed everything planned today! 🎉';
  }
  if (percentage >= 80) {
    return "You're almost there! 🔥";
  }
  if (completedCount === 1) {
    return 'Great start! Keep the momentum going.';
  }
  return 'Steady momentum! Keep focusing on what matters.';
}

export async function calculateStreaks(userId: number, userTz: string) {
  // Fetch all completed tasks
  const completedList = await db
    .select({
      dueDate: todos.dueDate,
      completedAt: todos.completedAt,
    })
    .from(todos)
    .where(and(eq(todos.userId, userId), eq(todos.completed, true)));

  if (completedList.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  // Get distinct dates with completions
  const completionDates = new Set<string>();
  for (const item of completedList) {
    if (item.dueDate) {
      completionDates.add(item.dueDate);
    }
  }

  const sortedDates = Array.from(completionDates).sort().reverse();
  if (sortedDates.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  const todayStr = getTodayInTimezone(userTz);

  // Helper to compute date minus N days in YYYY-MM-DD
  function getPreviousDate(dateStr: string, daysAgo: number): string {
    const d = new Date(dateStr + 'T12:00:00Z');
    d.setUTCDate(d.getUTCDate() - daysAgo);
    return d.toISOString().split('T')[0];
  }

  const yesterdayStr = getPreviousDate(todayStr, 1);

  // Calculate current streak
  let currentStreak = 0;
  let checkDate = '';

  if (completionDates.has(todayStr)) {
    checkDate = todayStr;
  } else if (completionDates.has(yesterdayStr)) {
    checkDate = yesterdayStr;
  }

  if (checkDate) {
    let dayCursor = checkDate;
    while (completionDates.has(dayCursor)) {
      currentStreak++;
      dayCursor = getPreviousDate(dayCursor, 1);
    }
  }

  // Calculate best streak historically
  const chronological = Array.from(completionDates).sort();
  let bestStreak = 0;
  let running = 0;
  let prevDate: string | null = null;

  for (const date of chronological) {
    if (!prevDate) {
      running = 1;
    } else {
      const expectedNext = getPreviousDate(date, 1);
      if (prevDate === expectedNext) {
        running++;
      } else {
        running = 1;
      }
    }
    prevDate = date;
    if (running > bestStreak) {
      bestStreak = running;
    }
  }

  return { currentStreak, bestStreak };
}

export async function handleGetTodayDashboard(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const userTz = req.user.timezone || 'Asia/Kolkata';
    const todayStr = getTodayInTimezone(userTz);

    const todaysTasks = await db
      .select()
      .from(todos)
      .where(and(eq(todos.userId, req.user.id), eq(todos.dueDate, todayStr)))
      .orderBy(asc(todos.completed), asc(todos.dueTime));

    const totalCount = todaysTasks.length;
    const completedCount = todaysTasks.filter((t) => t.completed).length;
    const remainingCount = totalCount - completedCount;
    const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    const motivationMessage = calculateMotivation(completedCount, totalCount, percentage);

    const { currentStreak, bestStreak } = await calculateStreaks(req.user.id, userTz);

    // Upcoming reminders across today and next 24 hours
    const upcomingReminders = await db
      .select()
      .from(todos)
      .where(
        and(
          eq(todos.userId, req.user.id),
          eq(todos.completed, false),
          eq(todos.reminderSent, false)
        )
      )
      .orderBy(asc(todos.reminderScheduledTime), asc(todos.dueDate), asc(todos.dueTime))
      .limit(5);

    return res.json({
      todayDate: todayStr,
      totalCount,
      completedCount,
      remainingCount,
      percentage,
      motivationMessage,
      currentStreak,
      bestStreak,
      tasks: todaysTasks,
      upcomingReminders,
    });
  } catch (err: any) {
    console.error('Error fetching today dashboard:', err);
    return res.status(500).json({ error: 'Failed to retrieve today dashboard data.' });
  }
}

export async function handleGetProductivityGraph(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const userTz = req.user.timezone || 'Asia/Kolkata';
    const todayStr = getTodayInTimezone(userTz);

    // Generate array of the last 7 dates ending today
    const days: Array<{
      date: string;
      dayOfWeek: string;
      shortDay: string;
      displayDate: string;
      isToday: boolean;
      completedTasks: number;
      totalTasks: number;
      completionPercentage: number;
    }> = [];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const fullDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(todayStr + 'T12:00:00Z');
      d.setUTCDate(d.getUTCDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayIndex = d.getUTCDay();

      days.push({
        date: dateStr,
        dayOfWeek: fullDayNames[dayIndex],
        shortDay: dayNames[dayIndex],
        displayDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }),
        isToday: dateStr === todayStr,
        completedTasks: 0,
        totalTasks: 0,
        completionPercentage: 0,
      });
    }

    // Query actual todos within this 7-day range
    const minDate = days[0].date;
    const maxDate = days[days.length - 1].date;

    const rangeTodos = await db
      .select()
      .from(todos)
      .where(and(eq(todos.userId, req.user.id)));

    // Aggregate by date
    let totalCompletedWeek = 0;
    let totalTasksWeek = 0;

    for (const day of days) {
      const dayTodos = rangeTodos.filter((t) => t.dueDate === day.date);
      const completed = dayTodos.filter((t) => t.completed).length;
      const total = dayTodos.length;

      day.completedTasks = completed;
      day.totalTasks = total;
      day.completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      totalCompletedWeek += completed;
      totalTasksWeek += total;
    }

    const weeklyCompletionRate =
      totalTasksWeek > 0 ? Math.round((totalCompletedWeek / totalTasksWeek) * 100) : 0;

    const { currentStreak, bestStreak } = await calculateStreaks(req.user.id, userTz);

    // Count today's stats
    const todayDay = days.find((d) => d.isToday);

    return res.json({
      days,
      weeklyCompletionRate,
      totalCompletedWeek,
      totalTasksWeek,
      currentStreak,
      bestStreak,
      todayCompletionRate: todayDay ? todayDay.completionPercentage : 0,
      todayCompletedTasks: todayDay ? todayDay.completedTasks : 0,
      todayTotalTasks: todayDay ? todayDay.totalTasks : 0,
      hasEnoughData: totalTasksWeek > 0 || totalCompletedWeek > 0,
    });
  } catch (err: any) {
    console.error('Error in productivity graph:', err);
    return res.status(500).json({ error: 'Failed to generate productivity graph.' });
  }
}

export async function handleGetAnalytics(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const userTz = req.user.timezone || 'Asia/Kolkata';
    const allTodos = await db.select().from(todos).where(eq(todos.userId, req.user.id));

    const totalPlanned = allTodos.length;
    const totalCompleted = allTodos.filter((t) => t.completed).length;
    const overallCompletionRate =
      totalPlanned > 0 ? Math.round((totalCompleted / totalPlanned) * 100) : 0;

    const { currentStreak, bestStreak } = await calculateStreaks(req.user.id, userTz);

    // Productivity by day of week
    const dayCounts: { [day: string]: number } = {
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
      Sunday: 0,
    };

    for (const t of allTodos) {
      if (t.completed && t.dueDate) {
        const d = new Date(t.dueDate + 'T12:00:00Z');
        const dayName = d.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
        if (dayCounts[dayName] !== undefined) {
          dayCounts[dayName]++;
        }
      }
    }

    let mostProductiveDay = 'None yet';
    let maxCompletions = 0;
    for (const [day, count] of Object.entries(dayCounts)) {
      if (count > maxCompletions) {
        maxCompletions = count;
        mostProductiveDay = day;
      }
    }

    // Category breakdown
    const categoryStats: { [cat: string]: { total: number; completed: number } } = {};
    for (const t of allTodos) {
      const cat = t.category || 'General';
      if (!categoryStats[cat]) {
        categoryStats[cat] = { total: 0, completed: 0 };
      }
      categoryStats[cat].total++;
      if (t.completed) {
        categoryStats[cat].completed++;
      }
    }

    return res.json({
      totalPlanned,
      totalCompleted,
      overallCompletionRate,
      currentStreak,
      bestStreak,
      mostProductiveDay: maxCompletions > 0 ? mostProductiveDay : 'Start completing tasks to discover',
      mostProductiveDayCount: maxCompletions,
      categoryStats,
      dayCounts,
    });
  } catch (err: any) {
    console.error('Error fetching analytics:', err);
    return res.status(500).json({ error: 'Failed to calculate analytics.' });
  }
}
