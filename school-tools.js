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
  let cursor=new Date(),view='month',selected=today,editing=null,editingDay=null;
  cursor.setDate(1);
  const toDay=iso=>new Date(iso+'T12:00:00');
  const plusDays=(date,n)=>{const d=new Date(date);d.setDate(d.getDate()+n);return d};
  const longDay=iso=>new Intl.DateTimeFormat('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(toDay(iso));
  const monthTitle=d=>new Intl.DateTimeFormat('fr-FR',{month:'long',year:'numeric'}).format(d);
  const allowed=new Set(Object.keys(types));
  let category='',query='';
  root.innerHTML='<div class="calendar-shell"><header class="calendar-heading"><div><span class="calendar-eyebrow">Organise tes révisions ✦</span><h1>Mon calendrier</h1><p class="tool-muted">Prépare tes devoirs, évaluations et révisions. Tout reste sur cet appareil, sans synchronisation ni notification en arrière-plan.</p></div><button type="button" class="primary calendar-new" id="add">+ Nouvel événement</button></header>'+
  '<div class="calendar-stats" id="calendarStats" aria-label="Résumé du planning"></div>'+
  '<section class="calendar-panel" aria-label="Agenda"><div class="calendar-toolbar"><div class="calendar-travel"><button type="button" id="prev" aria-label="Période précédente">←</button><button type="button" id="now">Aujourd’hui</button><button type="button" id="next" aria-label="Période suivante">→</button></div><h2 id="period" aria-live="polite"></h2><div class="calendar-switch"><label class="calendar-sr-only" for="mode">Affichage</label><select id="mode" aria-label="Mode d’affichage"><option value="month">Mois</option><option value="week">Semaine</option><option value="list">Liste</option></select></div></div>'+
  '<div class="calendar-filters"><label class="calendar-find">Rechercher<input id="searchEvents" type="search" placeholder="Titre, matière, chapitre…" maxlength="120" autocomplete="off"></label><label>Catégorie<select id="category"><option value="">Toutes</option><option value="revision">Révisions</option><option value="devoir">Devoirs</option><option value="evaluation">Évaluations</option></select></label><label>Aller à une date<input type="date" id="jumpDate"></label></div>'+
  '<div class="calendar-legend" aria-label="Légende"><span><i class="calendar-dot revision"></i>Révisions</span><span><i class="calendar-dot devoir"></i>Devoirs</span><span><i class="calendar-dot evaluation"></i>Évaluations</span><span>✓ Terminé</span></div>'+
  '<div id="reminders" class="calendar-reminders" role="status" aria-live="polite"></div><div id="calendarView"></div><section id="dayAgenda" class="calendar-day-agenda" aria-label="Événements de la journée"></section></section>'+
  '<p class="calendar-local-note">Astuce : exporte régulièrement ton calendrier en JSON plus bas pour conserver une copie. Sur un appareil partagé, les données peuvent être visibles par les autres utilisateurs de ce navigateur.</p></div>'+
  '<dialog id="eventDialog" aria-labelledby="dialogTitle"><form id="eventForm" class="tool-form"><h2 id="dialogTitle">Événement</h2><p id="seriesNotice" class="tool-muted"></p><div class="calendar-form-grid"><label class="calendar-form-wide">Titre<input name="title" maxlength="120" placeholder="Réviser les fractions" required></label><label>Catégorie<select name="type"><option value="revision">Révision</option><option value="devoir">Devoir</option><option value="evaluation">Évaluation</option></select></label><label>Matière<input name="subject" maxlength="80" placeholder="Mathématiques" required></label><label class="calendar-form-wide">Chapitre (facultatif)<input name="chapter" maxlength="120" placeholder="Chapitre ou notion"></label><label>Date<input name="date" type="date" required></label><label>Début<input name="start" type="time" required></label><label>Fin<input name="end" type="time" required></label><label>Répéter<select name="repeat"><option value="none">Jamais</option><option value="weekly">Chaque semaine</option></select></label><label>Rappel sur la page<select name="reminder"><option value="none">Aucun</option><option value="1d">La veille</option><option value="3h">3 heures avant</option><option value="1h">1 heure avant</option></select></label><label class="calendar-form-wide">Description<textarea name="description" maxlength="1000" rows="3"></textarea></label></div><p id="eventError" class="calendar-error" role="alert" hidden></p><div class="tool-actions"><button type="submit" class="primary">Enregistrer</button><button type="button" id="cancel">Annuler</button></div></form><div id="eventActions" class="tool-actions calendar-event-actions"></div></dialog>';
  const dialog=$('#eventDialog'),form=$('#eventForm'),actions=$('#eventActions');
  const formatTime=value=>typeof value==='string'&&/^\d{2}:\d{2}$/.test(value)?value:'08:00';
  function occurrences(start,end){
    const out=[];
    if(!validDate(start)||!validDate(end))return out;
    const startDate=toDay(start);
    for(const item of data){
      if(!item||!validDate(item.date)||!allowed.has(item.type))continue;
      let d=toDay(item.date);
      if(item.repeat==='weekly'&&d<startDate){
        const gap=Math.floor((startDate-d)/86400000);
        d=plusDays(d,Math.max(0,Math.ceil(gap/7)*7));
        while(dateVal(d)<start)d=plusDays(d,7);
      }
      let occurrencesCount=0;
      do{
        const iso=dateVal(d);
        if(iso>=start&&iso<=end){
          const done=item.repeat==='weekly'?(item.done===true||(Array.isArray(item.completedDates)&&item.completedDates.includes(iso))):item.done===true;
          out.push({...item,day:iso,done});
        }
        if(item.repeat!=='weekly')break;
        d=plusDays(d,7);
        occurrencesCount++;
      }while(dateVal(d)<=end&&occurrencesCount<1000);
    }
    return out.sort((x,y)=>(x.day+formatTime(x.start)+String(x.title)).localeCompare(y.day+formatTime(y.start)+String(y.title),'fr'));
  }
  const matches=item=>(!category||item.type===category)&&(!query||[item.title,item.subject,item.chapter,item.description].some(value=>String(value||'').toLocaleLowerCase('fr').includes(query)));
  const empty=(message,day)=>{
    const wrapper=el('div','calendar-empty');
    wrapper.append(el('span','calendar-empty-icon','✦'),el('p',null,message));
    const add=el('button',null,'+ Planifier un événement');add.type='button';add.onclick=()=>edit(null,day||selected);wrapper.append(add);
    return wrapper;
  };
  function eventButton(item,cls='event-chip'){
    const button=el('button',cls,formatTime(item.start)+' · '+String(item.title||'Événement')+(item.done?' ✓':''));
    button.type='button';button.dataset.type=item.type;button.classList.toggle('is-done',item.done);
    button.setAttribute('aria-label','Modifier '+String(item.title||'événement')+' le '+fmt(item.day));
    button.title='Modifier cet événement';button.onclick=()=>edit(item.id,item.day);
    return button;
  }
  function rowFor(item){
    const row=el('div','calendar-agenda-row');
    const badge=el('span','calendar-event-mark');badge.dataset.type=item.type;badge.textContent=types[item.type]||'Événement';
    const copy=el('div','calendar-agenda-copy');copy.append(badge,el('strong',null,String(item.title||'Événement')));
    copy.append(el('span','tool-muted',formatTime(item.start)+'–'+formatTime(item.end)+' · '+String(item.subject||'Matière non indiquée')+(item.chapter?' · '+item.chapter:'')));
    if(item.description)copy.append(el('small','tool-muted',item.description));
    const editButton=el('button','calendar-agenda-edit',item.done?'✓ Terminé · Modifier':'Modifier');
    editButton.type='button';editButton.onclick=()=>edit(item.id,item.day);
    row.append(copy,editButton);return row;
  }
  function renderDayAgenda(items,visible=true){
    const box=$('#dayAgenda');box.replaceChildren();box.hidden=!visible;
    if(!visible)return;
    const heading=el('div','calendar-agenda-heading');
    const title=el('h3',null,longDay(selected));const add=el('button',null,'+ Ajouter ce jour');
    add.type='button';add.onclick=()=>edit(null,selected);heading.append(title,add);box.append(heading);
    if(!items.length)box.append(empty(query||category?'Aucun événement ne correspond aux filtres ce jour-là.':'Rien de prévu ce jour-là. Tu peux ajouter une révision.',selected));
    else for(const item of items)box.append(rowFor(item));
  }
  function drawStats(){
    const end7=dateVal(plusDays(toDay(today),6));
    const week=occurrences(today,end7);
    const monthStart=dateVal(new Date(new Date().getFullYear(),new Date().getMonth(),1));
    const monthEnd=dateVal(new Date(new Date().getFullYear(),new Date().getMonth()+1,0));
    const month=occurrences(monthStart,monthEnd);
    const cards=[['Ce mois-ci',month.length,'événement(s) planifié(s)'],['7 prochains jours',week.length,'rendez-vous à venir'],['À faire aujourd’hui',week.filter(x=>x.day===today&&!x.done).length,'événement(s) non terminés']];
    const box=$('#calendarStats');box.replaceChildren();
    for(const [label,value,note] of cards){const card=el('div','calendar-stat');card.append(el('span',null,label),el('strong',null,String(value)),el('small',null,note));box.append(card)}
  }
  function renderReminders(){
    const now=Date.now(),end=dateVal(plusDays(new Date(),2));
    const reminders=occurrences(today,end).filter(item=>!item.done&&item.reminder!=='none').filter(item=>{
      const date=new Date(item.day+'T'+formatTime(item.start));
      const delta=date.getTime()-now;
      return delta>=0&&delta<=({'1d':86400000,'3h':10800000,'1h':3600000}[item.reminder]||0);
    });
    const area=$('#reminders');area.textContent=reminders.length?'⏰ Rappel sur cette page : '+reminders.slice(0,3).map(item=>String(item.title)+' · '+fmt(item.day)).join(' · ')+(reminders.length>3?' et '+(reminders.length-3)+' autre(s)':''):'';
    area.hidden=!reminders.length;
  }
  function render(){
    const y=cursor.getFullYear(),m=cursor.getMonth();
    const firstMonth=new Date(y,m,1),lastMonth=new Date(y,m+1,0);
    let start=dateVal(firstMonth),end=dateVal(lastMonth);
    if(view==='week'){
      const first=plusDays(toDay(selected),-((toDay(selected).getDay()+6)%7));
      start=dateVal(first);end=dateVal(plusDays(first,6));
      $('#period').textContent=fmt(start)+' — '+fmt(end);
    }else $('#period').textContent=monthTitle(cursor);
    $('#jumpDate').value=selected;
    const area=$('#calendarView');area.replaceChildren();
    let displayStart=start,displayEnd=end;
    if(view==='month'){
      const shift=(firstMonth.getDay()+6)%7;
      displayStart=dateVal(plusDays(firstMonth,-shift));
      displayEnd=dateVal(plusDays(toDay(displayStart),41));
    }
    const all=occurrences(displayStart,displayEnd),entries=all.filter(matches);
    const buckets=new Map();
    for(const item of entries){if(!buckets.has(item.day))buckets.set(item.day,[]);buckets.get(item.day).push(item)}
    if(view==='list'){
      const list=el('div','calendar-list');
      if(!entries.length)list.append(empty('Aucun événement pour ce mois avec ces filtres.',start));
      for(const [day,items] of buckets){
        const group=el('section','calendar-list-day');
        group.append(el('h3',null,longDay(day)));
        for(const item of items)group.append(rowFor(item));
        list.append(group);
      }
      area.append(list);renderDayAgenda([],false);
    }else{
      const grid=el('div','calendar-grid '+(view==='week'?'calendar-grid-week':'calendar-grid-month'));
      grid.setAttribute('role','group');
      grid.setAttribute('aria-label',view==='month'?'Calendrier de '+monthTitle(cursor):'Semaine du '+fmt(start));
      for(const label of ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'])grid.append(el('div','calendar-weekday',label));
      const first=toDay(displayStart);
      const length=view==='month'?42:7;
      for(let i=0;i<length;i++){
        const day=dateVal(plusDays(first,i)),items=buckets.get(day)||[];
        const cls='calendar-day'+(day===today?' is-today':'')+(day===selected?' is-selected':'')+(day.slice(0,7)!==start.slice(0,7)&&view==='month'?' is-outside':'');
        const cell=el('div',cls);
        const number=el('button','calendar-date',String(Number(day.slice(-2))));
        number.type='button';number.setAttribute('aria-label',longDay(day)+', '+items.length+' événement(s)');
        number.setAttribute('aria-pressed',String(day===selected));
        number.onclick=()=>{selected=day;if(view==='week')cursor=new Date(toDay(day).getFullYear(),toDay(day).getMonth(),1);render()};
        cell.append(number);
        const dots=el('div','calendar-day-dots');
        dots.setAttribute('aria-hidden','true');
        for(const item of items.slice(0,4)){const dot=el('i','calendar-dot '+item.type);dots.append(dot)}
        if(items.length>4)dots.append(el('small',null,'+'+(items.length-4)));
        cell.append(dots);
        for(const item of items.slice(0,2))cell.append(eventButton(item));
        if(items.length>2){
          const more=el('button','calendar-more','+'+(items.length-2)+' autres');more.type='button';
          more.onclick=()=>{selected=day;render();$('#dayAgenda').scrollIntoView({block:'nearest',behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})};
          cell.append(more);
        }
        const create=el('button','calendar-day-add','+');create.type='button';
        create.setAttribute('aria-label','Ajouter un événement le '+longDay(day));create.onclick=()=>edit(null,day);
        cell.append(create);grid.append(cell);
      }
      area.append(grid);renderDayAgenda(buckets.get(selected)||[]);
    }
    drawStats();renderReminders();
  }
  function edit(id,day){
    editing=id;editingDay=day||today;form.reset();$('#eventError').hidden=true;$('#eventError').textContent='';
    actions.replaceChildren();
    const item=id?data.find(x=>x.id===id):null;
    if(id&&!item)return;
    const defaults={title:'',type:'revision',subject:'',chapter:'',date:day||today,start:'17:00',end:'18:00',repeat:'none',reminder:'none',description:''};
    for(const [key,value] of Object.entries({...defaults,...(item||{})})){
      const field=form.elements.namedItem(key);if(field)field.value=value??'';
    }
    $('#dialogTitle').textContent=item?'Modifier un événement':'Nouvel événement';
    $('#seriesNotice').textContent=item?.repeat==='weekly'?'Cet événement se répète chaque semaine. Les modifications de ce formulaire concernent toute la série.':'Les rappels ne s’affichent que lorsque ce calendrier est ouvert.';
    if(item){
      const done=item.repeat==='weekly'?(item.done===true||(Array.isArray(item.completedDates)&&item.completedDates.includes(editingDay))):item.done===true;
      const toggle=el('button',null,done?'↩ Marquer non terminé':'✓ Marquer terminé');toggle.type='button';
      toggle.onclick=()=>{
        const original=JSON.stringify(data);
        if(item.repeat==='weekly'){
          if(item.done===true){
            if(!confirm('Le statut terminé concerne actuellement toute la série. Réactiver les séances pour les suivre individuellement ?'))return;
            item.done=false;item.completedDates=[];
          }else{
            const dates=Array.isArray(item.completedDates)?item.completedDates:[];
            item.completedDates=done?dates.filter(x=>x!==editingDay):[...new Set([...dates,editingDay])];
          }
        }else item.done=!item.done;
        if(!save()){data=JSON.parse(original);return}
        dialog.close();render();
      };
      const del=el('button','calendar-danger','Supprimer'+(item.repeat==='weekly'?' la série':''));
      del.type='button';
      del.onclick=()=>{
        if(!confirm(item.repeat==='weekly'?'Supprimer toutes les occurrences de cette série hebdomadaire ?':'Supprimer définitivement cet événement ?'))return;
        const old=data;data=data.filter(x=>x.id!==id);
        if(!save()){data=old;return}
        dialog.close();render();
      };
      actions.append(toggle,del);
    }
    dialog.showModal();
    form.elements.namedItem('title').focus();
  }
  form.onsubmit=event=>{
    event.preventDefault();
    const row=Object.fromEntries(new FormData(form).entries());
    row.title=String(row.title||'').trim();row.subject=String(row.subject||'').trim();
    const invalid=!row.title||!row.subject||!validDate(row.date)||
      !window.studybeamSchoolBackup?.validTime(row.start)||!window.studybeamSchoolBackup?.validTime(row.end)||
      row.end<=row.start||!allowed.has(row.type)||!['none','weekly'].includes(row.repeat)||!['none','1d','3h','1h'].includes(row.reminder);
    if(invalid){
      $('#eventError').textContent='Vérifie le titre, la matière, la date et les horaires (la fin doit être après le début).';
      $('#eventError').hidden=false;return;
    }
    const old=editing?data.find(x=>x.id===editing):null;
    if(!editing&&data.length>=1500){
      $('#eventError').textContent='Limite de 1 500 événements atteinte. Exporte ou supprime des événements avant d’en ajouter.';
      $('#eventError').hidden=false;return;
    }
    row.id=editing||uid();
    row.done=old?.done===true;
    row.completedDates=Array.isArray(old?.completedDates)?old.completedDates:[];
    const previous=data;
    data=editing?data.map(item=>item.id===editing?row:item):[...data,row];
    if(!save()){data=previous;return}
    const displayDay=old?.repeat==='weekly'&&row.repeat==='weekly'&&old.date===row.date&&validDate(editingDay)?editingDay:row.date;
    selected=displayDay;cursor=new Date(toDay(displayDay).getFullYear(),toDay(displayDay).getMonth(),1);
    dialog.close();render();
  };
  $('#cancel').onclick=()=>dialog.close();
  $('#add').onclick=()=>edit(null,selected);
  const move=direction=>{
    if(view==='week'){
      selected=dateVal(plusDays(toDay(selected),direction*7));
      cursor=new Date(toDay(selected).getFullYear(),toDay(selected).getMonth(),1);
    }else{
      cursor=new Date(cursor.getFullYear(),cursor.getMonth()+direction,1);
      selected=dateVal(cursor);
    }
    render();
  };
  $('#prev').onclick=()=>move(-1);
  $('#next').onclick=()=>move(1);
  $('#now').onclick=()=>{cursor=new Date();cursor.setDate(1);selected=today;render()};
  $('#mode').onchange=event=>{view=event.target.value;render()};
  $('#category').onchange=event=>{category=event.target.value;render()};
  $('#searchEvents').oninput=event=>{query=event.target.value.trim().toLocaleLowerCase('fr');render()};
  $('#jumpDate').onchange=event=>{if(!validDate(event.target.value))return;selected=event.target.value;cursor=new Date(toDay(selected).getFullYear(),toDay(selected).getMonth(),1);render()};
  dialog.addEventListener('close',()=>{editing=null;actions.replaceChildren()});
  render();
}
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