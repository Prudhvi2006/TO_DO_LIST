import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';

declare global {
  // eslint-disable-next-line no-var
  var _postgresPool: Pool | undefined;
}

function getDatabaseConfig() {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (connectionString) {
    return {
      connectionString,
      max: Number(process.env.DATABASE_POOL_MAX || 10),
      connectionTimeoutMillis: Number(process.env.DATABASE_CONNECTION_TIMEOUT_MS || 15000),
      idleTimeoutMillis: Number(process.env.DATABASE_IDLE_TIMEOUT_MS || 30000),
      ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    };
  }

  const host = process.env.SQL_HOST?.trim();
  const user = process.env.SQL_USER?.trim() || process.env.SQL_ADMIN_USER?.trim();
  const password = process.env.SQL_PASSWORD ?? process.env.SQL_ADMIN_PASSWORD;
  const database = process.env.SQL_DB_NAME?.trim();

  if (!host || !user || !password || !database) {
    throw new Error(
      'Database is not configured. Set DATABASE_URL (recommended) or SQL_HOST, SQL_USER, SQL_PASSWORD and SQL_DB_NAME.'
    );
  }

  return {
    host,
    user,
    password,
    database,
    port: Number(process.env.SQL_PORT || 5432),
    max: Number(process.env.DATABASE_POOL_MAX || 10),
    connectionTimeoutMillis: Number(process.env.DATABASE_CONNECTION_TIMEOUT_MS || 15000),
    idleTimeoutMillis: Number(process.env.DATABASE_IDLE_TIMEOUT_MS || 30000),
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  };
}

export const createPool = () => {
  if (!global._postgresPool) {
    const config = getDatabaseConfig();
    global._postgresPool = new Pool(config);
    global._postgresPool.on('error', (err) => {
      console.error('[DB] Unexpected PostgreSQL pool error:', err);
    });
  }
  return global._postgresPool;
};

export const pool = createPool();
export const db = drizzle(pool, { schema });


/** Create the required tables when a fresh PostgreSQL database is used.
 * Safe to run repeatedly because every statement is idempotent. */
export async function ensureDatabaseSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      email_verified BOOLEAN NOT NULL DEFAULT FALSE,
      timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
      welcome_email_sent BOOLEAN NOT NULL DEFAULT FALSE,
      welcome_email_seen BOOLEAN NOT NULL DEFAULT FALSE,
      welcome_email_seen_at TIMESTAMP,
      welcome_email_last_notified_at TIMESTAMP,
      welcome_notification_count INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS user_settings (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
      email_notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
      task_completion_email BOOLEAN NOT NULL DEFAULT TRUE,
      scheduled_reminders_email BOOLEAN NOT NULL DEFAULT TRUE,
      morning_digest_email BOOLEAN NOT NULL DEFAULT TRUE,
      morning_digest_time TEXT NOT NULL DEFAULT '08:00',
      missed_task_email BOOLEAN NOT NULL DEFAULT TRUE,
      custom_smtp_host TEXT,
      custom_smtp_port INTEGER,
      custom_smtp_user TEXT,
      custom_smtp_password TEXT,
      custom_from_email TEXT,
      last_morning_email_date TEXT,
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS otp_records (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      code_hash TEXT NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      max_attempts INTEGER NOT NULL DEFAULT 5,
      expires_at TIMESTAMP NOT NULL,
      last_sent_at TIMESTAMP NOT NULL DEFAULT NOW(),
      verified BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS todos (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      due_date TEXT NOT NULL,
      due_time TEXT,
      reminder_minutes_before INTEGER,
      reminder_scheduled_time TIMESTAMP,
      reminder_sent BOOLEAN NOT NULL DEFAULT FALSE,
      completed BOOLEAN NOT NULL DEFAULT FALSE,
      completed_at TIMESTAMP,
      completion_email_sent BOOLEAN NOT NULL DEFAULT FALSE,
      missed_task_email_sent BOOLEAN NOT NULL DEFAULT FALSE,
      priority TEXT NOT NULL DEFAULT 'medium',
      category TEXT NOT NULL DEFAULT 'General',
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS notification_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      todo_id INTEGER REFERENCES todos(id) ON DELETE SET NULL,
      type TEXT NOT NULL,
      recipient_email TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      status TEXT NOT NULL,
      error_message TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS welcome_email_sent BOOLEAN NOT NULL DEFAULT FALSE;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS welcome_email_seen BOOLEAN NOT NULL DEFAULT FALSE;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS welcome_email_seen_at TIMESTAMP;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS welcome_email_last_notified_at TIMESTAMP;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS welcome_notification_count INTEGER NOT NULL DEFAULT 0;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();
    ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();

    ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata';
    ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS email_notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE;
    ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS task_completion_email BOOLEAN NOT NULL DEFAULT TRUE;
    ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS scheduled_reminders_email BOOLEAN NOT NULL DEFAULT TRUE;
    ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS morning_digest_email BOOLEAN NOT NULL DEFAULT TRUE;
    ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS morning_digest_time TEXT NOT NULL DEFAULT '08:00';
    ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS missed_task_email BOOLEAN NOT NULL DEFAULT TRUE;
    ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS custom_smtp_host TEXT;
    ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS custom_smtp_port INTEGER;
    ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS custom_smtp_user TEXT;
    ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS custom_smtp_password TEXT;
    ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS custom_from_email TEXT;
    ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS last_morning_email_date TEXT;
    ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();

    ALTER TABLE otp_records ADD COLUMN IF NOT EXISTS attempts INTEGER NOT NULL DEFAULT 0;
    ALTER TABLE otp_records ADD COLUMN IF NOT EXISTS max_attempts INTEGER NOT NULL DEFAULT 5;
    ALTER TABLE otp_records ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;
    ALTER TABLE otp_records ADD COLUMN IF NOT EXISTS last_sent_at TIMESTAMP NOT NULL DEFAULT NOW();
    ALTER TABLE otp_records ADD COLUMN IF NOT EXISTS verified BOOLEAN NOT NULL DEFAULT FALSE;
    ALTER TABLE otp_records ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();

    ALTER TABLE todos ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '';
    ALTER TABLE todos ADD COLUMN IF NOT EXISTS due_date TEXT;
    ALTER TABLE todos ADD COLUMN IF NOT EXISTS due_time TEXT;
    ALTER TABLE todos ADD COLUMN IF NOT EXISTS reminder_minutes_before INTEGER;
    ALTER TABLE todos ADD COLUMN IF NOT EXISTS reminder_scheduled_time TIMESTAMP;
    ALTER TABLE todos ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN NOT NULL DEFAULT FALSE;
    ALTER TABLE todos ADD COLUMN IF NOT EXISTS completed BOOLEAN NOT NULL DEFAULT FALSE;
    ALTER TABLE todos ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;
    ALTER TABLE todos ADD COLUMN IF NOT EXISTS completion_email_sent BOOLEAN NOT NULL DEFAULT FALSE;
    ALTER TABLE todos ADD COLUMN IF NOT EXISTS missed_task_email_sent BOOLEAN NOT NULL DEFAULT FALSE;
    ALTER TABLE todos ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'medium';
    ALTER TABLE todos ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'General';
    ALTER TABLE todos ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();
    ALTER TABLE todos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();

    ALTER TABLE notification_logs ADD COLUMN IF NOT EXISTS todo_id INTEGER REFERENCES todos(id) ON DELETE SET NULL;
    ALTER TABLE notification_logs ADD COLUMN IF NOT EXISTS error_message TEXT;
    ALTER TABLE notification_logs ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();

    CREATE INDEX IF NOT EXISTS otp_records_email_created_idx ON otp_records(email, created_at DESC);
    CREATE INDEX IF NOT EXISTS todos_user_due_date_idx ON todos(user_id, due_date);
    CREATE INDEX IF NOT EXISTS notification_logs_user_created_idx ON notification_logs(user_id, created_at DESC);
  `);
}
