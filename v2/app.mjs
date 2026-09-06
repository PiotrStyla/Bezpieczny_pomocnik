import {decorate,icon} from './icons.mjs';
import {REGIONS,LESSONS,GUIDES,STORAGE_KEY,PROGRESS_KEY,escapeHTML as e,normalizePhone,sanitizeFamily,loadFamily,parseWarningResponse} from './safety.mjs';
import * as views from './views.mjs';

const main = document.querySelector('#main');
const modal = document.querySelector('#modal');
const modalContent = document.querySelector('#modal-content');
const speechButton = document.querySelector('#read-aloud');
let storage;
try { storage = window.localStorage; } catch { storage = null; }
let family = loadFamily(storage);
let completed = new Set();
try {
  const saved = JSON.parse(storage?.getItem(PROGRESS_KEY) || '[]');
  if (Array.isArray(saved)) completed = new Set(saved.filter(id => LESSONS.some(l => l.id===id)));
} catch { /* A corrupt record must not block emergency help. */ }
let route = '';
let toastTimer;
let previousFocus;
let installPrompt;
let fetchController;
let snapshot = null;
let swReady = false;
let offlineMessage = 'Nie potwierdzono zapisu offline. Pozostaw aplikację otwartą z internetem. Przed wyjściem sprawdź ją bez sieci.';
let speaking = false;
const dateFormat = new Intl.DateTimeFormat('pl-PL',{day:'numeric',month:'long',hour:'2-digit',minute:'2-digit',timeZone:'Europe/Warsaw'});

function toast(message) {
  const node = document.querySelector('#toast');
  node.textContent = message; node.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(()=>{node.hidden=true;},6000);
}
function stopSpeech() {
  window.speechSynthesis?.cancel(); speaking=false;
  speechButton.innerHTML=icon('volume')+'<span>Czytaj na głos</span>';
  speechButton.setAttribute('aria-pressed','false');
}
function speak() {
  if (speaking) return stopSpeech();
  const synth = window.speechSynthesis;
  const voice = synth?.getVoices().find(v=>v.localService && /^pl(-|_)/i.test(v.lang));
  if (!voice) return toast('Brak lokalnego polskiego głosu. Możesz poprosić dorosłego o przeczytanie tekstu.');
  const text = (modal.open?modalContent:main).innerText.slice(0,9000);
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice=voice;utterance.lang='pl-PL';utterance.rate=.9;
  utterance.onend=utterance.onerror=()=>stopSpeech();
  synth.speak(utterance);speaking=true;
  speechButton.innerHTML=icon('volume')+'<span>Zatrzymaj czytanie</span>';
  speechButton.setAttribute('aria-pressed','true');
}
function openModal(html) {
  stopSpeech();
  if (!modal.open) previousFocus=document.activeElement;
  modalContent.innerHTML=html;decorate(modalContent);
  if (!modal.open) modal.showModal();
  modal.scrollTop=0;
  document.querySelector('#close-modal').focus();
}
function closeModal() { modal.close(); }
modal.addEventListener('close',()=>{stopSpeech();if(previousFocus?.isConnected)previousFocus.focus();});
document.querySelector('#close-modal').addEventListener('click',closeModal);
speechButton.addEventListener('click',speak);

function help() {
  openModal(`<h2 id="modal-title">Co się dzieje?</h2><p>Wybierz sytuację. Pokażemy Ci kilka prostych kroków.</p><div class="guide-grid">${Object.entries(GUIDES).map(([id,g])=>`<button class="guide-button" data-action="guide:${id}">${icon(g.icon)}<span>${g.title}</span>${icon('chevron')}</button>`).join('')}</div><div class="row">${views.button('Chcę z kimś porozmawiać','support','heart')}${views.button('Nagłe zagrożenie · 112','emergency','phone','emergency')}</div>`);
}
function guide(id) {
  const g = GUIDES[id]; if (!g) return;
  openModal(`<h2 id="modal-title">${g.title}</h2><ol class="steps">${g.steps.map(s=>`<li>${s}</li>`).join('')}</ol><div class="row">${views.button('Kontakt z bliską osobą','contacts','phone')}${views.button('Pomoc · 112','emergency','phone','emergency')}</div><div class="row">${views.button('Inna sytuacja','help','compass')}${views.button('Czytaj wskazówki','speak','volume')}</div>`);
}
function emergency() {
  openModal(`<h2 id="modal-title">Pilnie potrzebujesz pomocy?</h2><p>Jeśli czyjeś życie lub zdrowie jest w niebezpieczeństwie, zadzwoń pod <strong>112</strong>.</p><ol class="steps"><li>Powiedz, co się stało.</li><li>Powiedz, gdzie jesteś. Opisz miejsce, jeśli nie znasz adresu.</li><li>Słuchaj operatora i odpowiadaj na pytania. Nie rozłączaj się, dopóki nie powie, że możesz.</li></ol><a class="button emergency" href="tel:112">${icon('phone')}Zadzwoń pod 112</a><p class="hint">Przycisk otworzy aplikację telefonu. Nie dzwonimy automatycznie. Nie dzwoń na 112 podczas ćwiczeń.</p><div class="row">${views.button('Potrzebuję rozmowy','support','heart')}${views.button('Czytaj wskazówki','speak','volume')}</div>`);
}
function support() {
  openModal(`<h2 id="modal-title">Nie musisz być z tym samodzielnie.</h2><p>Jeśli coś Cię martwi, możesz porozmawiać z zaufanym dorosłym. Gdy trudno znaleźć taką osobę, skorzystaj z telefonu zaufania dla dzieci i młodzieży.</p><a class="button primary" href="tel:116111">${icon('phone')}Zadzwoń · 116 111</a><p>116 111 jest bezpłatny i działa przez całą dobę, 7 dni w tygodniu.</p><p class="hint">Jeżeli nie możesz teraz się połączyć, spróbuj ponownie lub zwróć się do innej zaufanej osoby. W bezpośrednim zagrożeniu życia lub zdrowia dzwoń pod 112.</p><div class="row">${views.button('Moi bliscy','contacts','users')}${views.button('Pomoc · 112','emergency','phone','emergency')}</div>`);
}
function contacts() {
  openModal(`<h2 id="modal-title">Ktoś, komu ufasz.</h2>${views.contacts(family)}<p class="hint">Jeśli ktoś nie odbiera, spróbuj kolejnej osoby. Ten ekran nie wysyła wiadomości ani Twojej lokalizacji.</p><div class="row">${views.button('Potrzebuję innej osoby','support','heart')}${views.button('Pomoc · 112','emergency','phone','emergency')}</div>`);
}
function lesson(id) {
  const l=LESSONS.find(x=>x.id===id);if(!l)return;
  openModal(`<div class="lesson-counter">Mała lekcja · ${LESSONS.indexOf(l)+1} z 4</div><h2 id="modal-title">${l.title}</h2><p>${l.intro}</p><p><strong>${l.question}</strong></p><div class="answers">${l.answers.map((answer,i)=>`<button class="answer" data-action="answer:${id}:${i}">${answer}</button>`).join('')}</div><div id="lesson-feedback" aria-live="polite"></div>${views.button('Czytaj lekcję','speak','volume')}`);
}
function answer(id,index) {
  const l=LESSONS.find(x=>x.id===id);if(!l || !Number.isInteger(index) || !l.answers[index])return;
  const correct = index===l.correct;
  modalContent.querySelectorAll('.answer').forEach((el,i)=>{
    el.classList.toggle('correct',correct&&i===index);
    el.classList.toggle('incorrect',!correct&&i===index);
    if(correct)el.disabled=true;
  });
  const feedback = modalContent.querySelector('#lesson-feedback');
  if(!feedback)return;
  if(correct){
    completed.add(id);
    try {storage.setItem(PROGRESS_KEY,JSON.stringify([...completed]));}
    catch{toast('Lekcja poznana. Przeglądarka nie pozwala zapisać postępu na później.');}
    feedback.innerHTML=`<div class="feedback"><strong>To dobry krok.</strong><p>${l.explanation}</p></div>${views.button('Gotowe na dziś','lesson-done','check','primary')}`;
  }else{
    feedback.innerHTML='<div class="feedback"><strong>Spróbuj jeszcze raz. Masz czas.</strong><p>Zastanów się, która odpowiedź pomaga zatrzymać niepokojącą sytuację i uzyskać wsparcie zaufanego dorosłego.</p></div>';
  }
}
function connection() {
  const node=document.querySelector('#connection');
  node.hidden=navigator.onLine;
  node.textContent=swReady?'Jesteś offline. Plan i wskazówki są dostępne. Aktualne ostrzeżenia wymagają internetu.':'Brak połączenia. Nie potwierdzono zapisu aplikacji offline — nie zamykaj jej, jeśli potrzebujesz wskazówek.';
  const status=document.querySelector('#offline-status');
  if(status)status.textContent=offlineMessage;
}
function render(focus=false) {
  if(modal.open)modal.close();
  stopSpeech();fetchController?.abort();fetchController=null;snapshot=null;
  route=location.hash.slice(1);
  const page=['home','area','learn','plan','parent','privacy'].includes(route)?route:'home';
  route=page;
  main.innerHTML=({home:()=>views.home(family,completed),area:()=>views.area(family),learn:()=>views.learn(completed),plan:()=>views.plan(family),parent:()=>views.parent(family),privacy:views.privacy})[page]();
  document.querySelectorAll('[data-nav]').forEach(el=>{
    if(el.dataset.nav===page)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');
  });
  document.title=({home:'Mój dzień',area:'Moja okolica',learn:'Uczę się bezpieczeństwa',plan:'Mój plan',parent:'Strefa opiekuna',privacy:'Prywatność'})[page]+' · Bezpieczny Pomocnik';
  decorate(main);
  if(page==='parent'){
    document.querySelector('#family-form').addEventListener('submit',saveFamily);
    document.querySelector('#install-app').hidden=!installPrompt;
    connection();
  }
  if(page==='area'){
    document.querySelector('#region').addEventListener('change',()=>{fetchController?.abort();fetchController=null;snapshot=null;document.querySelector('#alerts').innerHTML='<p class="notice">Region zmieniony. Sprawdź komunikaty dla nowego wyboru.</p>';document.querySelector('[data-action="refresh"]').disabled=false;});
  }
  if(focus){main.focus();window.scrollTo({top:0,behavior:'instant'});}
}
function saveFamily(event) {
  event.preventDefault();
  const data=Object.fromEntries(new FormData(event.currentTarget));
  const err=document.querySelector('#form-error');
  if(!document.querySelector('#local-consent').checked){err.textContent='Zaznacz zgodę na zapis lokalny.';return;}
  for(const [name,key] of [['contactName','phone'],['secondName','secondPhone']]){
    if(data[name]?.trim()&&!data[key]?.trim()){err.textContent='Dodaj numer dla wpisanej osoby albo usuń jej nazwę.';return;}
    if(data[key]?.trim()&&!normalizePhone(data[key])){err.textContent='Sprawdź numer telefonu: 9–15 cyfr, opcjonalnie + na początku.';return;}
  }
  const clean=sanitizeFamily(data);
  try {storage.setItem(STORAGE_KEY,JSON.stringify(clean));family=clean;err.textContent='';toast('Plan zapisany na tym urządzeniu.');}
  catch {err.textContent='Nie udało się zapisać planu. Sprawdź ustawienia pamięci przeglądarki. Nie zapisaliśmy zmian.';}
}
async function refresh() {
  const region=document.querySelector('#region')?.value;
  const target=document.querySelector('#alerts');
  if(!Object.hasOwn(REGIONS,region)){target.innerHTML='<p class="error">Najpierw wybierz województwo.</p>';return;}
  fetchController?.abort();
  const controller=new AbortController();fetchController=controller;
  const btn=document.querySelector('[data-action="refresh"]');btn.disabled=true;
  target.innerHTML='<p class="notice">Sprawdzamy publiczne ostrzeżenia IMGW…</p>';
  const timer=setTimeout(()=>controller.abort(),12000);
  try{
    const response=await fetch('https://danepubliczne.imgw.pl/api/data/warningsmeteo',{signal:controller.signal,credentials:'omit',referrerPolicy:'no-referrer',cache:'no-store'});
    const text=await response.text();
    if(text.length>2000000)throw new Error('Response too large');
    const warnings=parseWarningResponse(response.status,JSON.parse(text),region);
    if(fetchController!==controller || route!=='area' || document.querySelector('#region').value!==region)return;
    snapshot={warnings,region,checked:Date.now()};
    showWarnings();
  }catch{
    if(fetchController===controller && route==='area'){
      snapshot=null;target.innerHTML='<p class="notice"><strong>Nie udało się sprawdzić ostrzeżeń.</strong><br>Nie wiemy, jakie są teraz warunki. Sprawdźcie oficjalną mapę IMGW lub spróbujcie ponownie. Wskazówki pomocy nadal są dostępne.</p>';
    }
  }finally{clearTimeout(timer);if(fetchController===controller)btn.disabled=false;}
}
function showWarnings() {
  const target=document.querySelector('#alerts');if(!target||!snapshot)return;
  const stale=!navigator.onLine || Date.now()-snapshot.checked>15*60*1000;
  const warnings=snapshot.warnings.filter(w=>w.end>Date.now());
  target.innerHTML=`<p class="hint">Źródło: IMGW-PIB · pobrano ${dateFormat.format(snapshot.checked)} · woj. ${e(REGIONS[snapshot.region])}</p>${stale?'<p class="notice"><strong>Dane mogą być nieaktualne.</strong> Połącz się z internetem i sprawdź ponownie.</p>':''}`+
    (warnings.length?warnings.map(w=>`<article class="alert-item"><h3>${e(w.title)} · stopień ${w.level} z 3</h3><p class="meta">${w.start>Date.now()?'Zapowiedziane':'Okres ostrzeżenia trwa'} · ${dateFormat.format(w.start)} – ${dateFormat.format(w.end)}</p><p>${e(w.content)}</p><p class="hint">Dotyczy części województwa. Sprawdź dokładny obszar na mapie IMGW i omów komunikat z dorosłym.</p></article>`).join(''):'<p class="notice">W pobranym zestawie nie ma niewygasłych ostrzeżeń pogodowych dla tego województwa. Nie jest to potwierdzenie bezpieczeństwa ani informacja o wszystkich zagrożeniach.</p>');
}
function deleteData() {
  openModal(`<h2 id="modal-title">Usunąć dane tej wersji?</h2><p>Usuniemy zapisane tu kontakty, miejsce spotkania, notatkę i postęp lekcji. Tej czynności nie można cofnąć. Nie dotyczy to danych wcześniejszej aplikacji.</p><div class="row">${views.button('Usuń plan i postęp','confirm-delete','close','delete-button')}${views.button('Zachowaj dane','close','check')}</div>`);
}
async function install() {
  if(!installPrompt)return toast('Dodaj aplikację do ekranu głównego z menu przeglądarki.');
  await installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;
  const btn=document.querySelector('#install-app');if(btn)btn.hidden=true;
}
document.addEventListener('click',event=>{
  const action=event.target.closest('[data-action]')?.dataset.action;
  if(!action)return;
  const [name,id,num]=action.split(':');
  const actions={help,contacts,emergency,support,guide:()=>guide(id),lesson:()=>lesson(id),answer:()=>answer(id,Number(num)),speak,refresh,delete:deleteData,close:closeModal,install,
    'lesson-done':()=>{closeModal();render();},
    'confirm-delete':()=>{
      try{storage.removeItem(STORAGE_KEY);storage.removeItem(PROGRESS_KEY);family=sanitizeFamily({});completed.clear();closeModal();render();toast('Usunięto plan i postęp tej wersji.');}
      catch{toast('Nie udało się usunąć danych. Użyj ustawień danych witryny w przeglądarce.');}
    }};
  actions[name]?.();
});
document.addEventListener('click',event=>{if(modal.open && event.target.closest('a[href^="#"]'))closeModal();});
window.addEventListener('hashchange',()=>render(true));
window.addEventListener('offline',()=>{connection();showWarnings();});
window.addEventListener('online',()=>{connection();showWarnings();});
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;const btn=document.querySelector('#install-app');if(btn)btn.hidden=false;});
window.addEventListener('storage',event=>{if(event.key===STORAGE_KEY){family=loadFamily(storage);if(route!=='parent')render();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopSpeech();else{connection();showWarnings();}});
setInterval(()=>{if(route==='area')showWarnings();},60000);
document.querySelector('#today').textContent=new Intl.DateTimeFormat('pl-PL',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date());
decorate();render();connection();
if('serviceWorker' in navigator && window.isSecureContext){
  navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'}).then(async reg=>{
    await navigator.serviceWorker.ready;
    const channel=new MessageChannel();
    channel.port1.onmessage=event=>{if(event.data?.type==='BP_OFFLINE_READY'){swReady=true;offlineMessage='Kopia offline jest gotowa. Plan, lekcje i wskazówki zostały zapisane. Przećwicz jeszcze otwarcie aplikacji bez sieci na telefonie dziecka.';connection();}};
    reg.active?.postMessage({type:'BP_CHECK_READY'},[channel.port2]);
  }).catch(()=>{offlineMessage='Nie udało się przygotować pracy offline w tej przeglądarce. Spróbuj w zwykłej przeglądarce Chrome, Edge lub Safari, z włączonym internetem.';connection();toast('Nie udało się przygotować pracy offline. Pomoc działa, dopóki strona jest otwarta.');});
}else{
  offlineMessage='Ta przeglądarka nie udostępnia pracy offline. Otwórz aplikację przez HTTPS w zwykłej przeglądarce na telefonie.';
  connection();
}
