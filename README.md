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

## 🔒 Security & Privacy

### User Data Isolation
We use user-specific keys (`ff_data_{email}`) for all local storage. This ensures that even if multiple users use the same browser, their financial records remains strictly private and isolated.

### Serverless AI
The AI backend runs on serverless functions. Your API keys are **never** exposed to the browser. All communication is encrypted and rate-limited for safety.

---

## ☁️ Cloud Sync (Firebase)
Cloud Sync is optional. If configured, your account data is synced so the same email/password works across devices.

Setup (Firebase Console):
1. Create a Firebase project.
2. Enable **Authentication → Email/Password**.
3. Create a **Firestore Database**.
4. Set Firestore rules to only allow the signed-in user to read/write their own document:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
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
