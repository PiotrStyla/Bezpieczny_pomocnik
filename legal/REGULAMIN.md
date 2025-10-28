# REGULAMIN UŻYTKOWANIA APLIKACJI "BEZPIECZNY POMOCNIK"

**Obowiązuje od: 21 września 2025 r.**
**Aktualizacja 28.10.2025: EnhancedSecurityZK (IndexedDB + AES-256-GCM), Web Push (VAPID), odwrócone geokodowanie OpenStreetMap Nominatim, TTS wyłącznie po zgodzie rodzica**
**Poprzednia aktualizacja 02.10.2025: Multi-source alert fetching (RSS2JSON + AllOrigins), honest status indicator**
**Wcześniejsza: 28.09.2025: Multi-Child Architecture, Child Session Manager, enhanced child data protection**

---

## § 1. POSTANOWIENIA OGÓLNE

1.1. **Administratorem** aplikacji "Bezpieczny Pomocnik" jest **Fundacja na rzecz Hospicjum Maryi Królowej Apostołów w Krakowie** z siedzibą w Krakowie 30-404, ul. Cegielniana 6B/45, wpisana do Krajowego Rejestru Sądowego pod numerem KRS 0001063161, NIP: 6793279476, REGON: 526664276, zwana dalej **"Fundacją"**.

1.2. **Aplikacja** "Bezpieczny Pomocnik" to internetowa aplikacja przeznaczona dla dzieci i ich rodziców/opiekunów prawnych, udostępniająca informacje o alertach pogodowych, ostrzeżeniach bezpieczeństwa oraz edukację w zakresie bezpieczeństwa dzieci na terenie Polski.

1.3. **Użytkownik** to każda osoba korzystająca z Aplikacji.

1.4. **Rodzic/Opiekun** to osoba pełnoletnia sprawująca władzę rodzicielską lub opiekę prawną nad dzieckiem korzystającym z Aplikacji.

## § 2. PRZEZNACZENIE I FUNKCJONALNOŚCI

2.1. **Wersja podstawowa** Aplikacji dostępna jest bez rejestracji i obejmuje:
- Przeglądanie alertów pogodowych i ostrzeżeń bezpieczeństwa dla całej Polski
- **Multi-source Alert System** - RSS2JSON API (primary) + AllOrigins Proxy (fallback)
- **Background Alert System** - 24/7 monitoring zagrożeń nawet gdy aplikacja zamknięta
- **Periodic Background Sync** - automatyczne sprawdzanie co 90 sekund (vs 3-4h oficjalne systemy)
- **Direct RCB Integration** - bezpośrednie pobieranie z gov.pl/web/rcb/ostrzezenia-rcb-rss
- **Real-time Source Monitoring** - honest status indicator (ACTIVE/OFFLINE/DISABLED)
- **Automatyczne wykrywanie lokalizacji** (z wyraźną zgodą Użytkownika) dla wszystkich gmin, miast i województw Polski
- **Location-aware background alerts** - cache lokalizacji dla alertów lokalnych w tle
- **Inteligentne dopasowanie źródeł alertów** - krajowe (RCB, IMGW), wojewódzkie i miejskie
- **Kompletne pokrycie Polski** - 16 województw, 380 powiatów, wszystkie gminy
- **Visual monitoring dashboard** - real-time status systemu alertów z timestamp
- **Force Cache Clear Utility** - narzędzie do wymuszenia aktualizacji
- **Powiadomienia Web Push (opcjonalnie)** – wyłącznie za zgodą użytkownika (VAPID), możliwość wycofania w każdej chwili
- Edukacyjne treści o bezpieczeństwie dla dzieci
- Informacje o numerach alarmowych  
- Funkcje text-to-speech w językach polskim, angielskim i ukraińskim
- **Weryfikacja zgody rodzicielskiej** zgodna z RODO Art. 8

2.2. **Moduły rozszerzone** (planowane) będą dostępne po rejestracji Rodzica/Opiekuna i mogą obejmować dodatkowe funkcjonalności edukacyjne i personalizacyjne.

## § 3. ZASADY KORZYSTANIA

3.1. **Wiek Użytkowników:**
- Aplikacja przeznaczona jest dla dzieci w wieku 6-16 lat
- Dzieci poniżej 16. roku życia mogą korzystać z Aplikacji wyłącznie za zgodą i pod nadzorem Rodzica/Opiekuna
- Fundacja zaleca aktywny udział Rodzica/Opiekuna podczas nauki korzystania z Aplikacji

3.2. **Akceptacja Regulaminu:**
- Korzystanie z Aplikacji oznacza akceptację niniejszego Regulaminu
- W przypadku Użytkowników niepełnoletnich, akceptacji dokonuje Rodzic/Opiekun

3.3. **Zakazy:**
Użytkownikom zabrania się:
- Wykorzystywania Aplikacji w sposób niezgodny z jej przeznaczeniem
- Próby ingerencji w działanie Aplikacji lub jej zabezpieczenia
- Naruszania praw autorskich lub innych praw własności intelektualnej
- Wykorzystywania Aplikacji do działań niezgodnych z prawem

## § 4. BEZPIECZEŃSTWO DZIECI

4.1. **Ochrona prywatności:**
- Aplikacja nie zawiera funkcji komunikacji między użytkownikami
- Nie są udostępniane fora, czaty ani inne narzędzia komunikacyjne
- **Dane lokalizacyjne** są przetwarzane lokalnie w przeglądarce i NIE są przesyłane na serwery Fundacji
- **System geolokalizacji** działa wyłącznie za wyraźną zgodą i służy tylko dopasowaniu lokalnych źródeł alertów

4.1a. **Funkcja geolokalizacji:**
- **Cel:** automatyczne dopasowanie alertów do lokalizacji Użytkownika (gmina, powiat, województwo)
- **Zakres:** współrzędne GPS używane wyłącznie do identyfikacji najbliższego miasta i województwa
- **Przechowywanie:** lokalizacja zapisywana jedynie w przeglądarce Użytkownika z użyciem **EnhancedSecurityZK** (IndexedDB, szyfrowanie AES-256-GCM); dla niesensytywnych preferencji dopuszczalne localStorage
- **Bez zgody:** aplikacja korzysta z alertów ogólnopolskich (cała Polska)
- **Ze zgodą:** dodawane alerty wojewódzkie i miejskie dla lokalizacji Użytkownika
- **Możliwość wycofania:** Użytkownik może w każdej chwili wyłączyć geolokalizację
- **Odwrócone geokodowanie:** zamiana współrzędnych na nazwę miejscowości/regionu realizowana przez usługę **OpenStreetMap Nominatim** (po świadomej akcji użytkownika)

4.1b. **🚨 Funkcja offline emergency (tryb awaryjny):**
- **Cel:** zapewnienie działania aplikacji podczas katastrof naturalnych gdy brak internetu
- **Zakres:** automatyczne cache'owanie niezbędnych danych awaryjnych w przeglądarce
- **Cache zawiera:** numery alarmowe (112,997,998,999), instrukcje bezpieczeństwa, podstawowe pliki aplikacji
- **Przechowywanie:** TYLKO w cache Service Worker przeglądarki (NIE na serwerach Fundacji)
- **Aktywacja:** automatyczna gdy aplikacja wykryje brak połączenia internetowego
- **Bezpieczeństwo dzieci:** funkcja kluczowa dla ochrony życia dzieci podczas sytuacji kryzysowych
- **Zgodność RODO:** podstawa prawna - żywotny interes osoby fizycznej (art. 6 ust. 1 lit. d RODO)

4.1c. **Synteza mowy (TTS) a zgoda rodzica:**
- **Warunek uruchomienia:** TTS włącza się wyłącznie po weryfikacji zgody rodzica/opiekuna zgodnie z art. 8 RODO
- **Brak zgody:** całkowity brak dźwięku – respektujemy prywatność dziecka

4.2. **🎮 System gamifikacji (bohaterowie bezpieczeństwa):**
- **Cel:** motywacja dzieci do aktywnego uczenia się zasad bezpieczeństwa
- **Bohaterowie:** Wicher (burze), Kropla (powodzie), Płomyk (pożary) - wiek 6-12 lat
- **System XP:** punkty doświadczenia za działania edukacyjne (czytanie alertów, słuchanie porad)
- **Przechowywanie:** TYLKO lokalnie w przeglądarce dziecka (localStorage)
- **Osiągnięcia:** lokalne badges motywujące do nauki bezpieczeństwa
- **Treści:** wszystkie bohaterowie używają przyjaznego, uspokajającego języka
- **Bezpieczeństwo:** system nie zbiera danych osobowych ani nie łączy się z zewnętrznymi sieciami

4.3. **Treści edukacyjne:**
- Wszystkie treści są dostosowane do wieku dzieci
- Informacje o bezpieczeństwie są przedstawiane w sposób przystępny, bez wywoływania niepokoju
- Numery alarmowe są prezentowane z odpowiednimi instrukcjami
- Bohaterowie bezpieczeństwa używają pozytywnego wzmocnienia i gamifikacji

4.3. **🧒 Multi-Child Architecture (wsparcie dla wielu dzieci):**
- **Child Session Manager:** system rozpoznawania dziecka przy uruchomieniu aplikacji
- **Separacja danych:** każde dziecko ma własną, oddzielną przestrzeń danych (zk_*_child_${childId})
- **Family profiles:** zarządzanie profilami wszystkich dzieci w ramach jednej rodziny
- **Child-specific parent messages:** rodzice mogą tworzyć spersonalizowane komunikaty dla każdego dziecka osobno
- **Perfect isolation:** zero ryzyka mieszania danych między rodzeństwem
- **URL-based access:** możliwość bezpośredniego dostępu konkretnego dziecka (?child=anna)
- **Enhanced RODO Art. 8 compliance:** każde dziecko traktowane jako oddzielny podmiot danych
- **Security benefits:** eliminacja ryzyka przypadkowego dostępu dziecka do danych rodzeństwa

4.4. **Zgłaszanie problemów:**
Rodzice/Opiekunowie mogą zgłaszać wszelkie obawy dotyczące Aplikacji na adres: kontakt@fundacja-hospicjum.org

## § 5. ODPOWIEDZIALNOŚĆ

5.1. **Fundacja:**
- Dokłada wszelkich starań, aby informacje w Aplikacji były aktualne i rzetelne
- Nie ponosi odpowiedzialności za niewłaściwe działania i ich skutki
- Zaleca zawsze weryfikację krytycznych informacji z oficjalnymi źródłami

5.2. **Użytkownik/Rodzic/Opiekun:**
- Ponosi odpowiedzialność za sposób korzystania z Aplikacji
- Zobowiązuje się do nadzorowania dziecka podczas korzystania z Aplikacji
- Odpowiada za zabezpieczenie urządzenia przed dostępem osób niepowołanych

## § 6. DOSTĘPNOŚĆ USŁUGI

6.1. Fundacja dokłada wszelkich starań, aby Aplikacja była dostępna 24/7, jednak nie gwarantuje ciągłości działania.

6.2. Fundacja zastrzega sobie prawo do czasowego wyłączenia Aplikacji w celu przeprowadzenia prac technicznych, o czym będzie informować z odpowiednim wyprzedzeniem.

6.3. Fundacja nie ponosi odpowiedzialności za przerwy w działaniu Aplikacji wynikające z niezależnych zakłóceń u dostawców usług chmurowych, internetowych oraz innych usług technicznych świadczonych przez podmioty trzecie.

## § 7. ZMIANY REGULAMINU

7.1. Fundacja zastrzega sobie prawo do zmiany niniejszego Regulaminu.

7.2. O planowanych zmianach Użytkownicy będą informowani poprzez Aplikację z co najmniej 7-dniowym wyprzedzeniem.

7.3. Dalsze korzystanie z Aplikacji po wejściu w życie zmian oznacza akceptację nowego Regulaminu.

## § 8. POSTANOWIENIA KOŃCOWE

8.1. W sprawach nieuregulowanych niniejszym Regulaminem zastosowanie mają przepisy prawa polskiego.

8.2. Ewentualne spory będą rozstrzygane przez sądy polskie właściwe dla siedziby Fundacji.

8.3. Jeśli którekolwiek postanowienie Regulaminu zostanie uznane za nieważne, pozostałe postanowienia pozostają w mocy.

---

## 📞 KONTAKT

**Fundacja na rzecz Hospicjum Maryi Królowej Apostołów w Krakowie**  
📍 30-404 Kraków, ul. Cegielniana 6B/45  
📧 E-mail: kontakt@fundacja-hospicjum.org  
🌐 www.fundacja-hospicjum.org

---

*Regulamin został opracowany z uwzględnieniem wymogów RODO oraz szczególnej ochrony dzieci.*
