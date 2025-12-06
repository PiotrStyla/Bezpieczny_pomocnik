# POLITYKA COOKIES APLIKACJI "BEZPIECZNY POMOCNIK"

**Obowiązuje od: 21 września 2025 r.**
**Aktualizacja 28.10.2025: EnhancedSecurityZK (IndexedDB + AES-256-GCM), Web Push (VAPID) – nie są cookies, reverse geocoding OpenStreetMap Nominatim**
**Poprzednia aktualizacja 02.10.2025: Multi-source alert fetching, real-time source monitoring, honest status tracking**
**Wcześniejsza: 27.09.2025: Dodano Background Alert System, periodic sync, RCB monitoring**

---

## 🍪 CZYM SĄ COOKIES?

**Cookies** to małe pliki tekstowe przechowywane w Twojej przeglądarce podczas korzystania z naszej aplikacji. Umożliwiają nam zapamiętanie Twoich preferencji i poprawę funkcjonowania aplikacji.

---

## 📋 JAKIE COOKIES UŻYWAMY?

### ✅ **COOKIES/PRZECHOWYWANIE NIEZBĘDNE** *(nie wymagają zgody)*

| **Nazwa** | **Cel** | **Czas życia** | **Typ** |
|-----------|---------|----------------|---------|
| `lang_preference` | Zapamiętanie wybranego języka (PL/EN/UA) | 12 miesięcy | localStorage / EnhancedSecurityZK |
| `speech_enabled` | Ustawienie włączenia/wyłączenia głosu | 12 miesięcy | localStorage / EnhancedSecurityZK |
| `location_consent` | Zgoda na lokalizację | Do cofnięcia | localStorage |
| `cookie_consent` | Status zgody na cookies | 12 miesięcy | localStorage |
| **🎮 GAMIFICATION** | **System bohaterów i osiągnięć** | **Do usunięcia** | **localStorage** |
| `bezpieczny_pomocnik_progress` | Postęp gracza: XP, poziom, osiągnięcia, bohater | Do ręcznego usunięcia | localStorage |
| `hero_selection_data` | Wybrany bohater bezpieczeństwa | Do ręcznego usunięcia | localStorage |
| `daily_achievements` | Dzienne osiągnięcia i streaki | Do ręcznego usunięcia | localStorage |
| **🚨 BACKGROUND ALERT SYSTEM** | **System alertów w tle** | **Cache lifetime** | **Service Worker** |
| `emergency-data/user-location` | Cache ostatniej lokalizacji dla alertów | Cache przeglądarki | Service Worker |
| `emergency-data/notified-alerts` | Historia otrzymanych alertów (max 50 ID) | Cache przeglądarki | Service Worker |
| `emergency-data/rcb-rss-cache` | Tymczasowy cache alertów RCB RSS | 1 godzina | Service Worker |
| `alert_monitoring_status` | Status systemu monitorowania alertów | Sesja | localStorage |
| `alert_source_working` | Status działania źródła alertów (true/false) | Sesja | localStorage |
| `last_successful_fetch` | Timestamp ostatniego udanego pobrania alertów | Sesja | localStorage |
| `rss2json_api_status` | Status RSS2JSON API | Sesja | localStorage |
| `allorigins_proxy_status` | Status AllOrigins Proxy | Sesja | localStorage |
| `location_settings` | Ustawienia lokalizacji z Parent CMS | Do zmiany | localStorage |
| **🚨 EMERGENCY CACHE** | **Cache awaryjnych danych offline** | **Do usunięcia cache** | **Service Worker** |
| `emergency_contacts` | Numery alarmowe (112,997,998,999) offline | Cache przeglądarki | Service Worker |
| `safety_instructions` | Instrukcje bezpieczeństwa offline | Cache przeglądarki | Service Worker |
| `offline_app_core` | Podstawowe pliki aplikacji | Cache przeglądarki | Service Worker |

**Dlaczego są niezbędne?** 
- Bez tych cookies aplikacja nie mogłaby zapamiętać Twoich podstawowych ustawień
- Są konieczne do prawidłowego funkcjonowania aplikacji dla dzieci

### 📊 **COOKIES ANALITYCZNE** *(planowane - wymagają zgody)*

| **Nazwa** | **Cel** | **Czas życia** | **Dostawca** |
|-----------|---------|----------------|--------------|
| `usage_stats` | Anonimowe statystyki użytkowania | 13 miesięcy | Fundacja |
| `error_tracking` | Śledzenie błędów (bez danych osobowych) | 6 miesięcy | Fundacja |
| `performance_metrics` | Optymalizacja wydajności | 3 miesiące | Fundacja |

**Cel:** Poprawa jakości aplikacji i bezpieczeństwa dla dzieci

### ❌ **CZEGO NIE UŻYWAMY:**

- 🚫 **Cookies reklamowe** - chronimy dzieci przed reklamami
- 🚫 **Cookies mediów społecznościowych** - brak śledzenia przez Facebook, Google itp.
- 🚫 **Cookies marketingowe** - nie profilujemy użytkowników
- 🚫 **Cookies zewnętrznych firm** - pełna kontrola nad danymi

---

## ⚙️ JAK ZARZĄDZAĆ COOKIES?

### 🎛️ **W naszej aplikacji:**
1. **Banner zgody** - wybierz kategorie cookies przy pierwszym wejściu
2. **Ustawienia prywatności** - zmień zgody w każdej chwili
3. **Wyczyść dane** - usuń wszystkie zapisane preferencje

### 🌐 **W przeglądarce:**

#### **Google Chrome:**
1. Menu → Ustawienia → Prywatność i bezpieczeństwo → Pliki cookie
2. Wybierz "Usuń pliki cookie i dane witryn" lub "Zablokuj pliki cookie"

#### **Mozilla Firefox:**
1. Menu → Ustawienia → Prywatność i bezpieczeństwo
2. Sekcja "Ciasteczka i dane stron" → Zarządzaj danymi

#### **Safari:**
1. Preferencje → Prywatność → Zarządzaj danymi stron internetowych

#### **Microsoft Edge:**
1. Menu → Ustawienia → Pliki cookie i uprawnienia witryn

### 📱 **Na urządzeniach mobilnych:**
- **Android:** Ustawienia przeglądarki → Prywatność → Pliki cookie
- **iOS:** Ustawienia → Safari → Prywatność i bezpieczeństwo

---

## 👶 SPECJALNA OCHRONA DZIECI

### 🛡️ **Nasze zobowiązania:**
- **Minimalizacja danych** - tylko niezbędne cookies dla funkcjonalności
- **Brak śledzenia** - zero cookies marketingowych lub reklamowych
- **Przejrzystość** - jasne informacje dostosowane do wieku dziecka
- **Kontrola rodziców** - rodzice mogą zarządzać wszystkimi ustawieniami

### 👨‍👩‍👧‍👦 **Dla rodziców/opiekunów:**
- Możecie w każdej chwili wyłączyć wszystkie cookies (poza niezbędnymi)
- Aplikacja będzie działać poprawnie nawet z wyłączonymi cookies analitycznymi
- Zalecamy regularne sprawdzanie ustawień prywatności

---

## 🔄 LOCAL STORAGE / ENHANCEDSECURITYZK VS COOKIES

### 📦 **EnhancedSecurityZK (IndexedDB + AES-256-GCM)** *(preferujemy)*:
- **Bezpieczniejsze** – szyfrowanie po stronie przeglądarki, izolowany origin
- **Kontrola użytkownika** – dane kasowane wraz z danymi przeglądarki
- **Zastosowanie** – ustawienia aplikacji, dane dzieci (tylko lokalnie)

### 📦 **Local Storage** *(ograniczamy do niesensytywnych preferencji)*:
- Nie jest szyfrowany – używany tylko dla mniej wrażliwych ustawień i jako fallback

### 🍪 **Tradycyjne Cookies** *(ograniczone użycie)*:
- Tylko dla sesji technicznych
- Brak danych osobowych
- Automatyczne wygasanie

---

## ⚖️ PODSTAWA PRAWNA

### 📜 **Zgodnie z prawem UE:**
- **Dyrektywa ePrivacy** - wymaga zgody na cookies analityczne
- **RODO** - ochrona danych osobowych (jeśli cookies zawierają takie dane)
- **Ustawa o świadczeniu usług drogą elektroniczną** - polskie przepisy

### 👶 **Szczególne przepisy dla dzieci:**
- **Art. 8 RODO** - zgoda rodzica/opiekuna dla dzieci poniżej 16 lat
- **Dyrektywa o Usługach Cyfrowych** - dodatkowe środki ochrony dzieci

---

## 🔔 POWIADOMIENIA WEB PUSH (NIE SĄ COOKIES)

- **Zakres:** subskrypcja Web Push w przeglądarce (endpoint + klucze `p256dh`, `auth`)
- **Podstawa:** wyłączna zgoda użytkownika; można w każdej chwili wycofać (anulować subskrypcję)
- **Cel:** krytyczne powiadomienia bezpieczeństwa
- **Przechowywanie:** endpoint i klucze po stronie Fundacji tylko w celu dostarczenia powiadomień
- **Prywatność:** brak powiązania z profilem dziecka; treść szyfrowana end-to-end przez przeglądarkę

---

## 🗺️ ODWRÓCONE GEOKODOWANIE (OpenStreetMap Nominatim)

- **Co to jest:** zamiana współrzędnych GPS na nazwę miejscowości/regionu
- **Kiedy:** tylko po świadomej akcji użytkownika („Gdzie jestem?”)
- **Prywatność:** zapytanie wysyłane przez przeglądarkę; nie łączymy z innymi danymi użytkownika

---

## 🔄 ZMIANY W POLITYCE COOKIES

### 📢 **Jak informujemy o zmianach:**
1. **Banner informacyjny** w aplikacji (7 dni wcześniej)
2. **E-mail** do zarejestrowanych rodziców/opiekunów
3. **Aktualizacja na stronie** z datą ostatniej zmiany

### ✅ **Twoje prawa przy zmianach:**
- Możesz cofnąć zgodę w każdym czasie
- Istotne zmiany wymagają ponownej zgody
- Dalsze korzystanie = akceptacja zmian (dla cookies niezbędnych)

---

## 📞 KONTAKT

### 🤔 **Pytania o cookies?**
📧 E-mail: p.styla [at] gmail [dot] com  
👤 Administrator: Piotr Styla  
💻 GitHub: github.com/PiotrStyla

### 🛠️ **Problemy techniczne z cookies?**
Opisz problem podając:
- Typ i wersję przeglądarki
- System operacyjny  
- Opis sytuacji
- Screenshots (jeśli możliwe)

---

## 🔗 PRZYDATNE LINKI

- 📋 [Regulamin użytkowania](./REGULAMIN.md)
- 🔒 [Polityka prywatności](./POLITYKA_PRYWATNOSCI.md)  
- 🛡️ [Informacje o bezpieczeństwie](./SECURITY.md)
- 🌐 **Strona Fundacji:** https://fundacja-hospicjum.org/

---

**Ostatnia aktualizacja:** 28 października 2025 r.  
**Wersja:** 1.1

*Polityka cookies została opracowana z myślą o maksymalnej ochronie prywatności dzieci i przejrzystości dla rodziców/opiekunów.*
