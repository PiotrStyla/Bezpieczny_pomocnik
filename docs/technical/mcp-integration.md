# MCP w Windsurf – integracja dla Bezpiecznego Pomocnika

## Cel
Użyć MCP (Model Context Protocol) w środowisku Windsurf do:
- uzupełnienia braków (stabilne źródła alertów, sekrety, testy PWA/A11y, i18n/UTF‑8),
- przyspieszenia rozwoju (push, PDF/packi dla compliance),
- bez dotykania runtime aplikacji (MCP pomaga nam, nie jest zależnością appki).

## Zasady
- Sekrety trzymamy w Secrets/Vault MCP lub w Render env (prod). Nie commitujemy do repo.
- MCP tworzy PR/propozycje zmian – nie wdraża nic bez akceptacji.
- Po każdym merge pamiętamy o aktualizacji `/legal/` (Regulamin, Polityki) – patrz Compliance MCP.

---

## 1) Secrets/Vault MCP
- Po co: klucze do kafelków map, VAPID (push).
- Użycie: Zarządzanie sekretami poza repo, podawanie ich do tasków/PR.
- Kroki:
  1. Dodać sekrety: MAP_TILES_URL, MAP_TILES_KEY, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY.
  2. MCP generuje bezpieczne instrukcje w PR (gdzie wstrzyknąć przez Render/ENV).

Korzyść: brak .env w repo, zgodność z polityką „nie nadpisuj .env”.

---

## 2) HTTP/OpenAPI MCP
- Po co: pobieranie i normalizacja źródeł alertów (RCB RSS bez pośredników, IMGW, opcjonalnie ISOK/GIOŚ).
- Użycie: Testy endpointów (retry, ETag/Last‑Modified), porównania wydajności, generowanie klienta fetch.
- Kroki:
  1. Zdefiniować spec testowej bramki (proxy/normalizer) dla RCB/IMGW.
  2. MCP przygotowuje PR z klientem (fetch) i fallbackami do `frontend/app.js` oraz `sw.js`.

Korzyść: stabilne i ujednolicone źródła alertów.

---

## 3) Scheduler/Jobs MCP
- Po co: stałe “ticki” do sprawdzania alertów niezależnie od `periodicsync`.
- Użycie: Uruchamianie okresowych zadań w środowisku narzędziowym/Windsurf (nie w runtime appki).
- Kroki:
  1. Ustawić harmonogram (np. co 60 s dev, docelowo 30 s prod).
  2. MCP raportuje różnice/awarie źródeł.

Korzyść: większa niezawodność monitoringu w czasie developmentu/testów.

---

## 4) Compliance/GDPR MCP
- Po co: automatyczne przypomnienia i propozycje zmian `/legal/` po każdym pushu.
- Użycie: Skan diff → generuje checklistę i PR do `legal/REGULAMIN.md`, `POLITYKA_PRYWATNOSCI.md`, `POLITYKA_COOKIES.md`, `DOSTEPNOSC.md`.
- Kroki:
  1. Włączyć regułę „post‑push legal review”.
  2. MCP dodaje komentarz na PR i/lub tworzy follow‑up PR z poprawkami.

Korzyść: stała zgodność (szczególnie RODO Art. 8, 25, 32).

---

## 5) Lighthouse/Audit MCP
- Po co: automatyczny audyt PWA/Perf/A11y.
- Użycie: Uruchamiane na PR (GitHub Actions), wyniki w `docs/process/`.
- Kroki:
  1. Włączyć preset „Lighthouse CI”.
  2. MCP publikuje raport i progi (np. PWA ≥ 90, A11y ≥ 90).

Korzyść: chronimy jakość i wydajność PWA.

---

## 6) Accessibility MCP
- Po co: analiza semantyki, aria, kontrastów, dotyku (≥48dp).
- Użycie: Skan `frontend/index.html` i komponentów UI, generator poprawek.
- Kroki:
  1. Włączyć skan i auto‑PR z poprawkami (aria‑label, role, kontrast).
  2. Dodać checklistę dostępności do `docs/process/`.

Korzyść: lepsza użyteczność dla dzieci i szkół.

---

## 7) i18n/Localization MCP
- Po co: wyciągnięcie tekstów do plików `i18n/*.json`, zakończenie problemów z „??”.
- Użycie: Skan stringów w `frontend/*.js`, propozycja plików i zamian.
- Kroki:
  1. MCP generuje `i18n/pl.json` + refaktoryzację UI do czytania z i18n.
  2. Wprowadzić `.gitattributes` i `.editorconfig` (UTF‑8, LF).

Korzyść: porządek w tekstach i brak artefaktów kodowania.

---

## 8) Push/WebPush MCP
- Po co: generacja VAPID, skrypty subskrypcji, testowe wysyłki.
- Użycie: MCP przygotowuje PR: rejestracja subskrypcji w `pwa-installer.js`, obsługa w `sw.js`.
- Kroki:
  1. Wygenerować VAPID (Secrets MCP).
  2. Dodać endpoint serwerless (patrz niżej) lub symulator testowy MCP.

Korzyść: niezawodne alerty nawet przy zamkniętej aplikacji.

---

## 9) Security/SBOM MCP
- Po co: SBOM, skan zależności, generator nagłówków CSP/SRI.
- Użycie: Raport do `SECURITY_AUDIT.md`, PR z CSP do `index.html`.
- Kroki:
  1. Włączyć skan okresowy.
  2. MCP proponuje CSP/SRI (z zachowaniem działania PWA).

Korzyść: dowody audytowe bezpieczeństwa.

---

## 10) PDF/Docs MCP
- Po co: eksport `docs/project/compliance_deck.md` i `docs/project/pitch.md` do PDF.
- Użycie: Jedno polecenie w Windsurf → pliki w `docs/exports/`.
- Kroki:
  1. Skonfigurować profil eksportu (Marp/Pandoc).
  2. Automatyczny build paczki dla compliance (PDF + checklisty).

Korzyść: szybki pakiet do przekazania zespołowi compliance.

---

## Serwerless (opcjonalne)
- Zalecane: Cloudflare Workers / Render Functions wyłącznie jako bramka (proxy/normalizer) i push‑subscribe.
- Aplikacja nadal nie wysyła danych dziecka – bramka służy do pobierania alertów i obsługi push.
