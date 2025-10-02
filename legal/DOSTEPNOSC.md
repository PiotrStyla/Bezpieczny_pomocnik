# OŚWIADCZENIE O DOSTĘPNOŚCI APLIKACJI "BEZPIECZNY POMOCNIK"

**Data opublikowania:** 19 stycznia 2025 r.  
**Data ostatniej aktualizacji:** 27 września 2025 r.
**Aktualizacja:** Background Alert System, visual monitoring dashboard, accessibility w alertach

---

## 🏛️ INFORMACJE O ORGANIZACJI

**Fundacja na rzecz Hospicjum Maryi Królowej Apostołów w Krakowie** zobowiązuje się zapewniać dostępność swojej aplikacji internetowej "Bezpieczny Pomocnik" zgodnie z polską ustawą z dnia 4 kwietnia 2019 r. o dostępności cyfrowej stron internetowych i aplikacji mobilnych podmiotów publicznych oraz stosownymi standardami międzynarodowymi.

### 📞 **Dane kontaktowe organizacji:**
- **Nazwa:** Fundacja na rzecz Hospicjum Maryi Królowej Apostołów w Krakowie
- **Adres:** 30-404 Kraków, ul. Cegielniana 6B/45  
- **E-mail:** kontakt@fundacja-hospicjum.org
- **KRS:** 0001063161

---

## ♿ STAN ZGODNOŚCI Z WYMOGAMI DOSTĘPNOŚCI

**Aplikacja "Bezpieczny Pomocnik" jest częściowo zgodna** ze standardem WCAG 2.1 na poziomie AA ze względu na wymienione poniżej niezgodności i wyłączenia.

### ✅ **ELEMENTY DOSTĘPNE:**

#### 🎨 **Percepcja (Perceivable):**
- **Kontrast kolorów:** Minimum 4.5:1 dla normalnego tekstu, 3:1 dla dużego tekstu
- **Tekst alternatywny:** Wszystkie ikony i obrazy mają opisy alt
- **Responsive design:** Aplikacja dostosowuje się do różnych rozmiarów ekranu
- **Skalowanie:** Tekst można powiększyć do 200% bez utraty funkcjonalności
- **📱 **OFFLINE ACCESS (Dostęp offline)**

✅ **ZAIMPLEMENTOWANO - dostępne od 20 września 2025:**
- **🚨 Emergency Offline Mode** - pełne funkcje awaryjne bez internetu
- **📞 Emergency Contacts** - numery alarmowe (112,997,998,999) dostępne offline
- **🛡️ Safety Instructions** - instrukcje bezpieczeństwa dla dzieci offline
- **🎯 Auto-Detection** - automatyczne przełączanie na tryb awaryjny gdy brak internetu
- **📦 Service Worker Cache** - niezbędne dane awaryjne cache'owane lokalnie
- **👶 Child-Friendly** - interfejs dostosowany do dzieci podczas sytuacji kryzysowych
- **🔊 Offline TTS** - działające czytanie na głos bez internetu (Web Speech API)
- **Progressive Web App (PWA)** - możliwość instalacji na urządzeniach

#### ⌨️ **Operacyjność (Operable):**
- **Nawigacja klawiaturą:** Wszystkie funkcje dostępne przez klawiaturę
- **Czas na reakcję:** Brak ograniczeń czasowych dla interakcji dziecka
- **Migotanie:** Brak elementów migających powyżej 3 Hz
- **Fokus:** Widoczne wskaźniki fokusa dla wszystkich elementów interaktywnych

#### 🧠 **Zrozumiałość (Understandable):**
- **Język:** Oznaczenie języka strony (pl, en, ua)
- **Proste słownictwo:** Dostosowane do wieku dzieci 6-16 lat
- **🎮 Gamification:** Bohaterowie bezpieczeństwa używają przyjaznego, zrozumiałego języka
- **Edukacyjna gamifikacja:** System XP i osiągnięć motywuje do nauki bez przytłaczania
- **Przewidywalność:** Spójna nawigacja i layout
- **Pomoc w błędach:** Jasne komunikaty o problemach

#### 🛠️ **Solidność (Robust):**
- **Kompatybilność:** Testowane z popularnymi czytnikami ekranu
- **Walidacja HTML:** Kod zgodny ze standardami W3C
- **Semantyka:** Poprawne użycie elementów HTML5
- **🚨 Background Alert Accessibility:** System alertów w tle zapewnia dostępność 24/7
  - **Browser notifications** z pełną accessibility support
  - **Vibration patterns** dla użytkowników z wadami słuchu
  - **RequireInteraction** - powiadomienia nie znikają automatycznie
  - **Screen reader compatible** - wszystkie alerty czytane przez assistive tech
  - **Visual monitoring indicators** - status system zawsze widoczny
  - **Keyboard accessible** - pełna nawigacja bez myszy
  - **High contrast support** - alerty wyróżniają się wizualnie

---

## ❌ NIEZGODNOŚCI I OGRANICZENIA

### 🔄 **Częściowe niezgodności:**

#### 1. **Mapa interaktywna (kryterium 1.1.1, 2.1.1):**
- **Problem:** Zewnętrzna biblioteka map może mieć ograniczoną dostępność
- **Rozwiązanie:** Alternatywna lista tekstowa lokalizacji
- **Termin naprawy:** Q2 2025

#### 2. **Text-to-Speech (kryterium 1.2.5):**
- **Problem:** Zależność od dostępności głosów w systemie operacyjnym
- **Rozwiązanie:** Instrukcje instalacji dodatkowych głosów
- **Status:** W trakcie optymalizacji

#### 3. **Animacje maskotki (kryterium 2.3.3):**
- **Problem:** Brak opcji wyłączenia wszystkich animacji
- **Rozwiązanie:** Dodanie przełącznika "Zmniejsz ruch"  
- **Termin:** Q1 2025

### 🚫 **Tymczasowe wyłączenia:**

#### **Treści zewnętrzne:**
- **Dane z API pogodowych:** Formatowanie zależy od źródła
- **Embeded mapy:** Ograniczona kontrola nad dostępnością bibliotek zewnętrznych

---

## 🛠️ ŚRODKI WSPIERAJĄCE DOSTĘPNOŚĆ

### 📱 **Technologie asystujące:**
Aplikacja została przetestowana z:
- **Czytniki ekranu:** NVDA, JAWS, VoiceOver, TalkBack
- **Nawigacja głosowa:** Dragon NaturallySpeaking
- **Powiększanie:** ZoomText, funkcje systemowe
- **Kontrast:** Tryby wysokiego kontrastu systemu

### ⌨️ **Skróty klawiaturowe:**
- **Tab/Shift+Tab:** Nawigacja między elementami
- **Enter/Spacja:** Aktywacja przycisków i linków
- **Escape:** Zamknięcie okien modalnych
- **Strzałki:** Nawigacja w menu i listach

### 🎯 **Ułatwienia dla dzieci:**
- **Duże obszary klikalne:** Minimum 44x44px (zgodnie z WCAG AAA)
- **Proste instrukcje:** Krok po kroku
- **Wizualne wskaźniki:** Jasne oznaczenia stanu
- **Tolerancja błędów:** Łatwe cofanie akcji

---

## 📋 PROCEDURA RAPORTOWANIA PROBLEMÓW

### 🚨 **Jak zgłosić problem z dostępnością?**

#### **E-mail:** kontakt@fundacja-hospicjum.org
**Temat:** "Dostępność - Bezpieczny Pomocnik"

#### **Poczta tradycyjna:**
Fundacja na rzecz Hospicjum Maryi Królowej Apostołów w Krakowie  
30-404 Kraków, ul. Cegielniana 6B/45  
*(z dopiskiem "Dostępność cyfrowa")*

### 📝 **Informacje potrzebne w zgłoszeniu:**
1. **URL strony** z problemem
2. **Opis problemu** - co nie działa?
3. **Używane technologie:** system operacyjny, przeglądarka, technologie asystujące
4. **Dane kontaktowe** (opcjonalnie)
5. **Preferowany sposób odpowiedzi**

### ⏰ **Czas odpowiedzi:**
- **Potwierdzenie:** Do 7 dni roboczych  
- **Odpowiedź merytoryczna:** Do 30 dni
- **Naprawa:** Zgodnie z harmonogramem (pilne problemy - do 14 dni)

---

## ⚖️ PROCEDURA EGZEKWOWANIA PRZEPISÓW

Jeśli odpowiedź na zgłoszenie nie jest satysfakcjonująca, można:

### 🏛️ **1. Złożyć skargę do:**
**Biuro Rzecznika Praw Obywatelskich**  
ul. Miodowa 52, 00-246 Warszawa  
Tel. 800 676 676  
E-mail: biuro.skarg@brpo.gov.pl

### 📧 **2. Skarga przez formularz online:**
https://www.rpo.gov.pl/dostepnosc-cyfrowa

### 📞 **3. Telefoniczna linia wsparcia:**
800 676 676 (bezpłatna, pon-pt 8:00-18:00)

---

## 📊 METODYKA BADANIA DOSTĘPNOŚCI

### 🔍 **Przeprowadzone audyty:**
- **Data ostatniego audytu:** Grudzień 2024
- **Metodyka:** WCAG-EM 1.0 (Website Accessibility Conformance Evaluation Methodology)
- **Narzędzia automatyczne:** axe-core, WAVE, Lighthouse
- **Testy manualne:** Nawigacja klawiaturą, czytniki ekranu
- **Testy użytkowników:** Z udziałem dzieci i rodziców z niepełnosprawnościami

### 🎯 **Testowane scenariusze:**
1. **Przeglądanie alertów** - nawigacja i odczytywanie
2. **Zmiana języka** - dostępność dla różnych grup językowych
3. **Funkcja lokalizacji** - alternatywy dla użytkowników z ograniczeniami
4. **Text-to-Speech** - wsparcie dla różnych potrzeb
5. **Kontakt alarmowy** - dostępność w sytuacjach kryzysowych

---

## 🔄 HARMONOGRAM POPRAW

### ⏰ **Q1 2025:**
- [ ] Dodanie przełącznika "Zmniejsz animacje"
- [ ] Poprawa kontrastów w trybie ciemnym  
- [ ] Optymalizacja dla większych czcionek (do 400%)

### ⏰ **Q2 2025:**
- [ ] Alternatywny widok mapy (lista tekstowa)
- [ ] Dodatkowe skróty klawiaturowe
- [ ] Wsparcie dla więcej czytników ekranu

### ⏰ **Q3 2025:**
- [ ] Pełny audyt dostępności z zewnętrzną firmą
- [ ] Certyfikacja zgodności WCAG 2.1 AA
- [ ] Instrukcje wideo z tłumaczeniem na język migowy

---

## 📚 ZASOBY I WSPARCIE

### 📖 **Instrukcje użytkowania:**
- [Przewodnik dostępności dla rodziców](link-do-przewodnika)
- [Konfiguracja czytników ekranu](link-do-konfiguracji)  
- [Instalacja głosów systemowych](link-do-glosow)

### 🎓 **Szkolenia zespołu:**
- Regularne szkolenia z WCAG 2.1
- Testowanie z użytkownikami z niepełnosprawnościami
- Konsultacje z ekspertami dostępności cyfrowej

### 🤝 **Partnerzy w dostępności:**
- Współpraca z organizacjami osób z niepełnosprawnościami
- Konsultacje z Fundacją Widzialni
- Testy z użytkownikami różnych technologii asystujących

---

**Data sporządzenia oświadczenia:** 19 stycznia 2025 r.  
**Osoba odpowiedzialna:** Fundacja na rzecz Hospicjum Maryi Królowej Apostołów w Krakowie  
**Kontakt w sprawach dostępności:** kontakt@fundacja-hospicjum.org

---

*To oświadczenie zostało sporządzone zgodnie z wymogami ustawy o dostępności cyfrowej oraz w oparciu o standardy WCAG 2.1 poziom AA.*
