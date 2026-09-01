# Deploy ASINScope on Render + Supabase

Single service: Express API serves the Vite React frontend.

## 1. Supabase (Postgres)

1. Create a project at https://supabase.com
2. **Settings → Database → Connection string → URI**
3. Copy the URI and put your database password in place of `[YOUR-PASSWORD]`
4. Prefer **Session** mode / port **5432** if pooler causes issues with Drizzle

## 2. Render (Web Service)

1. https://render.com → **New → Web Service** → GitHub repo with this code
2. Settings:

| Field | Value |
|-------|--------|
| Runtime | Node |
| Build Command | `npx pnpm@9.15.0 install && npx pnpm@9.15.0 run build:prod` |
| Start Command | `npx pnpm@9.15.0 run start` |
| Instance | Free |

**Do not use** `corepack enable` on Render (read-only FS → build fails).

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
npx pnpm@9.15.0 run db:push
```

## 4. Check

- Site: `https://your-service.onrender.com`
- Health: `https://your-service.onrender.com/api/health`

Free web services sleep after idle; first request may take 30–60s.
