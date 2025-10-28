# Postępy – 2025-10-22

- **[środowisko]** Ujednolicenie z produkcją: zainstalowano Python 3.11.9 i utworzono `.venv311`.
- **[zależności]** Ustalone wersje: `fastapi==0.99.1`, `pydantic==1.10.13`, `python-dotenv==1.0.1`, `httpx==0.23.1` (zgodne z Pydantic v1 i Starlette 0.27).
- **[testy]** Poprawki logiki i środowiska testowego; łącznie: 14/14 testów przechodzi.
- **[powiadomienia]** `backend/push_notifications.py`: preferencja kluczy VAPID z ENV; bez nich generowane są efemeryczne klucze w pamięci (dev).
- **[bezpieczeństwo repo]** Usunięto z trakingu: `private_key.pem`, `public_key.pem`, `node_modules/`; zaktualizowano `.gitignore`.
- **[backend]** `backend/main.py`: doprecyzowanie klasyfikacji słów kluczowych (np. „grad*”), wyłączenie cache w trakcie pytest, poprawione referencje do `push_notifications` dla łatwiejszego mockowania.
- **[frontend/CMS]** `frontend/parent-cms.html`: przyciski „Powrót/Otwórz Aplikację Dziecka” kierują na `/` (wcześniej `/frontend/` dawało 404).
- **[serwer dev]** Uruchomiony na `http://127.0.0.1:8000`.

## Zmienione pliki (wybór)
- `backend/requirements.txt`
- `backend/main.py`
- `backend/push_notifications.py`
- `.gitignore`
- `frontend/parent-cms.html`

## Postępy – 2025-10-28

- **[legal/RODO]** Uaktualniono dokumenty prawne zgodnie z ostatnimi zmianami w aplikacji:
  - `legal/POLITYKA_PRYWATNOSCI.md`: EnhancedSecurityZK (IndexedDB + AES-256-GCM), Web Push (VAPID), Nominatim, TTS tylko po zgodzie rodzica.
  - `legal/REGULAMIN.md`: doprecyzowanie geolokalizacji (EnhancedSecurityZK), TTS z wymaganą zgodą (Art. 8 RODO), powiadomienia Web Push jako opcjonalne.
  - `legal/POLITYKA_COOKIES.md`: sekcje o Web Push (nie są cookies), Nominatim; preferencja EnhancedSecurityZK nad localStorage.
  - `legal/DOSTEPNOSC.md`: poprawki dostępności – weryfikacja offline przed trybem awaryjnym, poprawna detekcja baterii, czytelne dymki mapy, fallback adresu „okolicy”, TTS tylko po zgodzie.
- **[frontend UX]** Usunięto prefiks „??” z dymków i komunikatów mapy; zawsze przyjazny opis lokalizacji po kliknięciu „Gdzie jestem?”.

## Zmienione pliki (wybór)
- `legal/POLITYKA_PRYWATNOSCI.md`
- `legal/REGULAMIN.md`
- `legal/POLITYKA_COOKIES.md`
- `legal/DOSTEPNOSC.md`
