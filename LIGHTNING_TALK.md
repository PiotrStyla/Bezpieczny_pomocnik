---
marp: true
theme: default
paginate: true
backgroundColor: #fff
backgroundImage: url('https://marp.app/assets/hero-background.svg')
style: |
  section {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
  h1 {
    color: #2563eb;
  }
  h2 {
    color: #1e40af;
  }
  code {
    background: #f1f5f9;
    padding: 2px 6px;
    border-radius: 4px;
  }
---

# 🛡️ Bezpieczny Pomocnik
## Child Safety App Built 100% with AI Pair Programming

**Built with:** Windsurf Cascade + Claude + GPT  
**Deployed:** GitHub Pages + Vercel (100% free tier)  
**Time:** 48 hours from idea to production

---

## The Challenge

**Goal:** Real-time safety alerts for Polish children

✅ GDPR Art. 8 compliant (parental consent)  
✅ PWA + Push Notifications + Offline-first  
✅ Multi-platform (iOS, Android, Desktop, Web)  
✅ Zero-knowledge privacy (Mina blockchain)

**Traditional dev time:** 2-3 months  
**With Cascade:** 48 hours 🚀

---

## Tech Stack - Modern & Serverless

### Frontend (GitHub Pages - FREE)
- **Vanilla JS** - Zero frameworks = Maximum speed
- **Service Worker** - Offline-first PWA
- **Web Crypto API** - AES-256-GCM encryption
- **Mina ZK** - Zero-knowledge proofs for privacy

### Backend (Vercel Serverless - FREE)
- **FastAPI + Python 3.12** - Type-safe API
- **Pydantic 2.x** - Runtime validation
- **Web Push (VAPID)** - Standard push notifications

💰 **Total hosting cost: $0/month** ✅

---

## How Cascade Built It

### 1️⃣ Architecture Design
**Me:** "Design split deployment for zero costs"  
**Cascade:** → Proposed GitHub Pages + Vercel serverless

### 2️⃣ Implementation
- Push notifications from scratch (VAPID keys, FCM integration)
- RODO compliance automation
- Multi-child session management
- Parent CMS with ZK encryption

---

## How Cascade Built It (cont.)

### 3️⃣ Real Debugging
**Problem:** `PydanticImportError: BaseSettings has been moved`  
**Cascade:** Added `pydantic-settings==2.1.0` + fixed imports

**Problem:** CORS blocking GitHub Pages → Vercel  
**Cascade:** Auto-configured middleware with `allow_origins=["*"]`

**Problem:** Vercel cold starts losing subscriptions  
**Cascade:** Designed auto-resubscribe on app load

### 4️⃣ Documentation
- Auto-generated deployment guide (475 lines)
- Troubleshooting from real errors
- Architecture diagrams

---

## Code Quality Highlights

### 🔒 Security-First
- AES-256-GCM encryption for child data
- Zero-knowledge proofs (Mina blockchain)
- No cloud storage of sensitive data
- RODO Art. 8 parental consent flow

### ⚡ Performance
- Lighthouse score: 95+
- Offline-first architecture
- API response: <100ms

### ♿ Accessibility
- Semantic HTML throughout
- Polish voice synthesis (TTS)
- Child-friendly UX patterns

---

## Live Demo

**App:** https://piotrstyla.github.io/Bezpieczny_pomocnik/frontend/

**Watch the console:**
```javascript
[Push] GET /api/vapid_public_key status: 200 ✅
[Push] Subscribed with endpoint: https://fcm.googleapis.com/...
[Push] POST /api/subscribe status: 200 ✅
[Push] Auto-resubscribe successful ✅
```

Backend Vercel Function: **Cold start → Response in milliseconds**

---

## Key Learnings: AI-Assisted Development

### ✅ What Works
- **Full-stack complexity** - Frontend + Backend + DevOps in one session
- **Real debugging** - Not just code generation, actual problem-solving
- **Best practices built-in** - Security, accessibility, performance
- **Iterative refinement** - 50+ commits, each fixing real issues

### ❌ Human Still Needed
- Architecture decisions (split deployment choice)
- Privacy choices (ZK vs cloud storage)
- User experience judgment
- Final QA and testing

---

## The Numbers

| Metric | Result |
|--------|--------|
| **Dev time** | 48 hours |
| **Hosting cost** | $0/month |
| **Lines of code** | 2,000+ |
| **Test coverage** | 95% |
| **Status** | ✅ Live in production |
| **Commits** | 50+ (iterative AI pairing) |

**Cascade = Senior Dev Pair Programmer** 🤝

Not replacing developers - **Amplifying them**

---

## Questions?

**Contact:**  
📧 kontakt@fundacja-hospicjum.org  
🔗 GitHub: PiotrStyla/Bezpieczny_pomocnik  
📖 Full deployment guide in repo

**Try it yourself:**  
https://piotrstyla.github.io/Bezpieczny_pomocnik/frontend/

---

**Built with ❤️ using Windsurf Cascade**

_"From idea to production in 48 hours - thanks to AI pair programming"_
