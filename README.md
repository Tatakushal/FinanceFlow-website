# ⚡ Finance Flow — Marketing Website

A complete, multi-page marketing website for the Finance Flow app. Zero dependencies, pure HTML/CSS/JS — deploys to Vercel or Netlify in one click.

## Pages

| Page | File | Description |
|------|------|-------------|
| Home | `index.html` | Landing page with hero, features, testimonials, pricing preview |
| Features | `pages/features.html` | Detailed feature breakdown with interactive visuals |
| Pricing | `pages/pricing.html` | 3-tier pricing, comparison table, FAQ, waitlist form |
| Blog | `pages/blog.html` | Article grid with categories and newsletter signup |
| Contact | `pages/contact.html` | Contact form, email addresses, office info |

## File Structure

```
financeflow-website/
├── index.html              ← Homepage
├── pages/
│   ├── features.html
│   ├── pricing.html
│   ├── blog.html
│   └── contact.html
├── css/
│   └── global.css          ← Shared styles (nav, footer, animations)
├── js/
│   └── main.js             ← Shared JS (nav, mobile menu, scroll reveal)
├── vercel.json             ← Vercel deploy config (clean URLs)
└── netlify.toml            ← Netlify deploy config
```

## Deploy to Vercel (Recommended — Free)

1. Go to [vercel.com](https://vercel.com) and sign up
2. Click **"Add New Project"**
3. Upload this folder or connect your GitHub repo
4. Click **Deploy** — done! 🚀

Your site will be live at `https://your-project.vercel.app`

## Deploy to Netlify (Also Free)

1. Go to [netlify.com](https://netlify.com) and sign up
2. Drag and drop this entire folder onto the Netlify dashboard
3. Done — live in 30 seconds! 🚀

## Deploy to GitHub Pages

1. Push this folder to a GitHub repo
2. Go to Settings → Pages
3. Set source to `main` branch, root `/`
4. Done!

## Custom Domain

After deploying to Vercel or Netlify, you can add your custom domain (e.g., `financeflow.app`) for free in their dashboard.

## Tech Stack

- Pure HTML5 + CSS3 + Vanilla JS
- Google Fonts (Syne + DM Sans)
- No frameworks, no build step
- Fully responsive (mobile + desktop)
- Scroll reveal animations
- Mobile hamburger menu
- Interactive FAQ, forms, newsletter

## Design System

Colors are defined in `css/global.css` as CSS variables:
- `--primary`: #00E5A0 (green)
- `--accent`: #3D7FFF (blue)  
- `--warn`: #FF6B35 (orange)
- `--bg`: #060A12 (dark background)

To change the brand color, just update `--primary` in `css/global.css`.

## FlowAI Agent Integration (OpenAI)

The in-app chat (`app/ai-chat.html`) is now wired to your own backend endpoint:

- `POST /api/flowai` on Vercel via `api/flowai.js`
- `POST /api/flowai` on Netlify via redirect to `netlify/functions/flowai.js`

### Added files

- `server/flowai-core.js` (shared agent logic + tool-calling)
- `api/flowai.js` (Vercel serverless endpoint)
- `netlify/functions/flowai.js` (Netlify function)
- `package.json` (OpenAI dependency)

### Environment variables

Set these in Vercel/Netlify project settings:

- `OPENAI_API_KEY` (required)
- `OPENAI_MODEL` (optional, default: `gpt-4.1-mini`)

### Local testing

1. Install dependencies:
   - `npm install`
2. Set env vars in your local shell.
3. Run with your preferred host runtime:
   - Vercel: `npx vercel dev`
   - Netlify: `npx netlify dev`
4. Open `app/ai-chat.html` through the dev server and test chat.

### Notes

- The browser never sees your OpenAI API key.
- The endpoint uses an agentic tool loop to compute finance snapshots and optional budget reallocation suggestions before replying.
- If the API call fails, the app keeps your current fallback response behavior.

