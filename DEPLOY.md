# Deploy ASINScope on Railway

This project is a pnpm monorepo:

- **Frontend**: Vite + React (`artifacts/numverify`)
- **Backend**: Express API (`artifacts/api-server`)
- **Database**: PostgreSQL + Drizzle (`lib/db`)

In production the API also serves the built frontend (single service).

## 1. Create a Railway project

1. Go to [railway.app](https://railway.app) and sign in with GitHub.
2. **New Project** → **Deploy from GitHub repo** → select `Rooboy213/ASINScope`.
3. Railway will detect the repo. Keep the root directory as `/`.

## 2. Add PostgreSQL

1. In the project: **+ New** → **Database** → **PostgreSQL**.
2. After it is created, open the Postgres service → **Variables**.
3. Copy `DATABASE_URL` (or use Railway’s variable reference).

## 3. Configure the web service

Open your **web service** (the one from the GitHub repo):

### Variables (Settings → Variables)

| Variable | Value |
|----------|--------|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (or paste the URL) |
| `NODE_ENV` | `production` |
| `PORT` | Railway sets this automatically — do not hardcode |

Optional (if you use them later):

- `SESSION_SECRET` / JWT secrets
- any third-party API keys

### Build & start (usually auto from `railway.toml`)

- **Build**: `pnpm install --frozen-lockfile && pnpm run build:prod`
- **Start**: `pnpm run start`

If the UI overrides these, paste the same commands.

## 4. Push database schema

After the first successful deploy (or from a one-off command):

```bash
# From Railway shell / local with DATABASE_URL set
pnpm run db:push
```

Or in Railway: service → **Settings** → **Deploy** → run a one-off command:

```bash
pnpm --filter @workspace/db run push
```

## 5. Generate a public domain

Service → **Settings** → **Networking** → **Generate Domain**.

Your app will be at something like `https://asinscope-production.up.railway.app`.

- Frontend: `/`
- API: `/api/...`
- Health: `/api/health`

## Notes

- Free/trial Railway usage is limited by credits; the service stays up (no sleep like Render free).
- The frontend calls `/api` on the same origin, so no `VITE_API_URL` is required for this single-service setup.
- If build fails on lockfile, try `pnpm install` without `--frozen-lockfile` once, commit the updated lockfile, and redeploy.
