(()=>{'use strict';
const root=document.querySelector('#schoolTool');if(!root)return;
const kind=document.body.dataset.schoolTool;
const key=kind==='calendar'?'studybeam-calendar-v1':'studybeam-grades-v1';
const $=(s,ctx=root)=>ctx.querySelector(s);
const el=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e};
let data=[];try{const stored=JSON.parse(localStorage.getItem(key)||'[]');if(Array.isArray(stored))data=stored.filter(x=>x&&typeof x==='object').slice(0,1500)}catch{}
const save=()=>{try{localStorage.setItem(key,JSON.stringify(data));return true}catch{alert('Enregistrement local indisponible');return false}};
const dateVal=d=>{const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return y+'-'+m+'-'+day};
const today=dateVal(new Date());
const validDate=d=>window.studybeamSchoolBackup?.validDate(d)??(/^\d{4}-\d{2}-\d{2}$/.test(d)&&d===dateVal(new Date(d+'T12:00:00')));
const fmt=d=>new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'short',year:'numeric'}).format(new Date(d+'T12:00:00'));
const uid=()=>crypto?.randomUUID?.()||String(Date.now())+Math.random().toString(16).slice(2);
const types={evaluation:'Évaluation',revision:'Révision',devoir:'Devoir'};
const color={evaluation:'#F8DCCE',revision:'#C5E9D9',devoir:'#BBDCF2'};
const esc=s=>String(s||'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
function initCalendar(){
let cursor=new Date(),view='month',editing=null;
root.innerHTML='<div class="tool-bar"><h1>Mon calendrier</h1><p class="tool-muted">Événements enregistrés sur cet appareil uniquement. Les rappels apparaissent quand la page est ouverte.</p><div class="tool-actions"><button id="prev" type="button">← Précédent</button><button id="now" type="button">Aujourd’hui</button><button id="next" type="button">Suivant →</button><select id="mode" aria-label="Mode d’affichage"><option value="month">Mois</option><option value="week">Semaine</option><option value="list">Liste</option></select><button id="add" type="button" class="primary">+ Ajouter un événement</button></div><h2 id="period"></h2><div id="reminders" role="status"></div><div id="calendarView"></div></div><dialog id="eventDialog"><form id="eventForm" class="tool-form"><h2 id="dialogTitle">Événement</h2><label>Titre<input name="title" maxlength="120" required></label><label>Catégorie<select name="type"><option value="evaluation">Évaluation</option><option value="revision">Révision</option><option value="devoir">Devoir</option></select></label><label>Matière<input name="subject" maxlength="80" required></label><label>Chapitre (facultatif)<input name="chapter" maxlength="120"></label><label>Date<input name="date" type="date" required></label><label>Début<input name="start" type="time" required></label><label>Fin<input name="end" type="time" required></label><label>Répéter<select name="repeat"><option value="none">Jamais</option><option value="weekly">Chaque semaine</option></select></label><label>Rappel<select name="reminder"><option value="none">Aucun</option><option value="1d">La veille</option><option value="3h">3 heures avant</option><option value="1h">1 heure avant</option></select></label><label>Description<textarea name="description" maxlength="1000"></textarea></label><div class="tool-actions"><button type="submit" class="primary">Enregistrer</button><button type="button" id="cancel">Annuler</button></div></form></dialog>';
const dialog=$('#eventDialog'),form=$('#eventForm');
function occurrences(start,end){const out=[];for(const item of data){if(!validDate(item.date))continue;let d=new Date(item.date+'T12:00:00');let count=0;do{const iso=dateVal(d);if(iso>=start&&iso<=end)out.push({...item,day:iso,done:item.repeat==='weekly'?(Array.isArray(item.completedDates)&&item.completedDates.includes(iso)):!!item.done});if(item.repeat!=='weekly')break;d.setDate(d.getDate()+7);count++}while(dateVal(d)<=end&&count<520)}return out.sort((a,b)=>(a.day+a.start).localeCompare(b.day+b.start))}
function eventButton(item){const b=el('button','event-chip',item.start+' '+item.title+(item.done?' ✓':''));b.type='button';b.style.borderLeft='5px solid '+color[item.type];b.title='Modifier cet événement';b.onclick=()=>edit(item.id,item.day);return b}
function render(){let start,end;const y=cursor.getFullYear(),m=cursor.getMonth();
if(view==='month'){start=dateVal(new Date(y,m,1));end=dateVal(new Date(y,m+1,0));$('#period').textContent=new Intl.DateTimeFormat('fr-FR',{month:'long',year:'numeric'}).format(cursor)}
else if(view==='week'){const begin=new Date(cursor);begin.setDate(cursor.getDate()-((cursor.getDay()+6)%7));const finish=new Date(begin);finish.setDate(begin.getDate()+6);start=dateVal(begin);end=dateVal(finish);$('#period').textContent=fmt(start)+' – '+fmt(end)}
else{const now=new Date();const after=new Date(now);after.setDate(after.getDate()+365);const before=new Date(now);before.setDate(before.getDate()-30);start=dateVal(before);end=dateVal(after);$('#period').textContent='Événements (30 jours passés et 12 mois à venir)'}
const entries=occurrences(start,end),area=$('#calendarView');area.replaceChildren();
if(view==='list'){if(!entries.length)area.append(el('p','tool-muted','Aucun événement pour le moment.'));for(const item of entries){const row=el('div','tool-list-row');row.append(el('strong',null,fmt(item.day)),eventButton(item),el('span','tool-muted',item.subject));area.append(row)}}
else{const grid=el('div','calendar-grid');const days=[];if(view==='month'){const first=new Date(y,m,1);first.setDate(1-((first.getDay()+6)%7));for(let i=0;i<42;i++){days.push(dateVal(first));first.setDate(first.getDate()+1)}}else{const first=new Date(start+'T12:00:00');for(let i=0;i<7;i++){days.push(dateVal(first));first.setDate(first.getDate()+1)}}
for(const label of ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'])grid.append(el('div','calendar-weekday',label));
for(const day of days){const cell=el('div','calendar-day'+(day===today?' is-today':''));cell.append(el('strong',null,day.split('-')[2]));for(const item of entries.filter(e=>e.day===day))cell.append(eventButton(item));const create=el('button','calendar-day-add','+');create.setAttribute('aria-label','Ajouter un événement le '+day);create.onclick=()=>edit(null,day);cell.append(create);grid.append(cell)}area.append(grid)}
const now=Date.now();const notifications=data.filter(item=>item.reminder!=='none'&&!item.done&&validDate(item.date)).filter(item=>{const d=new Date(item.date+'T'+(item.start||'08:00'));return d.getTime()-now>0&&d.getTime()-now<=({ '1d':86400000,'3h':10800000,'1h':3600000}[item.reminder]||0)});$('#reminders').textContent=notifications.length?'Rappel : '+notifications.slice(0,3).map(i=>i.title+' ('+fmt(i.date)+')').join(', '):'';}
function edit(id,day){editing=id;const item=data.find(e=>e.id===id);form.reset();for(const [k,v] of Object.entries(item||{date:day||today,start:'17:00',end:'18:00',type:'revision',repeat:'none',reminder:'none'})){const field=form.elements.namedItem(k);if(field)field.value=v}$('#dialogTitle').textContent=id?'Modifier un événement':'Nouvel événement';dialog.showModal()}
form.onsubmit=e=>{e.preventDefault();const fd=new FormData(form);const row=Object.fromEntries(fd.entries());if(!validDate(row.date)||row.end<=row.start){alert('La date et les horaires doivent être valides.');return}row.title=String(row.title).trim();row.id=editing||uid();row.done=editing?Boolean(data.find(e=>e.id===editing)?.done):false;row.completedDates=editing?(data.find(e=>e.id===editing)?.completedDates||[]):[];if(editing)data=data.map(e=>e.id===editing?row:e);else data.push(row);if(save()){dialog.close();render()}};
$('#cancel').onclick=()=>dialog.close();$('#add').onclick=()=>edit(null,today);$('#prev').onclick=()=>{if(view==='month')cursor.setMonth(cursor.getMonth()-1);else cursor.setDate(cursor.getDate()-7);render()};$('#next').onclick=()=>{if(view==='month')cursor.setMonth(cursor.getMonth()+1);else cursor.setDate(cursor.getDate()+7);render()};$('#now').onclick=()=>{cursor=new Date();render()};$('#mode').onchange=e=>{view=e.target.value;render()};
const details=el('div','tool-actions');details.id='eventActions';dialog.append(details);
dialog.addEventListener('close',()=>details.replaceChildren());
const originalEdit=edit;edit=function(id,day){originalEdit(id,day);details.replaceChildren();if(!id)return;const row=data.find(e=>e.id===id);if(!row)return;const occurrenceDone=row.repeat==='weekly'?(Array.isArray(row.completedDates)&&row.completedDates.includes(day)):!!row.done;
const done=el('button',null,occurrenceDone?'Marquer non terminé':'Marquer terminé');done.type='button';
done.onclick=()=>{if(row.repeat==='weekly'){const entries=Array.isArray(row.completedDates)?row.completedDates:[];row.completedDates=occurrenceDone?entries.filter(d=>d!==day):[...new Set([...entries,day])];}else row.done=!row.done;save();dialog.close();render()};const del=el('button',null,'Supprimer');del.type='button';del.onclick=()=>{if(!confirm('Supprimer définitivement cet événement ?'))return;data=data.filter(e=>e.id!==id);save();dialog.close();render()};details.append(done,del)};render()}
function initGrades(){
let editingGrade=null;
root.innerHTML='<h1>Suivi de mes notes</h1><p class="tool-muted">Notes et graphiques personnels enregistrés sur cet appareil. Les résultats ne sont pas synchronisés avec un compte.</p><form id="gradeForm" class="grade-form"><label>Matière<input name="subject" required maxlength="80" placeholder="Mathématiques"></label><label>Note obtenue<input type="number" name="score" min="0" step="0.01" required></label><label>Barème<input type="number" name="max" min="0.1" step="0.01" value="20" required></label><label>Date<input name="date" type="date" required></label><label>Évaluation<input name="label" maxlength="100" placeholder="Contrôle chapitre 2"></label><button type="submit" class="primary">Enregistrer la note</button></form><div class="grade-filters"><label>Matière <select id="subjectFilter"><option value="">Toutes</option></select></label></div><div id="gradeSummary" class="grade-summary"></div><div id="gradeChart" class="grade-chart" role="img" aria-label="Courbe d’évolution des notes sur 20"></div><h2>Historique des notes</h2><div id="gradeRows"></div>';
const form=$('#gradeForm');form.elements.date.value=today;const filter=$('#subjectFilter');
const editBar=el('div','tool-actions');editBar.id='gradeEditActions';
const cancelEdit=el('button',null,'Annuler la modification');cancelEdit.type='button';cancelEdit.hidden=true;
cancelEdit.onclick=()=>{editingGrade=null;cancelEdit.hidden=true;form.reset();form.elements.date.value=today;form.querySelector('[type="submit"]').textContent='Enregistrer la note';};
editBar.append(cancelEdit);form.after(editBar);
form.onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(form));const score=Number(d.score),max=Number(d.max);if(!validDate(d.date)||!Number.isFinite(score)||!Number.isFinite(max)||max<=0||score<0||score>max){alert('Vérifie les notes et le barème.');return}const row={...d,score,max,subject:d.subject.trim(),id:editingGrade||uid()};
if(editingGrade)data=data.map(item=>item.id===editingGrade?row:item);else data.push(row);
if(save()){editingGrade=null;cancelEdit.hidden=true;form.reset();form.elements.date.value=today;form.querySelector('[type="submit"]').textContent='Enregistrer la note';render()}};
filter.onchange=render;
function render(){const subjects=[...new Set(data.map(x=>x.subject).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'fr'));const old=filter.value;filter.replaceChildren(new Option('Toutes',''));subjects.forEach(x=>filter.add(new Option(x,x)));filter.value=subjects.includes(old)?old:'';
const selected=data.filter(x=>!filter.value||x.subject===filter.value).filter(x=>Number.isFinite(Number(x.score))&&Number(x.max)>0&&validDate(x.date)).sort((a,b)=>a.date.localeCompare(b.date));
const values=selected.map(x=>Number(x.score)/Number(x.max)*20);const avg=values.length?values.reduce((a,b)=>a+b,0)/values.length:0;$('#gradeSummary').textContent=values.length?'Moyenne indicative : '+avg.toFixed(2)+'/20 · '+values.length+' note(s)':'Aucune note enregistrée.';
const chart=$('#gradeChart');chart.replaceChildren();if(values.length){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 600 220');svg.setAttribute('aria-hidden','true');const svgEl=(tag,attrs)=>{const e=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,String(v));svg.append(e);return e};for(let j=0;j<=4;j++){const y=15+j*46;svgEl('line',{x1:35,y1:y,x2:585,y2:y,stroke:'#dbe6e7'});const label=svgEl('text',{x:5,y:y+5,fill:'#546a70','font-size':12});label.textContent=String(20-j*5)}const points=values.map((v,i)=>[35+i*550/Math.max(values.length-1,1),199-v/20*184]);svgEl('polyline',{points:points.map(p=>p.join(',')).join(' '),stroke:'#527F99','stroke-width':3,fill:'none'});points.forEach((p,i)=>svgEl('circle',{cx:p[0],cy:p[1],r:5,fill:'#527F99'}));chart.append(svg)}else chart.textContent='Le graphique apparaîtra après la saisie des notes.';
const rows=$('#gradeRows');rows.replaceChildren();for(const item of [...selected].reverse()){const row=el('div','tool-list-row');row.append(el('strong',null,fmt(item.date)),el('span',null,item.subject+' · '+(item.label||'Évaluation')),el('span',null,item.score+'/'+item.max));const button=el('button',null,'Supprimer');button.type='button';button.onclick=()=>{if(!confirm('Supprimer cette note ?'))return;data=data.filter(x=>x.id!==item.id);save();render()};const edit=el('button',null,'Modifier');edit.type='button';edit.onclick=()=>{
  editingGrade=item.id;for(const key of ['subject','score','max','date','label']){
    const field=form.elements.namedItem(key);if(field)field.value=item[key]??'';
  }
  cancelEdit.hidden=false;form.querySelector('[type="submit"]').textContent='Enregistrer la modification';
  form.scrollIntoView({behavior:'smooth',block:'center'});form.elements.namedItem('subject').focus();
};
row.append(edit,button);rows.append(row)}}render()}
function start(){
 if(kind==='calendar')initCalendar();else initGrades();
 const box=el('section','tool-privacy');
 box.setAttribute('aria-label','Sauvegarde et confidentialité sur cet appareil');
 box.append(el('h2',null,'Mes données sur cet appareil'));
 box.append(el('p','tool-muted',"Ces informations sont enregistrées dans ce navigateur, sans synchronisation avec ton compte. Sur un appareil partagé, les autres personnes utilisant ce navigateur peuvent les retrouver."));
 const actions=el('div','tool-actions');
 const exportButton=el('button',null,'Exporter mes données (JSON)');
 exportButton.type='button';
 exportButton.onclick=()=>{
  const blob=new Blob([JSON.stringify({format:'studybeam-local-v1',section:kind,exported_at:new Date().toISOString(),items:data},null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob),link=document.createElement('a');
  link.href=url;link.download=kind==='calendar'?'studybeam-calendrier.json':'studybeam-notes.json';
  document.body.append(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 const clearButton=el('button','danger-soft','Effacer toutes mes données locales');
 clearButton.type='button';
 clearButton.onclick=()=>{
  if(!data.length){alert('Il n’y a aucune donnée à effacer.');return;}
  const label=kind==='calendar'?'tous les événements du calendrier':'toutes les notes';
  if(!confirm('Effacer définitivement '+label+' sur cet appareil ? Cette action est irréversible. Exporte tes données avant si tu veux les conserver.'))return;
  try{localStorage.removeItem(key);data=[];start()}catch{alert('Suppression locale indisponible : vérifie les réglages du navigateur.')}
 };
 const backup=window.studybeamSchoolBackup;
 const restoreInput=el('input');restoreInput.type='file';restoreInput.accept='.json,application/json';restoreInput.hidden=true;
 restoreInput.setAttribute('aria-label','Choisir une sauvegarde JSON StudyBeam');
 const restoreButton=el('button',null,'Importer une sauvegarde (JSON)');restoreButton.type='button';
 const restoreStatus=el('p','tool-muted');restoreStatus.setAttribute('role','status');
 restoreButton.onclick=()=>restoreInput.click();
 restoreInput.onchange=async()=>{const file=restoreInput.files?.[0];restoreInput.value='';if(!file)return;
   if(!backup){restoreStatus.textContent='Le module de vérification des sauvegardes est indisponible.';return;}
   if(file.size>backup.MAX_FILE_BYTES){restoreStatus.textContent='Fichier trop volumineux (maximum 1 Mo).';return;}
   try{
     const imported=backup.decode(await file.text(),kind);
     const label=kind==='calendar'?'événements du calendrier':'notes';
     if(!confirm('Remplacer les '+label+' actuellement enregistrés sur cet appareil par '+imported.length+' entrée(s) du fichier ? Exporte tes données avant de continuer.')){restoreStatus.textContent='Import annulé.';return;}
     const previous=data;data=imported;
     if(save()){start();const msg=document.querySelector('#importStatus');if(msg)msg.textContent=imported.length+' entrée(s) restaurée(s) sur cet appareil.';}
     else{data=previous;restoreStatus.textContent='Enregistrement impossible, les données initiales ont été conservées.';}
   }catch(error){restoreStatus.textContent=error?.message||'Fichier non reconnu : aucune donnée modifiée.';}
 };
 restoreStatus.id='importStatus';
 actions.append(exportButton,restoreButton,clearButton,restoreInput);box.append(actions,restoreStatus);root.append(box);
}
start();
})();