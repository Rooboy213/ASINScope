# Deploy ASINScope on Render + Supabase

Single service: Express API serves the Vite React frontend.

## 1. Supabase (Postgres)

1. Create a project at https://supabase.com
2. **Settings → Database → Connection string → URI**
3. Copy the URI and put your database password in place of `[YOUR-PASSWORD]`
4. Prefer **Session** mode / port **5432** if pooler causes issues with Drizzle

## 2. Render (Web Service)

1. https://render.com → **New → Web Service** → GitHub repo `Rooboy213/ASINScope`
2. Settings:

| Field | Value |
|-------|--------|
| Runtime | Node |
| Build Command | `corepack enable && pnpm install && pnpm run build:prod` |
| Start Command | `pnpm run start` |
| Instance | Free |

3. Environment variables:

| Key | Value |
|-----|--------|
| `DATABASE_URL` | Supabase connection URI |
| `NODE_ENV` | `production` |
| `RAPIDAPI_KEY` | your RapidAPI key |
| `SESSION_SECRET` | long random string |
| `RAPIDAPI_HOST` | `real-time-amazon-data.p.rapidapi.com` (optional) |

`PORT` is set automatically by Render — do not set it yourself.

4. Deploy and wait until **Live**.

## 3. Create tables

In Render **Shell**:

```bash
pnpm run db:push
```

Or one-time Start Command: `pnpm run db:push && pnpm run start`, then switch back to `pnpm run start`.

## 4. Check

- Site: `https://your-service.onrender.com`
- Health: `https://your-service.onrender.com/api/health`

Free web services sleep after idle; first request may take 30–60s.
