# OrbitFlow — Real-Time Smart Productivity & Task Engine

OrbitFlow is a full-stack task and productivity application with PostgreSQL persistence, JWT authentication, email OTP verification, Google sign-in, Socket.IO real-time updates, and scheduled email notifications.

## Architecture

For the complete feature set, deploy OrbitFlow as **one long-running Node service** (Render, Railway, Fly.io, Google Cloud Run, or a VPS). That service runs:

- React/Vite frontend
- Express API
- Socket.IO
- PostgreSQL/Drizzle
- Background notification scheduler
- SMTP email delivery

The frontend can also be deployed separately (for example on Vercel) by setting `VITE_API_URL` to the backend URL. Socket.IO uses the same `VITE_API_URL`.

## Important: PostgreSQL is the source of truth

Todos, users, settings, OTP records, and notification logs are stored in PostgreSQL. Firestore is no longer used as a second todo/settings database, which prevents stale data and conflicting writes.

Firebase Authentication is still included only for Google sign-in; application data remains in PostgreSQL.

## Local setup

1. Copy `.env.example` to `.env`.
2. Fill in `DATABASE_URL`, `JWT_SECRET`, and SMTP variables.
3. Install dependencies:

```bash
npm ci
```

4. Start development:

```bash
npm run dev
```

5. Open `http://localhost:3000`.

The server automatically creates the required PostgreSQL tables on startup. You can also use Drizzle directly:

```bash
npm run db:push
```

## Production deployment — recommended

### Render

1. Push this project to GitHub.
2. Create a PostgreSQL database in Render (or use an external PostgreSQL provider).
3. Create a Web Service from the repository.
4. Render can use the included `render.yaml`.
5. Set:
   - `DATABASE_URL`
   - `APP_URL` to the final public URL
   - `SMTP_USER`
   - `SMTP_PASSWORD`
   - `FROM_EMAIL`
6. Deploy.
7. Verify `https://YOUR-DOMAIN/api/health` returns `status: ok` and `database: connected`.

### Vercel frontend + separate backend

Vercel is fine for the static React frontend, but the Socket.IO server and background scheduler need a long-running backend service.

For the Vercel project, set:

```text
VITE_API_URL=https://YOUR-BACKEND-DOMAIN
```

Do not deploy the long-running `server.ts` responsibilities as a Vercel serverless function.

## Environment variables

### Required

```text
DATABASE_URL=postgresql://...
JWT_SECRET=long-random-secret
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-google-app-password
FROM_EMAIL=your-email@gmail.com
```

### Optional

```text
DATABASE_SSL=false
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
APP_URL=https://your-domain.com
VITE_API_URL=https://your-backend-domain.com
```

Never commit `.env` or real SMTP credentials to GitHub. If a real credential was previously committed, revoke it and create a new one.

## Security fixes included

- Removed hard-coded demo accounts and the `123456` password backdoor.
- Removed hard-coded SMTP credentials.
- Registration now requires successful OTP verification.
- OTP generation uses a cryptographically secure random source.
- Frontend no longer silently turns API/database failures into fake local accounts/data.
- API errors are surfaced to the UI so deployment problems are visible.
- PostgreSQL supports the standard `DATABASE_URL` environment variable.
- Health endpoint checks the actual database connection.

## Build

```bash
npm run build
npm start
```

The production server serves the built React application and API from the same origin, so no `VITE_API_URL` is required for a single-service deployment.
