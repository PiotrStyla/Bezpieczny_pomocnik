# 🚀 Deployment Guide - Vercel + GitHub Pages

## 📋 Overview

**Bezpieczny Pomocnik** uses a split deployment architecture:
- **Frontend**: GitHub Pages (static hosting, free)
- **Backend**: Vercel (serverless functions, free tier)

This setup provides:
- ✅ Always-on availability
- ✅ Auto-scaling serverless backend
- ✅ Zero maintenance costs (free tiers)
- ✅ Automatic HTTPS
- ✅ Global CDN distribution

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│  GitHub Pages                               │
│  https://piotrstyla.github.io/             │
│  Bezpieczny_pomocnik/frontend/             │
│                                             │
│  - Static HTML/CSS/JS                       │
│  - Service Worker (PWA)                     │
│  - Offline-first functionality              │
└──────────────────┬──────────────────────────┘
                   │
                   │ API Calls (CORS enabled)
                   │
┌──────────────────▼──────────────────────────┐
│  Vercel Serverless Functions                │
│  https://pomocnikapp.vercel.app/api/        │
│                                             │
│  - FastAPI endpoints                        │
│  - Push notifications (VAPID)               │
│  - Alert aggregation                        │
│  - AI processing                            │
└─────────────────────────────────────────────┘
```

---

## 🔧 Backend Deployment (Vercel)

### Prerequisites
- GitHub account with repository
- Vercel account (free tier is sufficient)
- Git configured with correct author information

### Step 1: Prepare Repository

Ensure these files are present:
```
├── api/
│   ├── index.py      # Main FastAPI app
│   └── vapid.py      # Lightweight push notification endpoints
├── backend/
│   ├── main.py
│   ├── config.py
│   ├── push_notifications.py
│   └── requirements.txt
├── vercel.json       # Vercel configuration
└── .gitignore
```

### Step 2: Configure `vercel.json`

```json
{
  "version": 2,
  "builds": [
    { "src": "api/index.py", "use": "@vercel/python" },
    { "src": "api/vapid.py", "use": "@vercel/python" }
  ],
  "routes": [
    { "src": "/api/vapid_public_key", "dest": "/api/vapid.py" },
    { "src": "/api/subscribe", "dest": "/api/vapid.py" },
    { "src": "/api/(.*)", "dest": "/api/index.py" }
  ]
}
```

### Step 3: Deploy to Vercel

#### Option A: Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"New Project"**
3. Import your GitHub repository
4. **Project settings:**
   - Framework Preset: `Other`
   - Root Directory: `./`
   - Build Command: *(leave empty)*
   - Output Directory: *(leave empty)*
5. Click **"Deploy"**

#### Option B: Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

### Step 4: Configure Environment Variables (Optional)

In Vercel Dashboard → **Settings** → **Environment Variables**, add:

```
VAPID_PUBLIC_KEY=BGBUeAbaWr9A54Wn2AwsgPDXjfqT23nKpHjMt9OnqQymYhSEcvznDJmknx24UPt5BWHVpbi9AVD8l42AQ1ZLrhs
VAPID_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg...\n-----END PRIVATE KEY-----
VAPID_EMAIL=mailto:kontakt@fundacja-hospicjum.org
OPENAI_API_KEY=sk-...
```

**Note:** If these are not set, the backend will auto-generate VAPID keys (they'll change on each deployment).

### Step 5: Verify Deployment

Test the API endpoint:
```bash
curl https://pomocnikapp.vercel.app/api/vapid_public_key
```

Expected response:
```json
{"public_key": "BHW7e6r_xzAtPy0Dw1-kNPmK6C_ZqXgJSHENKPzYVi3h..."}
```

---

## 🌐 Frontend Deployment (GitHub Pages)

### Step 1: Enable GitHub Pages

1. Go to your GitHub repository
2. Navigate to **Settings** → **Pages**
3. **Source**: Deploy from a branch
4. **Branch**: `main` → `/frontend` folder
5. Click **Save**

### Step 2: Configure API Base URL

In `frontend/app.js`, update the API base URL:

```javascript
const getApiBaseUrl = () => 
  window.APP_API_BASE_URL || 
  localStorage.getItem('app_api_base_url') || 
  'https://pomocnikapp.vercel.app/api';  // ← Your Vercel URL
```

### Step 3: Update Service Worker (if needed)

In `frontend/sw.js`, ensure the scope is correct:

```javascript
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Bezpieczny Pomocnik';
  const options = {
    body: data.body || 'Nowy alert bezpieczeństwa',
    icon: './images/logo_192x192.png',  // Relative path for GH Pages
    badge: './images/badge-96x96.png',
    vibrate: [200, 100, 200]
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
```

### Step 4: Commit and Push

```bash
git add frontend/app.js frontend/sw.js
git commit -m "configure frontend for GitHub Pages deployment"
git push origin main
```

### Step 5: Wait for Deployment

GitHub Pages builds automatically. Check status at:
```
https://github.com/[username]/[repo]/deployments
```

Your app will be available at:
```
https://[username].github.io/[repo]/frontend/
```

---

## 🔔 Push Notifications Setup

### How It Works

1. **VAPID Keys**: Backend generates or loads VAPID keys (Web Push standard)
2. **Subscription**: Frontend subscribes via browser Push API → FCM/browser push service
3. **Registration**: Subscription is sent to `/api/subscribe` and stored in memory
4. **Sending**: Backend uses `pywebpush` to send notifications to all subscribers

### Testing Push Notifications

#### In Browser Console:
```javascript
// 1. Get VAPID public key
fetch('https://pomocnikapp.vercel.app/api/vapid_public_key')
  .then(r => r.json())
  .then(console.log)

// 2. Subscribe to push
// Click "Włącz powiadomienia" button in the app

// 3. Check subscription
navigator.serviceWorker.ready.then(reg => {
  reg.pushManager.getSubscription().then(console.log)
})
```

#### Expected Flow:
```
[Push] Start subscription flow
[Push] Permission: granted
[Push] SW ready
[Push] GET /api/vapid_public_key status: 200
[Push] VAPID key length: 87
[Push] Subscribed with endpoint: https://fcm.googleapis.com/...
[Push] POST /api/subscribe status: 200
✅ Success!
```

---

## 🐛 Troubleshooting

### Backend Issues

#### 1. **500 Internal Server Error**

**Symptom:** `/api/vapid_public_key` returns 500

**Common causes:**
- Missing `pydantic-settings` package
- Import errors in `backend/config.py`
- APScheduler issues (use lightweight `api/vapid.py` instead)

**Solution:**
```bash
# Check Vercel Function Logs
# Dashboard → Project → Functions → Click on function → View logs

# Ensure requirements.txt includes:
pydantic-settings==2.1.0
```

#### 2. **CORS Errors**

**Symptom:** 
```
Access to fetch at 'https://pomocnikapp.vercel.app/api/...' from origin 'https://piotrstyla.github.io' has been blocked by CORS policy
```

**Solution:** Verify CORS middleware in `api/vapid.py` or `backend/main.py`:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware, 
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True, 
    allow_methods=["*"], 
    allow_headers=["*"]
)
```

#### 3. **Pydantic Import Error**

**Symptom:** `PydanticImportError: BaseSettings has been moved`

**Solution:**
```python
# backend/config.py - Update import:
from pydantic_settings import BaseSettings  # ✅ Correct for Pydantic 2.x
from pydantic import Field

# NOT: from pydantic import BaseSettings  # ❌ Old Pydantic 1.x
```

#### 4. **Module Not Found: feedparser**

**Solution:** Add to `backend/requirements.txt`:
```
feedparser==6.0.10
```

### Frontend Issues

#### 1. **Push Notifications Not Working**

**Check browser console for errors:**
```javascript
// Test each step:
console.log('Push supported?', 'serviceWorker' in navigator && 'PushManager' in window);
console.log('Notification permission:', Notification.permission);

// Get subscription status
navigator.serviceWorker.ready.then(reg => {
  reg.pushManager.getSubscription().then(sub => {
    console.log('Current subscription:', sub);
  });
});
```

#### 2. **Service Worker Not Updating**

**Solution:**
```javascript
// Force update in browser console:
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.update());
});

// Or hard refresh: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)
```

### Deployment Issues

#### 1. **GitHub Deployment Author Error**

**Symptom:** "A commit author is required"

**Solution:**
```bash
# Set correct Git author
git config user.name "YourGitHubUsername"
git config user.email "your@email.com"

# Amend last commit with correct author
git commit --amend --reset-author --no-edit
git push origin main
```

#### 2. **Vercel Build Fails**

**Check build logs in Vercel Dashboard:**
- Common issue: Missing dependencies in `requirements.txt`
- Python version mismatch (Vercel uses 3.12 by default)

**Solution:** Ensure all imports in your code have corresponding packages in `requirements.txt`

---

## 📊 Monitoring & Maintenance

### Vercel Dashboard
- **Function Logs**: View real-time logs for debugging
- **Analytics**: Monitor API usage and performance
- **Deployments**: Track deployment history

### GitHub Pages
- **Actions**: Monitor deployment status
- **Settings → Pages**: View deployment URL and status

### Push Notification Limits

⚠️ **Important:** Vercel has a **read-only filesystem**. Subscriptions are stored in memory and will be lost on:
- Function cold starts (after ~5 minutes of inactivity)
- New deployments
- Function crashes

**For production**, consider:
- Vercel KV (Redis)
- Vercel Postgres
- External database (Supabase, PlanetScale, etc.)

---

## 🔄 Updating the Application

### Update Backend:
```bash
# Make changes to backend files
git add backend/ api/
git commit -m "update: backend feature XYZ"
git push origin main

# Vercel auto-deploys on push
# Check deployment status in Vercel dashboard
```

### Update Frontend:
```bash
# Make changes to frontend files
git add frontend/
git commit -m "update: frontend feature XYZ"
git push origin main

# GitHub Pages rebuilds automatically (1-2 minutes)
```

---

## 🎯 Success Commits Reference

Key commits that fixed deployment issues:

| Commit | Description | Status |
|--------|-------------|--------|
| `603b395` | Fix Git author for Vercel | ✅ |
| `ee7bd7c` | Connect frontend to Vercel backend | ✅ |
| `38fe006` | Fix read-only filesystem handling | ✅ |
| `d88d4eb` | Add pydantic-settings package | ✅ |
| `abe737e` | Add /api/subscribe endpoint | ✅ Working! |

**Current stable version:** `abe737e`

---

## 📚 Additional Resources

- [Vercel Python Documentation](https://vercel.com/docs/functions/runtimes/python)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [VAPID Specification](https://datatracker.ietf.org/doc/html/rfc8292)
- [Service Workers Guide](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

---

## 💡 Tips & Best Practices

1. **Always test locally first**: `uvicorn backend.main:app --reload`
2. **Use environment variables**: Never commit API keys to Git
3. **Monitor function logs**: Check Vercel dashboard regularly
4. **Test CORS**: Use browser console to test API calls
5. **Version control**: Tag stable releases with Git tags
6. **Backup VAPID keys**: Store them securely if using persistent keys

---

**Last updated:** November 4, 2025  
**Tested with:** Python 3.12, FastAPI 0.104.1, Pydantic 2.5.0

✅ **Deployment successful!** Push notifications working on Vercel + GitHub Pages! 🎉
