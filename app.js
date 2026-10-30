/* Navigation et préférences de l’application existante. */
const navigationPages={home:'app.html',curriculum:'programmes.html',course:'cours.html',sheets:'fiches.html',audio:'audio.html',quiz:'quiz.html',videos:'videos.html',pass:'learning-pass.html'};
const learningFormats = {course:'course',sheets:'revision_sheet',audio:'audio',quiz:'quiz'};
let currentRoute = 'home';
let navigationVersion = 0;
const routes = new Set(['home','curriculum','demo','demo-course','demo-sheets','demo-audio','demo-quiz','videos','tutor','progress','settings',...Object.keys(learningFormats)]);
function stopAudio() {if (window.speechSynthesis) speechSynthesis.cancel();}
function activatePage(page,focus = true) {
  document.querySelectorAll('.page').forEach(el=>el.classList.toggle('active',el.id===page));
  document.querySelectorAll('[data-page]').forEach(link=>{
    if(link.dataset.page===page || page.startsWith('demo-')&&link.dataset.page==='demo')link.setAttribute('aria-current','page');
    else link.removeAttribute('aria-current');
  });
  const heading=document.querySelector('#'+page+' h2, #'+page+' h1');
  if(heading){document.title=heading.textContent.replace(/^[^\p{L}]+/u,'')+' — StudyBeam';if(focus){heading.tabIndex=-1;heading.focus({preventScroll:true});}}
  if(focus) window.scrollTo({top:0,left:0,behavior:'instant'});
}
async function showPage(id,{historyMode='push',focus=true}={}) {
  if(navigationPages[id] && id!=='home'){
    const selection=window.studybeamSchool?.getSelection()||{};
    const url=new URL('./'+navigationPages[id],location.href);
    if(id!=='curriculum')for(const key of ['grade','pathway','type','variant','subjectId','chapterId'])if(selection[key])url.searchParams.set(key,selection[key]);
    location[historyMode==='none'?'replace':'assign'](url.href);return;
  }
  if(document.body.dataset.library){location.assign(new URL('./app.html#'+(routes.has(id)?id:'home'),location.href).href);return;}
  if(!routes.has(id))id='home';
  const version=++navigationVersion;currentRoute=id;stopAudio();
  if(historyMode==='push' && location.hash!=='#'+id)history.pushState(null,'','#'+id);
  const actual=learningFormats[id]?'curriculum':id;
  activatePage(actual,focus);
  if(id==='demo-course')renderCourse();
  if(id==='demo-sheets')renderSheet();
  if(id==='demo-quiz')startQuiz();
  if(id==='demo-audio')document.getElementById('audioStatus').textContent='Exemple audio sur la dérivation, prêt à écouter.';
  if(id==='progress')renderProgress();
  if(id==='videos')document.getElementById('videoContext').textContent=Object.values(window.studybeamSchool.getContext()).filter(Boolean).join(' · ');
  if(learningFormats[id] || id==='curriculum') {
    try {
      if(!await window.studybeamSchool.ready || version!==navigationVersion)return;
      await window.studybeamCurriculum.open(window.studybeamSchool.getSelection(),learningFormats[id] || 'course',()=>version===navigationVersion);
    } catch {if(version===navigationVersion)document.getElementById('curriculumStatus').textContent='Les activités ne peuvent pas être chargées. Réessaie ou consulte les démonstrations.';}
  }
}
window.addEventListener('popstate',()=>showPage(decodeRoute(),{historyMode:'none'}));
window.addEventListener('hashchange',()=>{if(location.hash==='#mainContent'){document.getElementById('mainContent').focus();return;}const route=decodeRoute();if(route!==currentRoute)showPage(route,{historyMode:'none'});});
function decodeRoute(){try{const route=decodeURIComponent(location.hash.slice(1));return routes.has(route)?route:'home';}catch{return 'home';}}
document.addEventListener('click',event=>{
  const link=event.target.closest('a[href^="#"]');
  if(!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)return;
  const target=link.getAttribute('href').slice(1);
  if(target==='mainContent'){event.preventDefault();const main=document.getElementById('mainContent');main.focus({preventScroll:true});main.scrollIntoView({behavior:'auto'});return;}
  if(routes.has(target)){event.preventDefault();showPage(target);}
});
function controlDemoAudio(method) {
  const status=document.getElementById('audioStatus');
  if(!(window.speechSynthesis)){status.textContent='La synthèse vocale n’est pas disponible dans ce navigateur.';return;}
  if(['pause','resume','cancel'].includes(method)){speechSynthesis[method]();status.textContent={pause:'Lecture en pause.',resume:'Lecture reprise.',cancel:'Lecture arrêtée.'}[method];}
}
function playAudio(){
  if(!(window.speechSynthesis)||!(typeof window.SpeechSynthesisUtterance === 'function')){document.getElementById('audioStatus').textContent='La synthèse vocale n’est pas disponible dans ce navigateur.';return;}
  stopAudio();const speech=new SpeechSynthesisUtterance('Exemple de démonstration : dérivation. La dérivée indique le taux de variation instantané d’une fonction. La dérivée de x au carré est deux x.');speech.lang='fr-FR';speech.rate=Number(document.getElementById('speed').value);speechSynthesis.speak(speech);document.getElementById('audioStatus').textContent='Lecture de la démonstration via ton navigateur.';
}
function searchVideos(){const context=window.studybeamSchool.getContext();const query=encodeURIComponent([context.grade,context.subject,context.chapter,'cours'].filter(Boolean).join(' '));window.open('https://www.youtube.com/results?search_query='+query,'_blank','noopener,noreferrer');}
const palettes={Lavande:['#f6f4ff','#6859d9','#efecff'],Rose:['#fff4f7','#b94778','#ffe7f0'],Menthe:['#f1faf5','#28795b','#dcf4e8'],Ciel:['#f1f8ff','#2867a7','#deedff'],Neutre:['#f4f4f3','#45484d','#e8e8e5']};
function setTheme(name){const values=palettes[name]||palettes.Lavande;['--bg','--primary','--soft'].forEach((property,i)=>document.documentElement.style.setProperty(property,values[i]));document.querySelectorAll('.themebtn').forEach(button=>button.setAttribute('aria-pressed',String(button.textContent===name)));}
for(const name of Object.keys(palettes)){const button=document.createElement('button');button.className='themebtn';button.textContent=name;button.onclick=()=>{setTheme(name);window.studybeamStorage.set('sw-theme',name);};document.getElementById('themes').append(button);}
const theme=window.studybeamStorage.get('sw-theme');setTheme(Object.hasOwn(palettes,theme)?theme:'Lavande');
const fontSize=document.getElementById('fontSize'),storedSize=window.studybeamStorage.get('sw-size');fontSize.value=['16','18','20','22'].includes(storedSize)?storedSize:'16';document.documentElement.style.fontSize=fontSize.value+'px';
fontSize.onchange=()=>{document.documentElement.style.fontSize=fontSize.value+'px';window.studybeamStorage.set('sw-size',fontSize.value);};
const outfits=['Classique','Professeur','Super-héros','Astronaute','Détective','Pirate','Licorne','Magicien'],costume=document.getElementById('costume');outfits.forEach(name=>costume.add(new Option(name,name)));const savedOutfit=window.studybeamStorage.get('sw-costume');costume.value=outfits.includes(savedOutfit)?savedOutfit:'Classique';function displayOutfit(){document.getElementById('costumeBadge').textContent=costume.value;};costume.onchange=()=>{displayOutfit();window.studybeamStorage.set('sw-costume',costume.value);};displayOutfit();
function readDemoScore(key){const raw=window.studybeamStorage.get(key);if(raw===null||!/^\d$/.test(raw))return null;const value=Number(raw);return Number.isInteger(value)&&value>=0&&value<=3?value:null;}
function renderProgress(){
  const best=readDemoScore('sw-best'),last=readDemoScore('sw-last'),container=document.getElementById('progressContent');container.replaceChildren();
  const text=document.createElement('p');text.textContent=best===null?'Aucun résultat de démonstration valide enregistré.':'Meilleur score de démonstration : '+best+'/3.';container.append(text);
  if(last!==null){const detail=document.createElement('p');detail.textContent='Dernier score de démonstration : '+last+'/3 · Quiz de dérivation';container.append(detail);}
  document.getElementById('homeProgress').textContent=best===null?'Aucun quiz de démonstration terminé sur cet appareil.':'Meilleur score de démonstration : '+best+'/3.';
}
function clearProgress(){if(!window.confirm('Effacer uniquement les scores du quiz de démonstration sur cet appareil ?'))return;window.studybeamStorage.remove('sw-best');window.studybeamStorage.remove('sw-last');renderProgress();}
renderProgress();
if(typeof ResizeObserver==='function'){
  const updateChrome=()=>{document.documentElement.style.setProperty('--app-header-height',document.querySelector('.topbar').getBoundingClientRect().height+'px');document.documentElement.style.setProperty('--app-nav-height',(document.querySelector('.route-menu')||document.querySelector('.app-nav')).getBoundingClientRect().height+'px');};
  const chromeObserver=new ResizeObserver(updateChrome);chromeObserver.observe(document.querySelector('.topbar'));chromeObserver.observe(document.querySelector('.route-menu')||document.querySelector('.app-nav'));updateChrome();
}
window.startStudybeamApp=()=>{if(!document.body.dataset.library)return showPage(decodeRoute(),{historyMode:'none',focus:false});};
