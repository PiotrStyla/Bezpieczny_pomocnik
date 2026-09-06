import {icon} from './icons.mjs';
import {REGIONS, LESSONS, escapeHTML as e} from './safety.mjs';
export const button = (text, action, symbol='arrow', cls='') => `<button class="button ${cls}" data-action="${action}">${text}${icon(symbol)}</button>`;
export const heading = (title, sub) => `<h1>${title}</h1><p class="subtitle">${sub}</p>`;
export function regionOptions(selected='') {
  return '<option value="">Wybierz województwo</option>' + Object.entries(REGIONS).sort((a,b)=>a[1].localeCompare(b[1],'pl')).map(([id,name])=>`<option value="${id}" ${id===selected?'selected':''}>${name}</option>`).join('');
}
const tile = (title,sub,symbol,color,action) => `<button class="action-tile ${color}" data-action="${action}"><span class="tile-icon">${icon(symbol)}</span><span><h2>${title}</h2><p>${sub}</p></span>${icon('chevron')}</button>`;
export function home(family, completed) {
  return heading('Hej! Dobrze, że jesteś.','Małe kroki. Więcej spokoju każdego dnia.') +
    `<section class="hero" aria-label="Twój pomocnik"><div class="hero-copy"><h2>Razem znajdziemy<br>dobry krok.</h2><p>Możesz poprosić o pomoc. Zawsze.</p>${button('Potrzebuję pomocy','help')}</div><img src="images/helper-fox.png" alt="Przyjazny lisek trzyma tarczę z sercem" width="1536" height="1024" fetchpriority="high"></section>
    <section class="action-grid" aria-label="Co chcesz zrobić?">
    ${tile('Kontakt z<br>bliską osobą','Ktoś, komu ufasz.','phone','peach','contacts')}
    ${tile('Nie wiem,<br>co zrobić','Przejdźmy przez to razem.','compass','lilac','help')}
    ${tile('Mała lekcja<br>na dziś','Jak rozpoznać podejrzany link?','book','yellow','lesson:link')}
    </section>
    <div class="lower-grid">
      <section class="area-card"><div class="area-symbol">${icon('home')}</div><div><h2>W mojej okolicy</h2><p class="small-status">${icon('users')} Sprawdź komunikaty z dorosłym</p><p>${family.region?'Wybrany region: '+e(REGIONS[family.region])+'.':'Wybierz region, aby sprawdzić źródła ostrzeżeń.'}</p><a class="button" href="#area">${family.region?'Sprawdź źródła':'Wybierz region'}${icon('chevron')}</a></div></section>
      <section class="progress-card"><div class="progress-ring"><strong>${completed.size} z 4</strong><span>lekcji</span></div><div><h2>Twój mały krok</h2><p>Odkrywaj w swoim tempie.<br>Bez pośpiechu.</p><div class="progress-dots" aria-hidden="true">${LESSONS.map(l=>`<span class="${completed.has(l.id)?'done':''}"></span>`).join('')}</div></div></section>
    </div>`;
}
export function area(family) {
  return heading('Sprawdźmy Twoją okolicę.','Obejrzyj komunikaty razem z dorosłym.')+
    `<section class="content-panel"><h2>Ostrzeżenia pogodowe IMGW</h2><p>Wybierz województwo. Pokażemy ostrzeżenia dla części tego regionu — dokładny obszar sprawdźcie na mapie IMGW.</p>
    <label class="field" for="region">Województwo<select id="region">${regionOptions(family.region)}</select></label>
    <p class="hint">Przycisk łączy się z IMGW, które otrzyma adres IP urządzenia. Nie wysyłamy GPS ani danych z planu. Wybrany tutaj region służy tylko temu sprawdzeniu.</p>
    ${button('Sprawdź w IMGW','refresh','cloud','primary')}<div id="alerts" role="status" aria-live="polite"><p class="notice">Nie sprawdzono jeszcze ostrzeżeń. Brak danych w aplikacji nie oznacza braku zagrożeń.</p></div>
    <div class="source-links"><a href="https://meteo.imgw.pl/" target="_blank" rel="noopener noreferrer">Mapa ostrzeżeń IMGW ↗</a><a href="https://www.gov.pl/web/rcb" target="_blank" rel="noopener noreferrer">Komunikaty RCB ↗</a></div>
    <p class="hint">Aplikacja pokazuje wyłącznie meteorologiczne ostrzeżenia IMGW. Komunikaty RCB i lokalnych służb sprawdzajcie osobno. Nie otrzymujesz tu automatycznych alarmów.</p></section>
    <section class="content-panel"><h2>A jeśli zaskoczy Cię burza?</h2><p>Trzy proste kroki możesz otworzyć także bez internetu.</p>${button('Pokaż wskazówki','guide:weather','arrow')}</section>`;
}
export function learn(completed) {
  return heading('Małe lekcje. Duża różnica.','Sprawdź, co możesz zrobić. Możesz próbować tyle razy, ile chcesz.')+
  `<div class="lesson-list">${LESSONS.map((l,i)=>`<button class="action-tile ${l.color}" data-action="lesson:${l.id}"><span class="tile-icon">${icon(l.icon)}</span><span><span class="lesson-label">${completed.has(l.id)?'Poznana · możesz wrócić':'Lekcja '+(i+1)+' · około 2 minuty'}</span><h2>${l.title}</h2><p>${completed.has(l.id)?'Powtórz w swoim tempie.':'Wybierz swój dobry krok.'}</p></span>${icon('chevron')}</button>`).join('')}</div><p class="hint">Bez punktów za szybkość, rankingów i kar za pomyłki. Postęp zostaje tylko na tym urządzeniu.</p>`;
}
export function contacts(family) {
  const entries = [[family.contactName,family.phone],[family.secondName,family.secondPhone]].filter(([,p])=>p);
  return entries.length ? entries.map(([name,phone])=>`<div class="call-card"><div><strong>${e(name||'Zaufana osoba')}</strong><p>${e(phone)}</p></div><a class="button" href="tel:${phone}">${icon('phone')}Zadzwoń</a></div>`).join('') : '<p>Nie ma jeszcze zapisanych kontaktów. Poproś opiekuna, aby dodał numer osoby, której ufasz.</p><a class="button" href="#parent">Dodajcie kontakt</a>';
}
export function plan(family) {
  return heading('Mój plan na trudną chwilę.','Ustalcie go razem. Wróć tu zawsze, kiedy potrzebujesz.')+
  `<div class="split"><section class="content-panel"><h2>Moi zaufani dorośli</h2>${contacts(family)}<p class="hint">Połączenie otwiera aplikację telefonu. Jeśli osoba nie odbiera, spróbuj kolejnej. Aplikacja nie wysyła automatycznie wiadomości.</p></section>
  <section class="content-panel"><h2>Nasze miejsce spotkania</h2><p class="plan-note">${e(family.meeting||'Ustalcie z opiekunem znane, bezpieczne miejsce na wypadek rozdzielenia.')}</p><p class="hint">Idź tam tylko wtedy, gdy droga jest bezpieczna i tak ustaliliście. Gdy się zgubisz, poproś o pomoc.</p>${button('Nie mogę znaleźć bliskich','guide:lost','pin')}</section></div>
  <section class="content-panel"><h2>Wiadomość od opiekuna</h2><p class="plan-note">${e(family.note||'Możesz powiedzieć dorosłemu, że coś Cię martwi. Nawet kiedy trudno znaleźć słowa.')}</p></section>
  <div class="row"><a class="button" href="#parent">Uzupełnijcie plan ${icon('plan')}</a>${button('Potrzebuję rozmowy','support','heart')}</div>`;
}
const field = (id,label,value,max,extra='') => `<label class="field" for="${id}">${label}<input id="${id}" name="${id}" value="${e(value)}" maxlength="${max}" ${extra}></label>`;
export function parent(family) {
  return heading('Spokojnie. Przygotujcie się razem.','Strefa opiekuna · plan dla dziecka w wieku 7–12 lat')+
  `<section class="content-panel"><h2>Mało danych, konkretna pomoc</h2><p>Ustal z dzieckiem, komu ufa i gdzie szukać pomocy. Wystarczy imię lub określenie „Ciocia”. Nie podawaj nazwiska dziecka, szkoły, dokładnego adresu domu ani danych o zdrowiu.</p><p class="notice">Plan jest zapisany w tej przeglądarce i dostępny osobie korzystającej z urządzenia, także dziecku. Nie jest szyfrowany hasłem i nie synchronizuje się z innym telefonem. Chroń urządzenie blokadą ekranu.</p></section>
  <form id="family-form" class="content-panel" autocomplete="off"><h2>Wasz plan</h2><div class="split"><div>
    ${field('contactName','Pierwsza zaufana osoba',family.contactName,40)}
    ${field('phone','Jej numer telefonu',family.phone,24,'type="tel" inputmode="tel" placeholder="np. +48 000 000 000"')}
    </div><div>${field('secondName','Druga zaufana osoba (opcjonalnie)',family.secondName,40)}
    ${field('secondPhone','Jej numer telefonu (opcjonalnie)',family.secondPhone,24,'type="tel" inputmode="tel"')}</div></div>
    <label class="field" for="family-region">Wasze województwo<select id="family-region" name="region">${regionOptions(family.region)}</select><small>Opcjonalne. Nie potrzebujemy dokładnej lokalizacji.</small></label>
    ${field('meeting','Znane miejsce spotkania (opcjonalnie)',family.meeting,180,'placeholder="np. przy informacji w bibliotece"')}
    <label class="field" for="note">Krótka wiadomość dla dziecka<textarea name="note" id="note" maxlength="300" rows="3">${e(family.note)}</textarea></label>
    <label class="check-field"><input type="checkbox" id="local-consent" required><span>Chcę zapisać ten plan na tym urządzeniu. Rozumiem, że będzie widoczny dla jego użytkowników.</span></label>
    <p id="form-error" class="error" role="alert"></p>
    <div class="row"><button class="button primary" type="submit">Zapisz plan ${icon('check')}</button><a class="button" href="#plan">Zobacz plan dziecka</a></div>
  </form>
  <section class="content-panel"><h2>Dobre przygotowanie</h2><p>Przećwiczcie rozmowę: „Co się stało? Gdzie jestem?”. Sprawdź numery kontaktów bez dzwonienia na numery alarmowe. Otwórz aplikację z internetem przed wyjściem, a potem sprawdź jej działanie offline na telefonie dziecka.</p><p id="offline-status" class="notice" role="status">Sprawdzamy gotowość kopii offline…</p><p class="hint" id="install-status">Aplikację można dodać do ekranu głównego z menu przeglądarki. Na iPhonie: Udostępnij → Do ekranu początkowego.</p><button class="button" id="install-app" data-action="install" hidden>Zainstaluj aplikację</button></section>
  <section class="content-panel"><h2>Twoja kontrola nad danymi</h2><p>Możesz usunąć plan i postęp czterech lekcji tej wersji aplikacji z tej przeglądarki.</p>${button('Usuń dane tej wersji','delete','close','delete-button')}<p class="hint">Dane wcześniejszej wersji nie są importowane ani odczytywane. Aby usunąć również je, użyj ustawień danych witryny w przeglądarce.</p><a href="#privacy">Prywatność i źródła materiałów</a></section>`;
}
export function privacy() {
  return heading('Twoja prywatność ma znaczenie.','Proste zasady, które możesz omówić z opiekunem.')+
  `<section class="content-panel"><h2>Co zostaje na urządzeniu?</h2><p>Kontakty i plan, jeśli opiekun je zapisze, oraz identyfikatory poznanych lekcji. Nie zapisujemy odpowiedzi na pytania, historii szukania pomocy, GPS, zdjęć ani nagrań. Ta wersja nie ma kont, reklam, analityki, czatu ani śledzenia.</p><h2>Kto może przeczytać plan?</h2><p>Osoba mająca dostęp do tej przeglądarki. Dane są lokalne, ale nie są szyfrowane hasłem. Strefa opiekuna nie jest uwierzytelnieniem ani blokadą rodzicielską. Użyj blokady ekranu i nie zapisuj wrażliwych informacji.</p><h2>Kiedy łączymy się z internetem?</h2><p>Przy otwieraniu aplikacji serwer hostingu otrzymuje standardowe dane połączenia, w tym IP. Dopiero kliknięcie „Sprawdź w IMGW” pobiera publiczny zbiór ostrzeżeń. IMGW otrzymuje wtedy IP, bez regionu i danych rodzinnych. Linki zewnętrzne otwierają serwisy o własnych zasadach prywatności. Link „Zadzwoń” otwiera aplikację telefonu.</p><h2>Co działa offline?</h2><p>Po pierwszym prawidłowym zapisaniu aplikacji: wskazówki, lekcje i plan. Ostrzeżenia pogodowe wymagają internetu. Numery telefonów możesz odczytać offline, ale samo połączenie zależy od urządzenia i dostępnej sieci. Przeglądarka może usunąć dane witryny, dlatego przećwiczcie też plan bez telefonu.</p><h2>Czytanie na głos</h2><p>Używamy wyłącznie głosu oznaczonego przez przeglądarkę jako lokalny. Jeśli polski głos lokalny nie jest dostępny, pokażemy komunikat. Tekst nie jest wysyłany przez aplikację do usługi syntezy mowy.</p><h2>Pomoc i materiały</h2><p>Aplikacja wspiera rozmowę i przygotowanie. Nie ocenia, czy jesteś bezpiecznie, i nie powiadamia automatycznie służb ani bliskich. W nagłym zagrożeniu życia lub zdrowia dzwoń pod 112.</p>
  <div class="source-links"><a href="https://www.gov.pl/web/numer-alarmowy-112" target="_blank" rel="noopener noreferrer">Numer alarmowy 112 ↗</a><a href="https://116111.pl/" target="_blank" rel="noopener noreferrer">Telefon zaufania 116 111 ↗</a><a href="https://www.saferinternet.pl/" target="_blank" rel="noopener noreferrer">Safer Internet: NASK i FDDS ↗</a><a href="https://www.gov.pl/web/rcb" target="_blank" rel="noopener noreferrer">Poradniki RCB ↗</a><a href="https://danepubliczne.imgw.pl/" target="_blank" rel="noopener noreferrer">Dane publiczne IMGW ↗</a></div>
  <p class="hint">Materiały edukacyjne opracowane na podstawie wskazanych źródeł. Sprawdzenie źródeł: 5 września 2026 r. Przed szerokim użyciem z dziećmi materiały powinien ocenić specjalista bezpieczeństwa dzieci.</p><p class="hint">Bezpieczny Pomocnik · projekt Piotra Styli na rzecz Fundacji na rzecz Hospicjum Maryi Królowej Apostołów w Krakowie. Zasady wykorzystania pozostają określone w licencji projektu.</p></section>`;
}
