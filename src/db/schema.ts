import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  timezone: text('timezone').default('Asia/Kolkata').notNull(),
  welcomeEmailSent: boolean('welcome_email_sent').default(false).notNull(),
  welcomeEmailSeen: boolean('welcome_email_seen').default(false).notNull(),
  welcomeEmailSeenAt: timestamp('welcome_email_seen_at'),
  welcomeEmailLastNotifiedAt: timestamp('welcome_email_last_notified_at'),
  welcomeNotificationCount: integer('welcome_notification_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const userSettings = pgTable('user_settings', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  timezone: text('timezone').default('Asia/Kolkata').notNull(),
  emailNotificationsEnabled: boolean('email_notifications_enabled').default(true).notNull(),
  taskCompletionEmail: boolean('task_completion_email').default(true).notNull(),
  scheduledRemindersEmail: boolean('scheduled_reminders_email').default(true).notNull(),
  morningDigestEmail: boolean('morning_digest_email').default(true).notNull(),
  morningDigestTime: text('morning_digest_time').default('08:00').notNull(),
  missedTaskEmail: boolean('missed_task_email').default(true).notNull(),
  customSmtpHost: text('custom_smtp_host'),
  customSmtpPort: integer('custom_smtp_port'),
  customSmtpUser: text('custom_smtp_user'),
  customSmtpPassword: text('custom_smtp_password'),
  customFromEmail: text('custom_from_email'),
  lastMorningEmailDate: text('last_morning_email_date'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const otpRecords = pgTable('otp_records', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  codeHash: text('code_hash').notNull(),
  attempts: integer('attempts').default(0).notNull(),
  maxAttempts: integer('max_attempts').default(5).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  lastSentAt: timestamp('last_sent_at').defaultNow().notNull(),
  verified: boolean('verified').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const todos = pgTable('todos', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  description: text('description').default('').notNull(),
  dueDate: text('due_date').notNull(), // YYYY-MM-DD
  dueTime: text('due_time'), // HH:mm
  reminderMinutesBefore: integer('reminder_minutes_before'), // minutes e.g. 15, 30, 60
  reminderScheduledTime: timestamp('reminder_scheduled_time'),
  reminderSent: boolean('reminder_sent').default(false).notNull(),
  completed: boolean('completed').default(false).notNull(),
  completedAt: timestamp('completed_at'),
  completionEmailSent: boolean('completion_email_sent').default(false).notNull(),
  missedTaskEmailSent: boolean('missed_task_email_sent').default(false).notNull(),
  priority: text('priority').default('medium').notNull(),
  category: text('category').default('General').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const notificationLogs = pgTable('notification_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  todoId: integer('todo_id').references(() => todos.id, { onDelete: 'set null' }),
  type: text('type').notNull(), // 'otp', 'task_completion', 'task_reminder', 'morning_digest', 'missed_task', 'system'
  recipientEmail: text('recipient_email').notNull(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  status: text('status').notNull(), // 'sent', 'failed', 'pending'
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  settings: one(userSettings, {
    fields: [users.id],
    references: [userSettings.userId],
  }),
  todos: many(todos),
  notificationLogs: many(notificationLogs),
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}));

export const todosRelations = relations(todos, ({ one, many }) => ({
  user: one(users, {
    fields: [todos.userId],
    references: [users.id],
  }),
  notifications: many(notificationLogs),
}));

export const notificationLogsRelations = relations(notificationLogs, ({ one }) => ({
  user: one(users, {
    fields: [notificationLogs.userId],
    references: [users.id],
  }),
  todo: one(todos, {
    fields: [notificationLogs.todoId],
    references: [todos.id],
  }),
}));
