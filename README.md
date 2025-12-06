# 🛡️ Bezpieczny Pomocnik - Child Safety Application

**Created with ❤️ for children's safety by Fundacja na rzecz Hospicjum Maryi Królowej Apostołów w Krakowie**

[![GitHub contributors](https://img.shields.io/github/contributors/PiotrStyla/Bezpieczny_pomocnik)](https://github.com/PiotrStyla/Bezpieczny_pomocnik/graphs/contributors)
[![GitHub issues](https://img.shields.io/github/issues/PiotrStyla/Bezpieczny_pomocnik)](https://github.com/PiotrStyla/Bezpieczny_pomocnik/issues)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/PiotrStyla/Bezpieczny_pomocnik)](https://github.com/PiotrStyla/Bezpieczny_pomocnik/pulls)
[![License](https://img.shields.io/badge/license-Foundation%20Approval%20License-blue)](LICENSE)

---

## 🚀 **Quick Start for Developers**

Want to contribute? **It's easy!** 

```bash
# 1. Fork and clone
git clone https://github.com/YOUR-USERNAME/Bezpieczny_pomocnik.git
cd Bezpieczny_pomocnik

# 2. Start developing
# Frontend: Open frontend/index.html in browser
# Backend: cd backend && python -m uvicorn main:app --reload

# 3. Make your contribution! 🎉
```

📖 **[Contributing Guide](CONTRIBUTING.md)** - Everything you need to know  
🐛 **[Report Bug](https://github.com/PiotrStyla/Bezpieczny_pomocnik/issues/new?template=bug_report.md)** - Found something broken?  
💡 **[Suggest Feature](https://github.com/PiotrStyla/Bezpieczny_pomocnik/issues/new?template=feature_request.md)** - Have an idea?  

---

## 📋 **About**

Bezpieczny Pomocnik is a progressive web application (PWA) designed specifically for **children aged 5–16** and their caregivers.
It helps them understand **weather and safety alerts across Poland** in clear, age‑appropriate language.

**Key capabilities:**

- 🌦️ **Multi‑source alert aggregation** from national and local sources (see `backend/data_sources.py`, `poland_locations.py`)
- 🎯 **AI‑powered simplification** of official alerts into child‑friendly messages (`backend/ai_processor.py`)
- 🗣️ **Voice guidance** via Web Speech API with child‑appropriate Polish voices
- 🗺️ **Map‑based view** of alerts with location filtering
- 📲 **PWA & offline mode** – service worker, emergency cache, works when the internet is down
- 🔔 **Push notifications** for new critical alerts
- 👨‍👩‍👧‍👦 **Parent CMS & child profiles** with parental consent flows (RODO Art. 8)
- 🔒 **Zero‑knowledge, encrypted storage** of sensitive data in the browser (no child profiles on the server)

---

## 🖼️ Screenshots

**Child app – safety map and actions**

![Bezpieczny Pomocnik – child app view](docs/screenshots/child-app.png)

**Parent CMS – safety message creator for children**

![Parent CMS – komunikaty bezpieczeństwa dla dzieci](docs/screenshots/parent-cms.png)

---

## 🤝 **Contributing to Child Safety**

We welcome developers, designers, testers, and anyone passionate about child safety! 

### 🎯 **Areas Where We Need Help**
- 🎨 **Frontend:** UI/UX improvements, accessibility, animations
- ⚡ **Backend:** API optimization, new alert sources, performance
- 📱 **Mobile:** PWA features, offline capabilities, push notifications
- 🌍 **Internationalization:** More languages, localization
- 🧪 **Testing:** Unit tests, integration tests, user testing
- 📚 **Documentation:** Guides, API docs, tutorials

### 🏆 **Contributor Recognition**
- 🐛 **Bug Hunter** - Found and reported critical bugs
- 💡 **Feature Pioneer** - Suggested implemented features
- 🔧 **Code Champion** - Significant code contributions
- 🌍 **Global Guardian** - Localization contributions
- 📚 **Doc Master** - Documentation improvements

**All contributors are acknowledged in our releases and documentation!**

## 👤 **Developer & Contact**

**Lead Developer:** Piotr Styla  
**Contact:** p.styla [at] gmail [dot] com  
**GitHub:** [@PiotrStyla](https://github.com/PiotrStyla)

*For technical questions, bug reports, feature requests, and collaboration opportunities.*

---

## 🏛️ **Project Beneficiary**

**Created in support of:**  
**Fundacja na rzecz Hospicjum Maryi Królowej Apostołów w Krakowie**

- 🎯 Future revenues and recognition dedicated to the Foundation
- 📍 Foundation serves as beneficiary of project success
- ⚖️ Foundation assumes no legal responsibility during development phase

### 📄 **Foundation Information**
- **Address:** 30-404 Kraków, ul. Cegielniana 6B/45
- **Website:** https://fundacja-hospicjum.org/
- **KRS:** 0001063161
- **NIP:** 6793279476  
- **REGON:** 526664276

## 📄 **Licensing & Use**

**Important:** This software requires Foundation approval for any use.

### 🔍 **Open Development**
- ✅ **Source code visibility** - educational and learning purposes
- ✅ **Community contributions** - submit improvements and fixes
- ✅ **Development forks** - for testing and personal experimentation
- ✅ **Academic research** - study implementation for research
- ✅ **Issue reporting** - help improve the software

### 🛡️ **Use Requires Foundation Approval**
- ❌ **No automatic deployment rights** - production use needs permission
- ❌ **No redistribution permission** - cannot share without approval
- ❌ **No commercial use** - requires separate commercial agreement
- ❌ **No service integration** - platform use requires explicit consent

### 📋 **Request Use Permission**
**Contact:** 📧 p.styla [at] gmail [dot] com  
**Include in your request:**
- Your organization name and contact information
- Intended use case and deployment scope
- Target audience and geographic region
- Expected timeline for implementation
- Any modifications or customizations planned

**Response time:** Usually within 3-5 business days

### 💼 **Commercial Options**
Custom commercial licenses available for:
- Enterprise deployments
- Commercial service integration
- White-label solutions
- Priority support and maintenance
- Custom development and modifications

**📄 Full License:** [View Foundation Approval License 1.0](LICENSE)

## 🛡️ **Security**

Please refer to [SECURITY.md](SECURITY.md) for our security policy and responsible disclosure guidelines.

## 🎯 **Mission**

Our mission is to provide innovative technology solutions that enhance child safety and support families across Poland. This application represents our commitment to combining technology with compassionate care for children and their families.

---

*Developed with love and dedication to child safety.*  
*Fundacja na rzecz Hospicjum Maryi Królowej Apostołów w Krakowie* 💝

## ✨ Kluczowe Funkcjonalności

### 🛰️ System alertów bezpieczeństwa

- Agregacja alertów z wielu źródeł rządowych i lokalnych (`backend/data_sources.py`, `poland_locations.py`)
- Punktowy **Alert Classifier** (`frontend/alert-classifier.js`) – bezpieczniejsza klasyfikacja niż proste `if/else`
- Filtrowanie po lokalizacji (GPS, źródła wojewódzkie/miastowe)
- Upraszczanie treści i generowanie porad przy użyciu modułu AI (`backend/ai_processor.py`)

### 🧒 Interfejs przyjazny dzieciom

- Teksty pisane z myślą o dzieciach 5–16 lat
- Prosty, kontrastowy interfejs z dużymi przyciskami
- Głosowe odczytywanie komunikatów (Web Speech API, dobór profesjonalnego głosu edukacyjnego)
- Wielojęzyczność: **PL / EN / UA**

### 🔐 Zgoda rodzicielska i prywatność (RODO Art. 8)

- Moduł **Parental Consent** (`frontend/parental-consent.js`):
  - rozmycie aplikacji do czasu uzyskania zgody
  - tworzenie profilu dziecka po stronie rodzica
- **Mina ZK‑Parental Storage** (`frontend/mina-parental-zk.js`):
  - profile dzieci przechowywane w zaszyfrowanym ZK‑storage w przeglądarce
- **Enhanced Security ZK Storage** (`frontend/enhanced-security-zk.js`, `web-crypto-security.js`):
  - szyfrowanie AES‑256‑GCM, klucze per‑urządzenie
  - brak serwerowego przechowywania danych dziecka

### 👨‍👩‍👧 Parent CMS i Real Sync

- **Parent CMS** (`frontend/parent-cms.html`, `parent-cms.js`):
  - edycja komunikatów i „safety tips” dla konkretnego dziecka
  - zarządzanie profilami dzieci (`zk_family_children_profiles`)
- **Real Sync System** (`frontend/real-sync-system.js`):
  - wersjonowanie danych (DATA_VERSIONS)
  - bezpieczna, cykliczna synchronizacja danych rodzic → aplikacja dziecka
  - ochrona przed nakładającymi się syncami i pętlami nieskończonymi

### 🚨 Tryb awaryjny i PWA

- Service Worker (`frontend/sw.js`):
  - awaryjny cache numerów alarmowych i kluczowych instrukcji
  - działanie w trybie offline
- **Emergency Survival Mode** (`frontend/emergency-survival-mode.js`):
  - optymalizacja zużycia baterii w sytuacjach kryzysowych
- **Emergency Mina Integration** (`frontend/emergency-mina-integration.js`):
  - przygotowany interfejs pod lekką synchronizację blockchain (22 KB)

### 🔔 Powiadomienia Push

- Backend (`backend/push_notifications.py`, `api/vapid.py`):
  - generowanie / ładowanie kluczy VAPID
  - przechowywanie subskrypcji w pliku `backend/subscriptions.json`
- Frontend (`frontend/app.js`):
  - przycisk „Włącz powiadomienia”
  - integracja z Push API i Service Workerem

## 🏗 Architektura i Struktura Projektu

Repozytorium jest monorepo z **frontendem (PWA)** i **backendem (FastAPI)**.

### Produkcyjna architektura (split deployment)

- **Frontend (PWA)** – GitHub Pages
  - URL: `https://piotrstyla.github.io/Bezpieczny_pomocnik/`
  - statyczne pliki: `frontend/index.html`, `style.css`, `app.js`, `sw.js`, `manifest.json`
  - Uwaga: pliki są serwowane z `/docs` folder na GitHubie

- **Backend (API)** – Vercel serverless
  - URL bazowy: `https://pomocnikapp.vercel.app/api/`
  - przykładowe endpointy:
    - `GET /api/alerts` – aktualne alerty
    - `GET /api/alerts/location` – alerty dla współrzędnych (lat, lon)
    - `GET /api/vapid_public_key` – klucz publiczny VAPID
    - `POST /api/subscribe` – zapis subskrypcji push
    - `GET /api/coverage` – informacje o pokryciu źródeł
    - `GET /api/ai-config` – konfiguracja funkcji AI
    - `POST /api/audit/parental-consent` – audyt zgody rodzicielskiej (anonimowy)

### Struktura katalogów (skrót)

```
.
├── backend/
│   ├── tests/
│   ├── ai_processor.py        # Upraszczanie treści + porady
│   ├── config.py              # Konfiguracja (Pydantic Settings)
│   ├── data_sources.py        # Integracje z RCB/IMGW/miastami
│   ├── main.py                # FastAPI + harmonogram alertów
│   ├── poland_locations.py    # Mapowanie źródeł na lokalizacje
│   ├── push_notifications.py  # Web Push (VAPID, pywebpush)
│   ├── schema.py              # Modele Pydantic
│   └── requirements.txt
├── frontend/
│   ├── index.html             # Główna aplikacja dziecka
│   ├── style.css              # UI/UX
│   ├── app.js                 # Logika alertów, mapa, push
│   ├── sw.js                  # Service Worker / PWA / offline
│   ├── parent-cms.html/js     # Panel rodzica i zarządzanie treściami
│   ├── parental-consent.js    # Zgoda rodzicielska
│   ├── mina-parental-zk.js    # ZK storage dla profili dzieci
│   ├── enhanced-security-zk.js
│   ├── web-crypto-security.js # AES-256-GCM w przeglądarce
│   ├── real-sync-system.js    # Synchronizacja Parent CMS → appka dziecka
│   ├── emergency-*.js         # Tryby awaryjne (survival, Mina integration)
│   └── manifest.json
├── api/
│   ├── index.py               # Wejście dla Vercel (FastAPI)
│   └── vapid.py               # Lekkie endpointy do klucza VAPID i subskrypcji
├── .env.example               # Szablon zmiennych środowiskowych
├── DEPLOYMENT.md              # Szczegóły wdrożenia (Vercel + GitHub Pages)
└── render.yaml                # Alternatywna konfiguracja dla Render.com
```

## 🚀 Uruchomienie Lokalnie

1.  **Konfiguracja**: Skopiuj `.env.example` do `.env` i uzupełnij go wymaganymi kluczami API. Aby wygenerować klucze VAPID, uruchom jednorazowo: `python backend/push_notifications.py`.
2.  **Instalacja**: `pip install -r backend/requirements.txt`
3.  **Uruchomienie**: `uvicorn backend.main:app --reload`

Aplikacja będzie dostępna pod adresem `http://127.0.0.1:8000`.

## 🧪 Testowanie

### **Automated Frontend Testing**

**Comprehensive Test Suite** - kompletny system testów dla frontendu:

**Lokalizacja:** `frontend/comprehensive-test-suite.html`

**Pokrycie testów:**
- ✅ RODO Art. 8 compliance & parental consent
- ✅ Mina ZK storage security (AES-256-GCM)
- ✅ Parent CMS functionality
- ✅ Multi-child session management
- ✅ Service Worker & PWA
- ✅ Alert system integration
- ✅ Speech synthesis (Polish voices)
- ✅ Browser compatibility
- ✅ Performance & security context

**Jak uruchomić:**
1. Otwórz `frontend/comprehensive-test-suite.html` w przeglądarce
2. Kliknij "▶️ Uruchom wszystkie testy" lub wybierz konkretny etap (1-4)
3. Sprawdź wyniki i eksportuj raport JSON

**📊 Ostatni raport testów:** Zobacz `TEST_REPORT.md` (95% success rate, production-ready)

### **Backend Testing**

Aby uruchomić testy backendowe, przejdź do folderu `backend` i wykonaj komendę:
```bash
pytest
```

### **Manual Testing Guide**

Zobacz `TESTING-GUIDE.md` dla szczegółowego przewodnika testowania manualnego z dziećmi.

## ☁️ Wdrożenie (Deployment)

### 🚀 Vercel + GitHub Pages (Recommended) ⭐

**Architektura split deployment:**
- **Frontend**: GitHub Pages (hosting statyczny, darmowy)
- **Backend**: Vercel (serverless functions, darmowy tier)

**Zalety:**
- ✅ Zawsze dostępne (24/7)
- ✅ Auto-skalowanie serverless
- ✅ Zerowe koszty utrzymania (darmowe tiery)
- ✅ Automatyczny HTTPS
- ✅ Globalny CDN

**📖 Szczegółowa dokumentacja:** Zobacz [DEPLOYMENT.md](DEPLOYMENT.md) dla pełnego przewodnika wdrożenia.

**Szybki start:**
1. Deploy backend na Vercel (import z GitHub)
2. Włącz GitHub Pages (Settings → Pages → `/docs`)
3. Skonfiguruj API URL w `frontend/app.js`
4. Gotowe! 🎉

**Demo:** 
- Frontend: https://piotrstyla.github.io/Bezpieczny_pomocnik/
- Backend API: https://pomocnikapp.vercel.app/api/

---

### 🐳 Render.com (Alternatywa)

Aplikacja jest także przygotowana do wdrożenia na Render.com przy użyciu konfiguracji "Infrastructure as Code".

1.  **Załóż konto** na [Render.com](https://render.com/) i połącz je ze swoim kontem GitHub.
2.  W panelu Render kliknij **"New +"** i wybierz **"Blueprint"**.
3.  **Wybierz repozytorium** z kodem aplikacji. Render automatycznie wykryje i załaduje konfigurację z pliku `render.yaml`.
4.  **Dodaj zmienne środowiskowe**: W sekcji "Environment" dodaj sekrety (`OPENAI_API_KEY`, `VAPID_PRIVATE_KEY` itd.), których nie przechowujemy w repozytorium.
5.  Kliknij **"Create New Web Service"**. Render automatycznie zbuduje, skonfiguruje dysk trwały i wdroży aplikację.

Po kilku minutach Twoja aplikacja będzie dostępna publicznie pod adresem wygenerowanym przez Render.
