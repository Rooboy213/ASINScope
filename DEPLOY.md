# Deploy ASINScope on Render + Supabase

**Repo to connect on Render:** `Rooboy213/ASINScope` (not a different clone name).

## Build / Start (Render)

Build:
```bash
npx pnpm@9.15.0 install --no-frozen-lockfile && npx pnpm@9.15.0 run build:prod
```

Start:
```bash
npx pnpm@9.15.0 run start
```

Env: `DATABASE_URL`, `NODE_ENV=production`, `RAPIDAPI_KEY`, `SESSION_SECRET`

After live: `npx pnpm@9.15.0 run db:push`
