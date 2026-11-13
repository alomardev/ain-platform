# Ain Platform (منصة عين)

Arabic (RTL) admin console for **فريق العيون التطوعي**: volunteers, programs, sponsors, volunteer hours and donations.

React + Vite UI, Cloudflare Pages Functions API, D1 (SQLite), R2, Cloudflare Images, Browser Rendering (PDF).

**Full documentation: [CLAUDE.md](CLAUDE.md)** (architecture, database, design decisions, deployment to Cloudflare, porting to Vercel + Supabase).

## Quick start

```bash
cd app/client
npm install
npm run db:migrate:local
npm run dev:cf          # http://localhost:8788
```

Deploying to a new Cloudflare account: see CLAUDE.md §10.

> The app has no login yet. Protect the deployed URL (e.g. Cloudflare Access) before sharing it. See CLAUDE.md §10.3.
