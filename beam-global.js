/* Beam sur les pages statiques : compagnon local sans imitation d'une réponse IA. */
(() => {
 'use strict';
 if(document.querySelector('#chatForm,#beamGlobalPanel'))return;
 let launcher=document.querySelector('.beam-launcher');
 if(!launcher){
  launcher=document.createElement('button');launcher.type='button';launcher.className='beam-launcher';
  launcher.setAttribute('aria-label','Ouvrir Beam, mon compagnon');
  const avatar=document.createElement('img');avatar.src='./assets/studybeam-logo.webp?v=dragon-1';avatar.alt='';avatar.width=64;avatar.height=64;
  launcher.append(avatar);document.body.append(launcher);
 }
 launcher.classList.add('beam-character-launcher');
 launcher.querySelectorAll(':scope > span:not(.beam-avatar-host)').forEach(label=>label.remove());
 launcher.setAttribute('aria-label','Discuter avec Beam le dragon');
 launcher.setAttribute('role','button');launcher.setAttribute('aria-expanded','false');
 const panel=document.createElement('section');panel.id='beamGlobalPanel';panel.className='beam-global-panel';
 panel.hidden=true;panel.setAttribute('aria-label','Discuter avec Beam');
 const head=document.createElement('div');head.className='beam-global-header';
 const name=document.createElement('strong');name.textContent='🐉 Beam, ton compagnon';
 const close=document.createElement('button');close.type='button';close.textContent='Fermer';close.className='btn ghost';close.setAttribute('aria-label','Fermer Beam');
 head.append(name,close);
 const log=document.createElement('div');log.className='beam-global-log';log.setAttribute('aria-live','polite');
 const greeting=document.createElement('p');greeting.textContent="Coucou ! Moi, c'est Beam ! 🐉 Je suis là pour t'aider à apprendre, réviser et découvrir plein de nouvelles choses. On commence ?";
 log.append(greeting);
 const shortcuts=document.createElement('div');shortcuts.className='beam-global-shortcuts';
 const suggestions=[['Cours','cours.html'],['Fiches','fiches.html'],['Quiz','quiz.html'],['Vidéos (sélection à venir)','videos.html'],['Calendrier','calendrier.html'],['Mes notes','mes-notes.html']];
 for(const [label,url] of suggestions){const a=document.createElement('a');a.className='btn ghost';a.href='./'+url;a.textContent=label;shortcuts.append(a);}
 const form=document.createElement('form');form.className='beam-global-form';
 const input=document.createElement('input');input.type='text';input.required=true;input.maxLength=2000;input.placeholder='Ex. : explique les dizaines';input.setAttribute('aria-label','Demander à Beam d’ouvrir une rubrique');
 const send=document.createElement('button');send.className='btn';send.textContent='Envoyer';form.append(input,send);
 const note=document.createElement('p');note.className='small muted';note.textContent="Beam te guide vers les activités et peut t’expliquer trois chapitres de mathématiques CP à partir des cours vérifiés. Aucune IA générative n'est connectée.";
 const fresh=document.createElement('button');fresh.type='button';fresh.className='btn ghost';fresh.textContent='Nouvelle conversation';
 const quietLabel=document.createElement('label');quietLabel.className='beam-global-quiet';
 const quiet=document.createElement('input');quiet.type='checkbox';try{quiet.checked=localStorage.getItem('beam-quiet')==='true';}catch{quiet.checked=false;}
 quietLabel.append(quiet,document.createTextNode(' Mode discret (sans animations)'));
 panel.append(head,log,shortcuts,form,fresh,quietLabel,note);document.body.append(panel);
 function add(text,type){const p=document.createElement('p');p.className=type==='user'?'beam-global-user':'beam-global-reply';p.textContent=text;log.append(p);log.scrollTop=log.scrollHeight;}
 function state(name){document.dispatchEvent(new CustomEvent('studybeam:beam-state',{detail:{state:name}}));}
 function open(){state('greet');panel.hidden=false;launcher.setAttribute('aria-expanded','true');input.focus();}
 function dismiss(){state('idle');panel.hidden=true;launcher.setAttribute('aria-expanded','false');launcher.focus();}
 launcher.addEventListener('click',event=>{event.preventDefault();panel.hidden?open():dismiss();});
 close.onclick=dismiss;
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!panel.hidden)dismiss();});
 fresh.onclick=()=>{log.replaceChildren();add("Coucou ! On repart sur une nouvelle conversation.",'bot');input.focus();};
 quiet.onchange=()=>{try{localStorage.setItem('beam-quiet',String(quiet.checked));}catch{}document.documentElement.classList.toggle('beam-quiet',quiet.checked);};
 document.documentElement.classList.toggle('beam-quiet',quiet.checked);
 form.onsubmit=async event=>{
  event.preventDefault();const msg=input.value.trim();if(!msg)return;
  add(msg,'user');input.value='';
  const normalized=msg.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const routing=/^(ouvre|ouvrir|affiche|afficher|montre|aller|va)\b/.test(normalized);
  const links=[[/video/,'videos.html'],[/quiz/,'quiz.html'],[/fiche/,'fiches.html'],[/cours/,'cours.html'],[/programme/,'programmes.html'],[/calendrier|agenda|revision/,'calendrier.html'],[/note|moyenne/,'mes-notes.html'],[/dragon|beam/,'app.html#tutor']];
  const page=routing?links.find(([pattern])=>pattern.test(normalized))?.[1]:null;
  if(page){add('Je peux ouvrir cette rubrique : '+page.replace('.html','')+'.','bot');const a=document.createElement('a');a.href='./'+page;a.textContent='Ouvrir cette rubrique';a.className='btn ghost';log.append(a);return;}
  if(!window.studybeamLessonGuide){add("L’aide pédagogique n’est pas chargée. Ouvre les cours pour poursuivre.",'bot');return;}
  send.disabled=true;input.disabled=true;
  try{
   const answer=await window.studybeamLessonGuide.respond(msg);
   add(answer.text,'bot');
   for(const item of answer.links||[]){
    if(!/^\.\/(cours|fiches|quiz|ressource)\.html(?:\?|$)/.test(item.href))continue;
    const a=document.createElement('a');a.href=item.href;a.textContent=item.label;a.className='btn ghost';log.append(a);
   }
   log.scrollTop=log.scrollHeight;
  }catch{add('Cette ressource ne peut pas être chargée pour le moment. Réessaie depuis la page des cours.','bot');}
  finally{send.disabled=false;input.disabled=false;input.focus();}
 };
})();