import 'dotenv/config';
import type { Request, Response } from 'express';
import { createApiApp } from '../src/server/app.ts';
import { ensureDatabaseSchema } from '../src/db/index.ts';

const app = createApiApp();
let initialized: Promise<void> | null = null;

export default async function handler(req: Request, res: Response) {
  initialized ??= ensureDatabaseSchema();
  try {
    await initialized;
  } catch (error) {
    initialized = null;
    console.error('[API] Database initialization failed:', error);
    return res.status(503).json({ error: 'Database is unavailable. Check DATABASE_URL and database access.' });
  }
  return app(req, res);
}
