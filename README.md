# Finance Flow Website

Finance Flow is a React + Vite web app with Vercel serverless API endpoints.

## Project structure

```text
FinanceFlow-website/
├── frontend/            # React app (Vite)
├── api/                 # Vercel serverless functions
├── server/              # Shared server logic used by /api
├── vercel.json          # Vercel build + routing config
└── package.json         # Root deps used by API functions
```

## Local development

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Production build:

```bash
cd frontend
npm run build
```

## Vercel deployment

This repo is configured to:

- build with `cd frontend && npm ci && npm run build`
- serve `frontend/dist` as the static output
- rewrite all non-API routes to SPA `index.html`
- keep `/api/*` routed to serverless functions

Required environment variable:

- `OPENAI_API_KEY`

Optional:

- `OPENAI_MODEL`

### If new code is not showing on Vercel

1. Confirm Vercel project is connected to this repo and correct branch.
2. In Vercel Project Settings, keep:
   - Build Command: `cd frontend && npm ci && npm run build`
   - Output Directory: `frontend/dist`
3. Trigger a fresh deploy from the latest commit.
4. Hard refresh browser cache (`Ctrl/Cmd + Shift + R`).

## Important behavior (smart login / account data)

User auth/data in the current frontend is stored in browser `localStorage`.
That means account data does **not** sync automatically between mobile and laptop by default.
For cross-device same-account data, cloud sync must be implemented/configured (e.g., Firebase or backend user storage).
