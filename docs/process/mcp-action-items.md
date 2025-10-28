# MCP – Action Items (Checklist)

## Krytyczne (najpierw)
- [ ] Enforce parental consent w `speakText()` [RODO Art. 8]
  - Plik: `frontend/app.js` → `speakText()`
  - AC: przed każdym TTS `window.ZKParentalConsent?.hasValidConsent() === true`, inaczej `return` (cisza).
- [ ] Przenieść zapisy zgód do ZK storage (EnhancedSecurityZK)
  - Plik: `frontend/parental-consent.js`
  - AC: brak `localStorage` / brak POST 404; dane przez `window.EnhancedSecurityZK.saveSecureZK('parental_consent', ...)`.
- [ ] UTF‑8 hygiene + i18n
  - Pliki: `.editorconfig`, `.gitattributes`, `frontend/index.html` (`<meta charset="UTF-8">`)
  - AC: brak “??” w UI, podstawowe i18n `i18n/pl.json`.

## MCP – wdrożenia
- [ ] Secrets/Vault MCP
  - Sekrety: `MAP_TILES_URL`, `MAP_TILES_KEY`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`
  - AC: brak sekretów w repo, instrukcje w PR.
- [ ] HTTP/OpenAPI MCP
  - Zakres: RCB RSS (direct), IMGW, (opcjonalnie ISOK/GIOŚ)
  - AC: PR z klientem fetch + fallbacki, retry, ETag/Last‑Modified.
- [ ] Scheduler/Jobs MCP
  - AC: stały „tick” alertów w dev/test (raporty w `docs/process/`).
- [ ] Compliance/GDPR MCP
  - AC: po push MCP tworzy propozycje zmian w `/legal/`.
- [ ] Lighthouse/Audit MCP
  - AC: raporty PWA/A11y/Perf na PR; progi: PWA ≥ 90, A11y ≥ 90.
- [ ] Accessibility MCP
  - AC: PR z poprawkami aria/kontrast/dotyk, checklist w `docs/process/`.
- [ ] i18n MCP
  - AC: PR z `i18n/pl.json` i refaktoryzacją widocznych stringów.
- [ ] Push/WebPush MCP
  - AC: VAPID wygenerowane, subskrypcja działa, test push dochodzi.
- [ ] Security/SBOM MCP
  - AC: `SECURITY_AUDIT.md` z aktualnym raportem, CSP w `index.html`.
- [ ] PDF/Docs MCP
  - AC: `docs/exports/pitch.pdf`, `docs/exports/compliance_deck.pdf`.

## Dodatkowe zadania
- [ ] Map tiles: przejście na dostawcę z kluczem (MapTiler/Stadia/Mapbox)
  - Plik: `frontend/parent-map-display.js`
  - AC: mapy działają bez limitów; brak naruszeń ToS.
- [ ] Push backend (serwerless)
  - Endpointy: `/push/subscribe`, `/push/send-test`
  - AC: subskrypcja i test działają; brak danych dziecka na serwerze.
