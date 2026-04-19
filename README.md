# ⚡ Finance Flow — Full Web Application & Marketing Site

A premium, AI-powered personal finance application and matching marketing website. This project is production-ready, featuring simple email/password signup (no OTP), private user data isolation, and a serverless AI advisor.

## 🚀 Key Features

- **Marketing Suite**: Comprehensive landing page, features, pricing, and blog.
- **Simple Signup**: Email + password signup (no OTP).
- **FlowAI Advisor**: A private financial agent that analyzes your spending and gives personalized advice.
- **Data Isolation**: Every user account has its own private database (localStorage) — no mixed records.
- **Cloud Sync (Optional)**: Sync the same account across phone + laptop (Firebase).
- **Zero Bank Linking**: Log transactions manually or via AI for total privacy.
- **Responsive Design**: Works perfectly on Desktop, Tablet, and Mobile.

---

## 📂 Project Structure

```
financeflow-final/
├── index.html              ← Landing Page
├── app/                    ← Full Web Application
│   ├── dashboard.html      ← Financial Overview
│   ├── ai-chat.html        ← FlowAI Advisor Interface
│   ├── signup.html         ← Signup (Email/Password)
│   └── ... (20+ pages)
├── api/
│   └── flowai.js           ← Vercel Serverless Function
├── server/
│   ├── flowai-core.js      ← AI Agent Logic
│   └── security.js         ← Rate Limiting & Safety
├── css/ & js/              ← Global Styles & Core Logic
└── vercel.json             ← Production Deployment Config
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

If Firebase env vars are not set, Finance Flow runs in local-only mode (no cloud sync).

---

## 🎨 Tech Stack

- **Frontend**: Vanilla HTML5, CSS3 (Custom Properties), Javascript (ES6+).
- **Backend**: Node.js Serverless Functions (Vercel API).
- **AI**: OpenAI Chat Completions API.
- **Storage**: LocalStorage with per-user key isolation.
- **Animations**: CSS Keyframes + Scroll Reveal.

---

## 📝 Notes for Developers
- To change brand colors, update `--primary` and `--accent` in `css/app.css` and `css/global.css`.
- The AI endpoint requires the `OPENAI_API_KEY` to be set in the deployment environment.
- Signup is email/password (local-only by default); Cloud Sync uses Firebase Authentication (optional).


