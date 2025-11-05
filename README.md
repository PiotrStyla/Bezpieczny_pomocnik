# 🛡️ Bezpieczny Pomocnik - Child Safety Application

**Created with ❤️ for children's safety by Fundacja na rzecz Hospicjum Maryi Królowej Apostołów w Krakowie**

---

## 📋 **About**

Bezpieczny Pomocnik is a comprehensive child safety application designed to help children and parents stay informed about weather alerts and safety warnings across Poland. The application features:

- 🌦️ **Real-time weather alerts and safety warnings**
- 🗣️ **Multilingual text-to-speech** (Polish, English, Ukrainian)
- 🎯 **Interactive safety education** for children
- 📞 **Emergency contact system** with smart calling
- 🗺️ **Location-based alerts** and mapping
- 👶 **Child-friendly interface** with mascot interactions

## 🏛️ **Copyright & Ownership**

**© 2025 Fundacja na rzecz Hospicjum Maryi Królowej Apostołów w Krakowie**  
**All Rights Reserved. Proprietary and Confidential.**

### 📞 **Foundation Contact**
- **Full Name:** Fundacja na rzecz Hospicjum Maryi Królowej Apostołów w Krakowie
- **Address:** 30-404 Kraków, ul. Cegielniana 6B/45
- **Email:** kontakt@fundacja-hospicjum.org
- **Website:** https://fundacja-hospicjum.org/

### 📄 **Legal Information**
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
**Contact:** 📧 kontakt@fundacja-hospicjum.org  
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

- **Agregacja Danych**: Pobiera alerty z oficjalnych źródeł (RCB) oraz stron miejskich (Warszawa, Kraków, Lublin, Białystok).
- **Przetwarzanie AI**: Upraszcza komunikaty i generuje porady przy użyciu API OpenAI.
- **Wielojęzyczność**: Obsługuje języki polski, angielski i ukraiński (PL/EN/UA).
- **Powiadomienia Push**: Proaktywnie informuje użytkowników o nowych zagrożeniach, przechowując subskrypcje w trwałej bazie danych.
- **Interfejs PWA**: Działa jako aplikacja instalowalna, z obsługą trybu offline i interaktywną mapą.
- **Wydajność i Stabilność**: Wyniki API są cachowane, a zadania w tle zarządzane przez niezawodny harmonogram.

## 🏗 Architektura i Struktura Projektu

Aplikacja jest monorepo, które zawiera backend i frontend. Backend (FastAPI) jest skonfigurowany tak, aby serwować również statyczne pliki frontendu, co upraszcza wdrożenie.

```
.
├── .github/workflows/
│   └── ci.yml              # Automatyczne testy (CI/CD)
├── backend/
│   ├── tests/
│   ├── data/               # Folder na trwałe dane (np. baza subskrypcji)
│   ├── ai_processor.py
│   ├── config.py
│   ├── data_sources.py
│   ├── main.py
│   ├── push_notifications.py
│   ├── schema.py
│   └── requirements.txt
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   ├── sw.js
│   └── manifest.json
├── .env.example            # Szablon zmiennych środowiskowych
├── Procfile                # Konfiguracja dla Heroku (alternatywa)
├── render.yaml             # Konfiguracja "Infrastruktura jako Kod" dla Render.com
└── runtime.txt             # Wersja Pythona
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
2. Włącz GitHub Pages (Settings → Pages → `/frontend`)
3. Skonfiguruj API URL w `frontend/app.js`
4. Gotowe! 🎉

**Demo:** 
- Frontend: https://piotrstyla.github.io/Bezpieczny_pomocnik/frontend/
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
