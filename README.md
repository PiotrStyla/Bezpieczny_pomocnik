# Bezpieczny Pomocnik

"Bezpieczny Pomocnik" to aplikacja webowa (PWA) z backendem API, która pobiera, upraszcza i dystrybuuje oficjalne komunikaty bezpieczeństwa. Aplikacja jest zoptymalizowana pod kątem szybkości, stabilności i łatwości wdrożenia.

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

Aby uruchomić testy, przejdź do folderu `backend` i wykonaj komendę:
```bash
pytest
```

## ☁️ Wdrożenie na Render.com (Zalecane)

Aplikacja jest w pełni przygotowana do wdrożenia na Render.com przy użyciu konfiguracji "Infrastructure as Code".

1.  **Załóż konto** na [Render.com](https://render.com/) i połącz je ze swoim kontem GitHub.
2.  W panelu Render kliknij **"New +"** i wybierz **"Blueprint"**.
3.  **Wybierz repozytorium** z kodem aplikacji. Render automatycznie wykryje i załaduje konfigurację z pliku `render.yaml`.
4.  **Dodaj zmienne środowiskowe**: W sekcji "Environment" dodaj sekrety (`OPENAI_API_KEY`, `VAPID_PRIVATE_KEY` itd.), których nie przechowujemy w repozytorium.
5.  Kliknij **"Create New Web Service"**. Render automatycznie zbuduje, skonfiguruje dysk trwały i wdroży aplikację.

Po kilku minutach Twoja aplikacja będzie dostępna publicznie pod adresem wygenerowanym przez Render.
