export interface User {
  id: number;
  email: string;
  name: string;
  timezone: string;
  welcomeEmailSent?: boolean;
  welcomeEmailSeen?: boolean;
  welcomeEmailSeenAt?: string | null;
  welcomeNotificationCount?: number;
  createdAt?: string;
}

export interface UserSettings {
  id: number;
  userId: number;
  timezone: string;
  emailNotificationsEnabled: boolean;
  taskCompletionEmail: boolean;
  scheduledRemindersEmail: boolean;
  morningDigestEmail: boolean;
  morningDigestTime: string;
  missedTaskEmail: boolean;
  customSmtpHost?: string | null;
  customSmtpPort?: number | null;
  customSmtpUser?: string | null;
  customSmtpPassword?: string | null;
  customFromEmail?: string | null;
  lastMorningEmailDate?: string | null;
  updatedAt?: string;
}

export interface Todo {
  id: number;
  userId: number;
  title: string;
  description: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string | null; // HH:mm
  reminderMinutesBefore?: number | null;
  reminderScheduledTime?: string | null;
  reminderSent: boolean;
  completed: boolean;
  completedAt?: string | null;
  completionEmailSent: boolean;
  missedTaskEmailSent: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface TodayDashboardData {
  todayDate: string;
  totalCount: number;
  completedCount: number;
  remainingCount: number;
  percentage: number;
  motivationMessage: string;
  currentStreak: number;
  bestStreak: number;
  tasks: Todo[];
  upcomingReminders: Todo[];
}

export interface ProductivityDayData {
  date: string;
  dayOfWeek: string;
  shortDay: string;
  displayDate: string;
  isToday: boolean;
  completedTasks: number;
  totalTasks: number;
  completionPercentage: number;
}

export interface ProductivityGraphData {
  days: ProductivityDayData[];
  weeklyCompletionRate: number;
  totalCompletedWeek: number;
  totalTasksWeek: number;
  currentStreak: number;
  bestStreak: number;
  todayCompletionRate: number;
  todayCompletedTasks: number;
  todayTotalTasks: number;
  hasEnoughData: boolean;
}

export interface AnalyticsData {
  totalPlanned: number;
  totalCompleted: number;
  overallCompletionRate: number;
  currentStreak: number;
  bestStreak: number;
  mostProductiveDay: string;
  mostProductiveDayCount: number;
  categoryStats: Record<string, { total: number; completed: number }>;
  dayCounts: Record<string, number>;
}

export interface NotificationLog {
  id: number;
  userId: number | null;
  todoId: number | null;
  type: string;
  recipientEmail: string;
  title: string;
  body: string;
  status: 'sent' | 'failed' | 'pending';
  errorMessage?: string | null;
  createdAt: string;
}

export interface Habit {
  id: string;
  userId?: number;
  title: string;
  category: string;
  icon?: string;
  color?: string;
  targetDaysPerWeek: number;
  completedDates: string[]; // YYYY-MM-DD format
  createdAt: string;
}
