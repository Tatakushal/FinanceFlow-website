# ⚡ Finance Flow — Full Web Application & Marketing Site

A premium, AI-powered personal finance application and matching marketing website. This project is production-ready, featuring a 2-step simplified signup, private user data isolation, and a serverless AI advisor.

## 🚀 Key Features

- **Marketing Suite**: Comprehensive landing page, features, pricing, and blog.
- **2-Step Fast Signup**: Streamlined onboarding (Basic Details → OTP Verification).
- **FlowAI Advisor**: A private financial agent that analyzes your spending and gives personalized advice.
- **Data Isolation**: Every user account has its own private database (localStorage) — no mixed records.
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
│   ├── signup.html         ← 2-Step Simplified Signup
│   └── ... (20+ pages)
├── api/
│   └── flowai.js           ← Vercel Serverless Function
├── server/
│   ├── flowai-core.js      ← AI Agent Logic
│   └── security.js         ← Rate Limiting & Safety
├── css/ & js/              ← Global Styles & Core Logic
└── vercel.json             ← Production Deployment Config
```

---

## 🛠️ Deploy to Vercel (Recommended)

Finance Flow is optimized for **Vercel** serverless deployment.

1.  **Push to GitHub**: Upload this folder to a GitHub repository.
2.  **Import to Vercel**: Connect your repo to Vercel.
3.  **Set Environment Variables**: In Vercel Project Settings, add:
    -   `OPENAI_API_KEY`: Your OpenAI Secret Key.
    -   `OPENAI_MODEL`: `gpt-4o-mini` (or your preferred model).
4.  **Deploy**: Hit deploy and your app is live! 🚀

---

## 🔒 Security & Privacy

### User Data Isolation
We use user-specific keys (`ff_data_{email}`) for all local storage. This ensures that even if multiple users use the same browser, their financial records remains strictly private and isolated.

### Serverless AI
The AI backend runs on serverless functions. Your API keys are **never** exposed to the browser. All communication is encrypted and rate-limited for safety.

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
- The signup flow is purely frontend-simulated (OTP) for maximum privacy and zero database requirement.


