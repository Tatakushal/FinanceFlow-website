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

## Important behavior (smart login / account data)

User auth/data in the current frontend is stored in browser `localStorage`.
That means account data does **not** sync automatically between mobile and laptop unless cloud sync is added/configured.
