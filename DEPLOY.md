# Deploy ASINScope on Render + Supabase

Repo: `Rooboy213/ASINScope`

## Render commands

**Build Command** (must install devDependencies so Vite is available):

```bash
npx pnpm@9.15.0 install --no-frozen-lockfile --prod=false && npx pnpm@9.15.0 run build:prod
```

**Start Command:**

```bash
npx pnpm@9.15.0 run start
```

## Environment

| Key | Value |
|-----|--------|
| `DATABASE_URL` | Supabase URI |
| `NODE_ENV` | `production` (runtime only; build still installs devDeps via `--prod=false`) |
| `RAPIDAPI_KEY` | your key |
| `SESSION_SECRET` | random string |

After live: `npx pnpm@9.15.0 run db:push`

Health: `/api/health`
