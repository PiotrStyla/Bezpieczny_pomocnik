# Fixlog – 2025-10-22

- **[security]** Usunięto z repo niepotrzebne klucze `private_key.pem`/`public_key.pem`; dodane do `.gitignore`.
- **[repo hygiene]** Usunięto `node_modules/` z trakingu i dodano do `.gitignore`.
- **[VAPID]** `backend/push_notifications.py`: preferencja kluczy z ENV (`VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`), fallback: efemeryczne klucze w pamięci (dev).
- **[deps]** Pin: `fastapi==0.99.1`, `pydantic==1.10.13`, `python-dotenv==1.0.1`, `httpx==0.23.1` – naprawa niekompatybilności testów (Py 3.11).
- **[tests passing]** Poprawiono logikę:
  - `backend/main.py`: doprecyzowane dopasowanie słów kluczowych (word-boundary; wyj. „grad*”).
  - Wyłączany cache podczas `pytest` (brak zanieczyszczenia między testami).
  - Import `push_notifications` modułowo dla łatwego patchowania w testach.
- **[frontend CMS]** `frontend/parent-cms.html`: linki „Powrót/Otwórz Aplikację Dziecka” prowadzą na `/` (naprawa 404 na `/frontend/`).
- **[env]** Ujednolicenie z produkcją: lokalnie Python 3.11.9 i nowy `.venv311`.
- **[server]** Restart dev serwera po zmianach; działa na `http://127.0.0.1:8000`.
