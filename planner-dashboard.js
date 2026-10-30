/* Dashboard StudyBeam : les échéances, notes et objectifs proviennent du navigateur, sans exemples fictifs. */
(() => {
  'use strict';
  const home=document.querySelector('#home'), anchor=home?.querySelector('[data-resume]');
  const core=window.studybeamPlannerData;
  if(!home || !anchor || !core)return;
  const storage=window.studybeamStorage;
  const KEY='studybeam-goals-v1';
  const node=(tag,cls,text)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=text;return x};
  const link=(text,url)=>{const a=node('a','planner-link',text);a.href=url;return a};
  const get=key=>{try{return storage?.get(key)??localStorage.getItem(key)}catch{return null}};
  const save=(key,items)=>{try{localStorage.setItem(key,JSON.stringify(items));return true}catch{
    const status=document.querySelector('#plannerStatus');if(status)status.textContent='Enregistrement indisponible dans ce navigateur.';return false
  }};
  const format=date=>new Intl.DateTimeFormat('fr-FR',{weekday:'short',day:'numeric',month:'short'}).format(core.day(date));
  const area=node('section','study-planner');
  area.id='studyPlanner';area.setAttribute('aria-label','Mon organisation scolaire');
  anchor.insertAdjacentElement('afterend',area);
  function render(){
    area.replaceChildren();
    const events=core.upcomingEvents(core.parseList(get('studybeam-calendar-v1')),new Date(),14,80);
    const grades=core.gradeSummary(core.parseList(get('studybeam-grades-v1')));
    let goals=core.goalItems(get(KEY));
    const heading=node('div','planner-top');
    const title=node('div');title.append(node('span','section-kicker','MON ORGANISATION'),node('h2',null,'Mes révisions et mes devoirs'));
    heading.append(title,link('Ouvrir le calendrier →','./calendrier.html'));
    area.append(heading);
    const cards=node('div','planner-overview');
    const pending=events.filter(e=>e.today), overdue=events.filter(e=>e.overdue), soon=events.filter(e=>!e.today&&!e.overdue&&e.date<=core.iso(new Date(Date.now()+7*86400000)));
    const average=grades.length?grades.reduce((sum,x)=>sum+x.average*x.count,0)/grades.reduce((sum,x)=>sum+x.count,0):null;
    for(const [label,value,helper,url] of [
      ['À faire aujourd’hui',String(pending.length),'Échéances et séances enregistrées','./calendrier.html'],
      ['7 prochains jours',String(soon.length),'Événements planifiés','./calendrier.html'],
      ['Moyenne indicative',average===null?'—':average.toFixed(1)+'/20',grades.length?'Notes saisies par matière':'Ajoute tes notes pour la calculer','./mes-notes.html']]){
      const card=node('article','planner-stat');card.append(node('span',null,label),node('strong',null,value),node('small',null,helper),link('Voir →',url));cards.append(card)
    }
    area.append(cards);
    const columns=node('div','planner-columns');
    const agenda=node('section','planner-panel');
    const header=node('div','planner-panel-heading');header.append(node('h3',null,'Mes prochaines échéances'),link('Toutes les dates','./calendrier.html'));agenda.append(header);
    if(overdue.length){agenda.append(node('p','planner-warning',overdue.length+' événement(s) passé(s) non marqué(s) comme terminé(s).'));}
    const visible=[...overdue.slice(-2),...pending,...soon].slice(0,6);
    if(!visible.length){agenda.append(node('p','planner-empty','Aucune échéance prévue. Commence par ajouter ton prochain contrôle ou une révision.'));}
    else{
      const ul=node('ul','planner-agenda');for(const item of visible){
        const li=node('li','planner-agenda-item'),date=node('div','planner-date',format(item.date));
        if(item.overdue)date.classList.add('planner-overdue');
        const detail=node('div','planner-agenda-detail');
        detail.append(node('strong',null,item.title),node('span',null,[item.subject,item.start].filter(Boolean).join(' · ')));
        li.append(date,detail);ul.append(li);
      }agenda.append(ul);
    }
    const addEvent=link('+ Ajouter une révision','./calendrier.html');addEvent.classList.add('planner-primary-link');agenda.append(addEvent);
    const goalsPanel=node('section','planner-panel');
    goalsPanel.append(node('h3',null,'Mes objectifs personnels'),node('p','planner-intro','Une petite action à la fois. Tes objectifs restent sur cet appareil.'));
    const status=node('p','planner-status');status.id='plannerStatus';status.setAttribute('role','status');
    const list=node('ul','planner-goals');let completed=0;
    for(const goal of goals){
      if(goal.done)completed++;
      const item=node('li','planner-goal'),checkbox=document.createElement('input');
      checkbox.type='checkbox';checkbox.checked=goal.done;checkbox.setAttribute('aria-label','Terminer : '+goal.text);
      checkbox.onchange=()=>{goals=goals.map(g=>g.id===goal.id?{...g,done:checkbox.checked}:g);if(save(KEY,goals))render()};
      const label=node('span',goal.done?'is-done':'',goal.text);
      const remove=node('button','planner-remove','×');remove.type='button';remove.setAttribute('aria-label','Supprimer : '+goal.text);
      remove.onclick=()=>{goals=goals.filter(g=>g.id!==goal.id);if(save(KEY,goals))render()};
      item.append(checkbox,label,remove);list.append(item);
    }
    goalsPanel.append(node('p','planner-count',goals.length?completed+' objectif(s) sur '+goals.length+' réalisé(s)':'Aucun objectif enregistré.'),list);
    const form=node('form','planner-goal-form'),input=document.createElement('input'),submit=node('button',null,'Ajouter');
    input.type='text';input.placeholder='Ex. : réviser les fractions';input.maxLength=120;input.required=true;input.setAttribute('aria-label','Nouvel objectif personnel');
    submit.type='submit';form.append(input,submit);
    form.onsubmit=e=>{e.preventDefault();const text=input.value.trim();if(!text)return;if(goals.length>=12){status.textContent='Maximum de 12 objectifs. Termine ou supprime ceux déjà enregistrés.';return}
      goals.push({id:(crypto.randomUUID?.()||String(Date.now())+Math.random()),text,done:false});
      if(save(KEY,goals))render()
    };
    goalsPanel.append(form,status);columns.append(agenda,goalsPanel);area.append(columns);
    if(grades.length){
      const panel=node('section','planner-subjects');
      const head=node('div','planner-panel-heading');head.append(node('h3',null,'Mes résultats par matière'),link('Détails des notes','./mes-notes.html'));panel.append(head);
      const bars=node('div','planner-bars');
      for(const subject of grades.slice(0,6)){
        const row=node('div','planner-bar-row');row.append(node('span',null,subject.subject),node('strong',null,subject.average.toFixed(1)+'/20'));
        const track=node('div','planner-bar-track'),fill=node('div','planner-bar-fill');
        fill.style.width=Math.max(0,Math.min(100,subject.average/20*100))+'%';track.append(fill);row.append(track);bars.append(row);
      }panel.append(bars);area.append(panel);
    }
    area.append(node('p','planner-privacy','Les informations viennent de ton calendrier, de tes notes et de tes objectifs sur cet appareil. Elles ne sont pas synchronisées avec ton compte.'));
  }
  render();
  window.addEventListener('pageshow',render);
  window.addEventListener('storage',e=>{if(['studybeam-calendar-v1','studybeam-grades-v1',KEY].includes(e.key))render()});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)render()});
})();
