import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';

const databaseUrl = process.env.DATABASE_URL?.trim();
const host = process.env.SQL_HOST?.trim();
const user = (process.env.SQL_USER || process.env.SQL_ADMIN_USER)?.trim();
const password = process.env.SQL_PASSWORD || process.env.SQL_ADMIN_PASSWORD;
const database = process.env.SQL_DB_NAME?.trim();

if (!databaseUrl && (!host || !user || !password || !database)) {
  throw new Error(
    'Database configuration missing. Set DATABASE_URL (recommended) or SQL_HOST, SQL_USER, SQL_PASSWORD and SQL_DB_NAME.'
  );
}

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  schemaFilter: ['public'],
  dbCredentials: databaseUrl
    ? { url: databaseUrl, ssl: process.env.DATABASE_SSL === 'true' }
    : {
        host: host!,
        user: user!,
        password: password!,
        database: database!,
        port: Number(process.env.SQL_PORT || 5432),
        ssl: process.env.DATABASE_SSL === 'true',
      },
  verbose: true,
});
