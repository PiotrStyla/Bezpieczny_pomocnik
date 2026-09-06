export const REGIONS = {
  '02':'dolnośląskie','04':'kujawsko-pomorskie','06':'lubelskie','08':'lubuskie',
  '10':'łódzkie','12':'małopolskie','14':'mazowieckie','16':'opolskie',
  '18':'podkarpackie','20':'podlaskie','22':'pomorskie','24':'śląskie',
  '26':'świętokrzyskie','28':'warmińsko-mazurskie','30':'wielkopolskie','32':'zachodniopomorskie'
};
export const STORAGE_KEY = 'bp.v2.family';
export const PROGRESS_KEY = 'bp.v2.lessons';
export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function normalizePhone(value) {
  const phone = String(value || '').replace(/[\s()-]/g, '');
  return /^\+?[0-9]{9,15}$/.test(phone) ? phone : '';
}
export function sanitizeFamily(value) {
  const text = (v, n) => typeof v === 'string' ? v.trim().slice(0, n) : '';
  return {
    region: Object.hasOwn(REGIONS, value?.region) ? value.region : '',
    contactName: text(value?.contactName, 40), phone: normalizePhone(value?.phone),
    secondName: text(value?.secondName, 40), secondPhone: normalizePhone(value?.secondPhone),
    meeting: text(value?.meeting, 180), note: text(value?.note, 300)
  };
}
export function loadFamily(storage) {
  try { return sanitizeFamily(JSON.parse(storage.getItem(STORAGE_KEY) || '{}')); }
  catch { return sanitizeFamily({}); }
}
// IMGW timestamps use Polish civil time; do not use the device timezone.
export function warsawTime(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) return NaN;
  const civil = Date.parse(value.replace(' ', 'T') + 'Z');
  if (!Number.isFinite(civil)) return NaN;
  const formatter = new Intl.DateTimeFormat('en-GB', {timeZone:'Europe/Warsaw', year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
  let guess = civil;
  for (let i = 0; i < 3; i++) {
    const p = Object.fromEntries(formatter.formatToParts(guess).map(x => [x.type,x.value]));
    const displayed = Date.parse(`${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}Z`);
    guess += civil - displayed;
  }
  return guess;
}
export function parseWarnings(data, region, now = Date.now()) {
  // IMGW also uses this exact documented-by-live-response empty-product shape.
  if (data?.status === false && data?.message === 'No products were found') data = [];
  if (!Array.isArray(data) || data.length > 2000 || !Object.hasOwn(REGIONS, region)) throw new Error('Nieprawidłowy format danych');
  const warnings = [];
  for (const item of data) {
    if (!item || typeof item !== 'object') throw new Error('Niepełne dane IMGW');
    const start = warsawTime(item.obowiazuje_od), end = warsawTime(item.obowiazuje_do);
    if (!Array.isArray(item.teryt) || !item.teryt.every(t => typeof t === 'string' && /^\d{4}$/.test(t)) || !Number.isFinite(start) || !Number.isFinite(end) || end <= start || !['1','2','3'].includes(String(item.stopien)) || typeof item.nazwa_zdarzenia !== 'string' || typeof item.tresc !== 'string') throw new Error('Niepełne dane IMGW');
    if (end > now && item.teryt.some(t => t.startsWith(region))) warnings.push({
      title:item.nazwa_zdarzenia.slice(0,160), content:item.tresc.slice(0,4000), level:Number(item.stopien), start,end, upcoming:start>now
    });
  }
  return warnings.sort((a,b) => b.level-a.level || a.start-b.start);
}
export function parseWarningResponse(status, data, region, now = Date.now()) {
  const empty = data?.status === false && data?.message === 'No products were found';
  // IMGW returns HTTP 404, not HTTP 200, when its current product set is empty.
  // Only this exact response is accepted; other 404/5xx remain unavailable.
  if (status !== 200 && !(status === 404 && empty)) throw new Error('Źródło jest niedostępne');
  return parseWarnings(data, region, now);
}
export const LESSONS = [
  {id:'link',icon:'lock',color:'peach',title:'Podejrzany link',intro:'Wiadomość obiecuje darmową nagrodę w grze. Wystarczy kliknąć i podać hasło.',question:'Jaki będzie Twój pierwszy krok?',answers:['Kliknę, zanim nagroda zniknie.','Pokażę wiadomość zaufanej osobie dorosłej.','Wyślę link kolegom.'],correct:1,explanation:'Zatrzymaj się i sprawdź wiadomość z dorosłym. Hasła i kody logowania są prywatne. Nawet wiadomość od znajomego może pochodzić z przejętego konta.'},
  {id:'secret',icon:'users',color:'lilac',title:'Tajemnica, która niepokoi',intro:'Ktoś poznany w grze prosi o zdjęcie i mówi: „Nie mów o tym nikomu”.',question:'Co możesz zrobić?',answers:['Przerwę rozmowę i powiem zaufanemu dorosłemu.','Wyślę zdjęcie, żeby nie było mu przykro.','Podam swój adres.'],correct:0,explanation:'Możesz odmówić i zakończyć rozmowę. Jeśli coś Cię niepokoi, powiedz dorosłemu. Nawet jeśli już coś wysłałeś lub wysłałaś, możesz dostać pomoc. To nie Twoja wina.'},
  {id:'ai',icon:'compass',color:'sage',title:'Czy to na pewno prawda?',intro:'Film wygląda prawdziwie, a głos brzmi jak głos kogoś bliskiego. Prosi o pilne wysłanie pieniędzy. Obrazy i głosy można dziś tworzyć przy użyciu AI.',question:'Jak to sprawdzić?',answers:['Uwierzę, bo rozpoznaję głos.','Przekażę wiadomość dalej.','Sprawdzę z dorosłym, dzwoniąc na znany wcześniej numer.'],correct:2,explanation:'Znajomy głos lub obraz nie wystarcza, żeby zaufać prośbie. Sprawdź ją inną, znaną drogą. Nie korzystaj z numeru ani linku podanego w podejrzanej wiadomości.'},
  {id:'bullying',icon:'heart',color:'yellow',title:'Kiedy słowa ranią',intro:'Na grupie ktoś pisze przykre rzeczy o Tobie albo o innej osobie.',question:'Co pomoże?',answers:['Odpiszę czymś jeszcze gorszym.','Poproszę dorosłego o pomoc i razem zgłosimy wiadomość.','Będę to znosić w ciszy.'],correct:1,explanation:'Nie musisz radzić sobie z tym samodzielnie. Dorosły pomoże zgłosić i zablokować sprawcę oraz zachować potrzebne dowody. Jeśli pierwsza osoba nie pomoże, poszukaj kolejnej.'}
];
export const GUIDES = {
  lost:{title:'Nie mogę znaleźć bliskich',icon:'pin',steps:['Zatrzymaj się w bezpiecznym miejscu. Nie wybiegaj na ulicę i nie szukaj drogi na własną rękę.','Zadzwoń do zaufanej osoby. Powiedz, co widzisz: nazwę sklepu, ulicę lub charakterystyczne miejsce.','Poproś o pomoc pracownika sklepu, ochronę lub policjanta. Nie odchodź z nieznajomą osobą w ustronne miejsce.']},
  online:{title:'Coś w internecie mnie niepokoi',icon:'lock',steps:['Przerwij rozmowę. Nie klikaj kolejnych linków, nie wysyłaj zdjęć, pieniędzy ani haseł.','Pokaż sytuację zaufanej osobie dorosłej. Możesz powiedzieć: „Potrzebuję pomocy z czymś w internecie”.','Razem zdecydujcie o zgłoszeniu i zablokowaniu tej osoby. Nie przesyłaj dalej intymnych zdjęć. Nawet jeśli już coś wysłałeś lub wysłałaś, zasługujesz na pomoc.']},
  unsafe:{title:'Ktoś mnie krzywdzi lub straszy',icon:'users',steps:['Jeśli możesz, przejdź w bezpieczne miejsce, blisko innych ludzi.','Powiedz zaufanej osobie dorosłej: „Nie czuję się bezpiecznie. Potrzebuję pomocy”. Może to być nauczyciel, sąsiad lub inny opiekun.','Jeśli ten dorosły Cię krzywdzi albo nie pomaga, zwróć się do innej osoby lub zadzwoń pod 116 111. W bezpośrednim zagrożeniu dzwoń pod 112.']},
  weather:{title:'Zaskoczyła mnie burza',icon:'cloud',steps:['Powiedz dorosłemu, że potrzebujesz bezpiecznego schronienia. Wejdźcie do solidnego budynku, jeśli możecie bezpiecznie do niego dotrzeć.','Odejdź od wody. Nie chowaj się pod drzewami ani w pobliżu metalowych ogrodzeń.','W budynku odsuń się od okien. Poczekaj z dorosłym i stosujcie się do komunikatów służb.']},
};
