# POLITYKA PRYWATNOŚCI APLIKACJI "BEZPIECZNY POMOCNIK"

**Zgodna z RODO | Obowiązuje od: 21 września 2025 r.**
**Aktualizacja 02.10.2025: Multi-source alert fetching (RSS2JSON API, AllOrigins Proxy), real-time source monitoring**
**Poprzednia aktualizacja 28.09.2025: Dodano Multi-Child Architecture, Child Session Manager, child-specific storage separation**

---

## § 1. ADMINISTRATOR DANYCH OSOBOWYCH

**Administratorem** Twoich danych osobowych jest:

**Fundacja na rzecz Hospicjum Maryi Królowej Apostołów w Krakowie**  
📍 30-404 Kraków, ul. Cegielniana 6B/45  
📧 E-mail: kontakt@fundacja-hospicjum.org  
🆔 KRS: 0001063161, NIP: 6793279476, REGON: 526664276

**Inspektor Ochrony Danych:** kontakt@fundacja-hospicjum.org

---

## § 2. JAKIE DANE ZBIERAMY

### 🔍 **WERSJA PODSTAWOWA (bez rejestracji):**

#### **Dane lokalizacyjne (opcjonalnie):**
- **Współrzędne geograficzne** (szerokość/długość geograficzna) - **TYLKO w przeglądarce użytkownika**
- **Identyfikacja lokalizacji:** województwo, powiat, najbliższe miasto
- **Cel:** Automatyczne dopasowanie alertów lokalnych (wojewódzkich i miejskich) 
- **Zakres pokrycia:** Wszystkie 16 województw, 380 powiatów, wszystkie gminy Polski
- **Przechowywanie:** WYŁĄCZNIE w localStorage przeglądarki (NIE na serwerach Fundacji)
- **Źródła alertów:** RCB (krajowe), IMGW (wojewódzkie), władze miejskie (lokalne)
- **Podstawa prawna:** Zgoda (art. 6 ust. 1 lit. a RODO)
- **Szczególna ochrona dzieci:** Zgodnie z art. 8 RODO - wymagana zgoda rodzica/opiekuna

#### **Preferencje użytkownika:**
- **Wybrany język** interfejsu (polski/angielski/ukraiński)  
- **Ustawienia dźwięku** (włączony/wyłączony text-to-speech)
- **Cel:** Personalizacja doświadczenia użytkownika
- **Podstawa prawna:** Prawnie uzasadniony interes (art. 6 ust. 1 lit. f RODO)

#### **🎮 Gamification System (Heroes & Achievements):**
- **Wybrany bohater** bezpieczeństwa (Wicher/Kropla/Płomyk) - TYLKO lokalnie
- **Postęp gracza** (XP, poziom, osiągnięcia) - TYLKO w localStorage przeglądarki
- **Dzienne logowania** (streak counter) - TYLKO lokalnie dla motywacji
- **Historia działań** (dla naliczania XP) - TYLKO lokalne, nie przesyłane na serwery
- **Cel:** Zwiększenie zaangażowania dzieci w naukę bezpieczeństwa przez gamifikację
- **Przechowywanie:** WYŁĄCZNIE w localStorage przeglądarki (NIE na serwerach Fundacji)
- **Podstawa prawna:** Prawnie uzasadniony interes (art. 6 ust. 1 lit. f RODO)
- **Uzasadnienie:** Motywacja dzieci do aktywnego uczenia się bezpieczeństwa

#### **Dane techniczne (automatycznie):**
- **Typ przeglądarki** i wersja
- **System operacyjny**
- **Adres IP** (anonimizowany)
- **Logi błędów** (bez danych osobowych)
- **Status połączenia** (online/offline) - TYLKO do przełączania trybu awaryjnego
- **Cel:** Zapewnienie poprawnego działania aplikacji
- **Podstawa prawna:** Prawnie uzasadniony interes (art. 6 ust. 1 lit. f RODO)

#### **🚨 Background Alert System (Service Worker):**
- **Background sync data** - cache dla okresowego sprawdzania alertów (co 90 sekund)
- **Cached location data** - ostatnia znana lokalizacja dla alertów lokalnych w tle
- **Alert notification history** - lista otrzymanych alertów (max 50, tylko ID)
- **RCB RSS feed cache** - tymczasowe przechowywanie alertów RCB z gov.pl
- **Multi-source alert data** - dane z RSS2JSON API i AllOrigins Proxy
- **Alert source status** - monitoring działania źródeł alertów (alertSourceWorking, lastSuccessfulFetch)
- **Emergency contacts cache** (112, 997, 998, 999) - TYLKO lokalnie w przeglądarce
- **Safety instructions cache** - instrukcje bezpieczeństwa dla działania offline
- **App core files cache** - HTML/CSS/JS dla działania bez internetu
- **Cel:** 24/7 monitoring zagrożeń nawet gdy aplikacja zamknięta (30s vs 3-4h oficjalne)
- **Przechowywanie:** WYŁĄCZNIE w Service Worker cache (NIE na serwerach Fundacji)
- **Częstotliwość:** Automatic background sync co 90 sekund + manual triggers
- **Źródła danych:** RCB RSS via RSS2JSON API (primary), AllOrigins Proxy (fallback)
- **Podstawa prawna:** Żywotny interes osoby fizycznej (art. 6 ust. 1 lit. d RODO)
- **Szczególne uzasadnienie:** Ochrona życia dzieci - natychmiastowe alerty vs godziny opóźnienia

#### **🧒 Multi-Child Architecture (Child Session Manager):**
- **Child Profiles** - imię dziecka, wiek (6-15 lat), unikalny identyfikator
- **Child-specific storage** - osobne przestrzenie danych dla każdego dziecka (zk_*_child_${childId})
- **Family profiles management** - zarządzanie profilami dzieci w ramach jednej rodziny
- **Child-specific parent messages** - niestandardowe komunikaty rodzica dla konkretnego dziecka
- **Session management** - automatyczne rozpoznanie dziecka przy uruchomieniu aplikacji
- **URL-based child identification** (?child=anna vs ?child=tomek)
- **Perfect data separation** - zero mixing między danymi rodzeństwa
- **Cel:** Zapewnienie że każde dziecko ma osobny, bezpieczny profil zgodny z RODO Art. 8
- **Przechowywanie:** WYŁĄCZNIE w localStorage przeglądarki rodzica (zk_family_children_profiles)
- **Separacja danych:** Każde dziecko ma własną przestrzeń zk_*_child_[unikalny_id]
- **Podstawa prawna:** Zgodność z RODO Art. 8 - ochrona danych dzieci poniżej 16 roku życia
- **Uzasadnienie krytyczne:** Brak mieszania danych między rodzeństwem - każde dziecko chronione osobno

### 👨‍👩‍👧‍👦 **MODUŁY ROZSZERZONE (planowane - po rejestracji Rodzica/Opiekuna):**

#### **Dane Rodzica/Opiekuna:**
- **Imię i nazwisko**
- **Adres e-mail**  
- **Numer telefonu** (opcjonalnie)
- **Potwierdzenie pełnoletności**
- **Cel:** Weryfikacja tożsamości i komunikacja
- **Podstawa prawna:** Umowa (art. 6 ust. 1 lit. b RODO)

#### **Dane dziecka (za zgodą Rodzica/Opiekuna):**
- **Imię** (bez nazwiska)
- **Wiek** lub rok urodzenia
- **Preferencje edukacyjne**
- **Cel:** Personalizacja treści edukacyjnych
- **Podstawa prawna:** Zgoda Rodzica/Opiekuna (art. 6 ust. 1 lit. a + art. 8 RODO)

#### **🔗 Emergency Blockchain Features (Mina Protocol):**
- **Zero-Knowledge Proofs (zk-SNARKs)** - weryfikacja wieku dziecka BEZ ujawniania dokładnych danych
- **22KB Blockchain Sync** - minimalna synchronizacja w sytuacjach kryzysowych  
- **Emergency Mode Data** - cache danych ratunkowych (numery alarmowe, lokalizacje schronień)
- **Offline Emergency Cache** - lokalne przechowywanie krytycznych informacji bezpieczeństwa
- **Cel:** Maksymalny poziom prywatności i bezpieczeństwa dzieci podczas kryzysu
- **Podstawa prawna:** Żywotny interes osoby fizycznej + ochrona dzieci (art. 6 ust. 1 lit. d + art. 8 RODO)
- **Szczególne cechy:** 
  - NIE przechowujemy kluczy prywatnych blockchain
  - NIE zapisujemy żadnych danych dziecka w blockchain
  - zk-proof NIE ujawnia tożsamości dziecka
  - Wszystkie dane blockchain są anonimowe i nieodwracalne

---

## § 3. SZCZEGÓLNA OCHRONA DZIECI (ART. 8 RODO)

### 👶 **Dla dzieci poniżej 16. roku życia:**

1. **Zgoda Rodzica/Opiekuna** jest wymagana do przetwarzania jakichkolwiek danych osobowych dziecka
2. **Weryfikacja zgody** odbywa się poprzez:
   - Potwierdzenie adresu e-mail Rodzica/Opiekuna
   - Oświadczenie o sprawowaniu władzy rodzicielskiej/opieki prawnej
3. **Minimalizacja danych** - zbieramy tylko niezbędne informacje
4. **Bezpieczne przechowywanie** z dodatkowymi zabezpieczeniami
5. **Prawo cofnięcia zgody** w każdym czasie przez Rodzica/Opiekuna

### 🛡️ **Środki bezpieczeństwa dla dzieci:**
- Brak funkcji komunikacji z innymi użytkownikami
- Brak zbierania danych wrażliwych
- Regularne audyty bezpieczeństwa
- Szyfrowanie wszystkich przekazywanych danych

---

## § 4. CEL I SPOSÓB PRZETWARZANIA

| **Dane** | **Cel przetwarzania** | **Podstawa prawna** | **Okres przechowywania** |
|----------|----------------------|-------------------|------------------------|
| Lokalizacja | Wyświetlanie lokalnych alertów | Zgoda | Do cofnięcia zgody |
| Preferencje językowe | Personalizacja interfejsu | Prawnie uzasadniony interes | 12 miesięcy nieaktywności |
| Dane techniczne | Zapewnienie działania app | Prawnie uzasadniony interes | 12 miesięcy |
| Dane Rodzica/Opiekuna | Weryfikacja i komunikacja | Umowa | Do usunięcia konta + 3 lata |
| Dane dziecka | Personalizacja edukacji | Zgoda Rodzica/Opiekuna | Do cofnięcia zgody |

---

## § 5. PRZEKAZYWANIE DANYCH

### 🌐 **Podmioty zewnętrzne:**

#### **GitHub Pages (hosting):**
- **Dane:** Statyczne pliki aplikacji (HTML/CSS/JS)
- **Lokalizacja:** CDN globalny GitHub
- **Zabezpieczenia:** HTTPS, TLS 1.3, GitHub SLA 99.9%

#### **RSS2JSON API (api.rss2json.com):**
- **Dane:** Zapytania o feed RCB RSS (bez danych osobowych użytkownika)
- **Lokalizacja:** USA/EU
- **Cel:** Konwersja RSS do JSON dla alertów bezpieczeństwa
- **Zabezpieczenia:** HTTPS, brak logowania danych użytkownika

#### **AllOrigins Proxy (api.allorigins.win):**
- **Dane:** Zapytania o feed RCB RSS (bez danych osobowych użytkownika)
- **Lokalizacja:** USA/EU
- **Cel:** Fallback proxy dla alertów gdy RSS2JSON niedostępny
- **Zabezpieczenia:** HTTPS, brak logowania danych użytkownika

#### **OpenAI (planowane - API tłumaczeń):**
- **Dane:** Teksty do tłumaczenia (bez danych osobowych)
- **Lokalizacja:** USA
- **Zabezpieczenia:** Zgodnie z polityką prywatności OpenAI

#### **Nie przekazujemy danych do:**
- ❌ Firm reklamowych
- ❌ Brokerów danych  
- ❌ Mediów społecznościowych
- ❌ Podmiotów komercyjnych

---

## § 6. TWOJE PRAWA (RODO)

### ✅ **Masz prawo do:**

1. **Dostępu** do swoich danych - napisz na kontakt@fundacja-hospicjum.org
2. **Sprostowania** niepoprawnych danych
3. **Usunięcia** danych ("prawo do bycia zapomnianym")
4. **Ograniczenia** przetwarzania  
5. **Przenoszenia** danych (w formacie JSON)
6. **Sprzeciwu** wobec przetwarzania
7. **Cofnięcia zgody** w każdym czasie (nie wpływa na już dokonane przetwarzanie)

### 📞 **Jak skorzystać z praw:**
- **E-mail:** kontakt@fundacja-hospicjum.org
- **Czas odpowiedzi:** Do 30 dni

### ⚖️ **Skarga do UODO:**
Masz prawo wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych (UODO) jeśli uważasz, że przetwarzanie narusza RODO.

---

## § 7. BEZPIECZEŃSTWO DANYCH

### 🔒 **Środki techniczne:**
- **Szyfrowanie TLS 1.3** wszystkich połączeń
- **Haszowanie** wrażliwych danych
- **Regularne kopie zapasowe** z szyfrowaniem
- **Monitoring bezpieczeństwa** 24/7
- **Dwuskładnikowe uwierzytelnianie** dla administratorów

### 🛡️ **Środki organizacyjne:**
- **Szkolenia** personelu z zakresu RODO
- **Audyty** bezpieczeństwa co 6 miesięcy
- **Procedury** reagowania na naruszenia
- **Ograniczony dostęp** tylko dla uprawnionych osób

---

## § 8. COOKIES I TECHNOLOGIE ŚLEDZĄCE

### 🍪 **Używane cookies:**

#### **Niezbędne (bez zgody):**
- **Preferencje językowe** (localStorage)
- **Ustawienia dostępności** (localStorage)
- **Sesja techniczna** (brak danych osobowych)

#### **Analityczne (planowane - z zgodą):**
- **Statystyki użytkowania** (anonimowe)
- **Optymalizacja wydajności**

### ⚙️ **Jak zarządzać cookies:**
- **Ustawienia przeglądarki** - możesz wyłączyć cookies
- **Banner zgody** - możesz wybrać kategorie
- **Brak wpływu na funkcjonalność** podstawową aplikacji

---

## § 9. ZMIANY POLITYKI PRYWATNOŚCI

1. **O zmianach** informujemy z 14-dniowym wyprzedzeniem
2. **Powiadomienie** poprzez aplikację i e-mail (jeśli podany)
3. **Istotne zmiany** wymagają ponownej zgody
4. **Historia zmian** dostępna na żądanie

---

## § 10. KONTAKT W SPRAWACH PRYWATNOŚCI

### 📧 **Inspektor Ochrony Danych:**
E-mail: kontakt@fundacja-hospicjum.org  
Temat: "RODO - Bezpieczny Pomocnik"

### 📋 **Zgłaszanie naruszeń:**
W przypadku podejrzenia naruszenia danych osobowych prosimy o natychmiastowy kontakt na adres e-mail: kontakt@fundacja-hospicjum.org

---

**Ostatnia aktualizacja:** 2 października 2025 r.  
**Wersja:** 1.3 (Multi-source alerts, honest status monitoring)

*Ta polityka została opracowana zgodnie z RODO oraz uwzględnia szczególne wymogi ochrony danych dzieci poniżej 16. roku życia.*
