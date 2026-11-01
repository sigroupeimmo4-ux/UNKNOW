/* StudyBeam — tableau de bord v2 : aucune donnée pédagogique simulée. */
(() => {
  'use strict';
  const home=document.getElementById('home');
  if(!home || home.dataset.dashboardVersion!=='2') return;
  const storage=window.studybeamStorage;
  const core=window.studybeamPlannerData;
  if(!storage || !core)return;
  const $=id=>document.getElementById(id);
  const get=key=>storage.get(key);
  const node=(tag,cls,value)=>{
    const element=document.createElement(tag);
    if(cls)element.className=cls;
    if(value!==undefined)element.textContent=value;
    return element;
  };
  const link=(label,href,cls)=>{
    const a=node('a',cls||'dash-action-link',label);
    a.href=href;
    return a;
  };
  const localItems=key=>core.parseList(get(key));
  const format=iso=>{
    const d=core.day(iso);
    return d?new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'short',year:'numeric'}).format(d):iso;
  };
  let catalogue=null;
  const settingsIds=['dashboardAccentChoice','dashboardFavoriteSubjects','dashboardSavePrefs','dashboardPrefsStatus'];
  const gradeKeys=['sw-school-profile','sw-profile'];
  const palette={sky:'#BBDCF2',mint:'#C5E9D9',peach:'#F8DCCE',yellow:'#F7E9AC',pink:'#F2DCE8'};
  function appearance(){
    const accent=get('sw-dashboard-accent-v1');
    const key=Object.prototype.hasOwnProperty.call(palette,accent)?accent:'sky';
    document.body.dataset.dashboardAccent=key;
    $('dashboardAccentChoice').value=key;
    $('dashboardFavoriteSubjects').value=get('sw-dashboard-favorites-v1')||'';
    const favoriteRow=$('dashboardFavoriteChips');
    if(favoriteRow){favoriteRow.replaceChildren();for(const subject of $('dashboardFavoriteSubjects').value.split(',').map(x=>x.trim()).filter(Boolean).slice(0,8))favoriteRow.append(node('span','dash-favorite-chip',subject));}
  }
  function schoolIdentity(){
    const profile=storage.json('sw-school-profile')||storage.json('sw-profile');
    const validGrade=profile&&typeof profile.grade==='string'&&profile.grade.trim();
    const labels={generale:'générale',technologique:'technologique',professionnelle:'professionnelle','generale-technologique':'générale et technologique',commun:''};
    const grade=validGrade?profile.grade.trim().slice(0,35):'Classe non renseignée';
    const path=validGrade&&Object.prototype.hasOwnProperty.call(labels,profile.pathway)?labels[profile.pathway]:'';
    const year=catalogue?.school_year?('Année scolaire '+catalogue.school_year):'Année scolaire non chargée';
    $('dashboardIdentity').textContent=[grade,path,year].filter(Boolean).join(' · ');
    return profile&&validGrade?profile:null;
  }
  function greet(){
    // Le prénom affiché est uniquement celui enregistré volontairement sur cet appareil.
    const name=String(get('sw-display-name')||'').trim().slice(0,50);
    const greeting=$('dashGreeting');
    if(greeting)greeting.textContent=name?'Bonjour, '+name+' ! 👋':'Bonjour ! 👋';
    const profileLink=document.querySelector('.top-account .profile-link .profile-label');
    if(profileLink)profileLink.textContent=name?name:'Mon profil';
  }
  function prepareContext(){
    const events=core.upcomingEvents(localItems('studybeam-calendar-v1'),new Date(),14,100);
    const day7=core.iso(new Date(new Date().getFullYear(),new Date().getMonth(),new Date().getDate()+7,12));
    const soon=events.filter(e=>!e.overdue && e.date<=day7);
    const goals=core.goalItems(get('studybeam-goals-v1'));
    const grades=core.gradeSummary(localItems('studybeam-grades-v1'));
    return {events,soon,goals,grades};
  }
  function dailyFocus(context,recent){
    const el=$('dashboardDailyFocus');if(!el)return;el.replaceChildren();
    const copy=node('div','dash-focus-content');
    copy.append(node('span','dash-eyebrow','MON OBJECTIF DU JOUR'));
    const pending=context.goals.find(g=>!g.done);
    const goal=pending||context.goals[0]||null;
    const count=context.goals.filter(g=>g.done).length,total=context.goals.length;
    copy.append(node('h2',null,goal?goal.text:'Un petit objectif pour bien commencer'));
    const detail=goal?(pending?'Cet objectif a été défini sur cet appareil. Coche-le quand tu l’as réellement atteint.':'Tous tes objectifs enregistrés sont marqués comme réalisés.'):'Définis ton premier objectif dans la rubrique « Mes objectifs personnels » ci-dessous.';
    copy.append(node('p','dash-focus-desc',detail));
    const meter=node('div','dash-focus-meter');
    const label=node('div','dash-focus-progress-label');
    label.append(node('span',null,'Objectifs personnels réalisés'),node('strong',null,total?count+' / '+total:'Aucun suivi'));
    meter.append(label);
    const progress=node('progress');
    progress.max=Math.max(1,total);progress.value=count;progress.setAttribute('aria-label','Objectifs personnels terminés');
    meter.append(progress);
    if(!total)meter.append(node('small','dash-help','Une progression sera calculée seulement à partir de tes objectifs cochés.'));
    copy.append(meter);
    const buttons=node('div','dash-focus-actions');
    if(recent.length)buttons.append(link('Continuer mon dernier cours →','./cours.html?lesson='+encodeURIComponent(recent[0].id),'btn'));
    else buttons.append(link('Découvrir les cours →','./cours.html','btn'));
    const viewGoals=node('button','btn ghost','Gérer mes objectifs');
    viewGoals.type='button';
    viewGoals.onclick=()=>document.querySelector('#studyPlanner .planner-goals')?.scrollIntoView({behavior:'auto',block:'center'});
    buttons.append(viewGoals);copy.append(buttons);el.append(copy);
    const illustration=node('div','dash-focus-art');
    illustration.append(node('span',null,'✦'));
    illustration.append(node('p',null,total?count+' / '+total+' objectifs atteints':'Ton rythme, tes objectifs'));
    el.append(illustration);
  }
  function stats(context,recent){
    const target=$('dashboardStatCards');if(!target)return;target.replaceChildren();
    const demo=String(get('sw-last')||'');
    const demoScore=/^[0-3]$/.test(demo)?demo+'/3 (dernier quiz de démonstration)':'Aucun résultat de quiz enregistré';
    const data=[
      {icon:'📘',name:'Cours terminés',value:'—',note:'Fin de cours non suivie actuellement',href:'./cours.html'},
      {icon:'📖',name:'Chapitres révisés',value:'—',note:recent.length?recent.length+' chapitre(s) consulté(s) vérifié(s)':'Aucun chapitre étudié confirmé',href:'./programmes.html'},
      {icon:'🎯',name:'Réussite aux quiz',value:'—',note:'Taux global non suivi · '+demoScore,href:'./quiz.html'},
      {icon:'🗓️',name:'Échéances à venir',value:String(context.soon.length),note:'Événements non terminés sur les 7 prochains jours',href:'./calendrier.html'}
    ];
    for(let i=0;i<data.length;i++){
      const stat=data[i],a=link('',stat.href,'dash-stat-card dash-stat-'+i);
      a.append(node('span','dash-stat-icon',stat.icon),node('span','dash-stat-label',stat.name),node('strong','dash-stat-value',stat.value),node('span','dash-stat-note',stat.note));
      target.append(a);
    }
  }
  function resume(recent){
    const area=home.querySelector('[data-resume]');if(!area)return;area.replaceChildren();
    const header=node('div','dash-section-heading');
    const title=node('div');
    title.append(node('span','dash-eyebrow','TON HISTORIQUE'),node('h2',null,'Reprendre mes apprentissages'));
    header.append(title,link('Tous les cours →','./cours.html'));area.append(header);
    if(!recent.length){
      const empty=node('div','dash-empty-card');
      empty.append(node('strong',null,'Ton parcours commence ici ✨'),node('p',null,'Aucun cours vérifié récemment consulté sur cet appareil. Explore les ressources pour commencer.'),link('Explorer les programmes →','./programmes.html','btn ghost'));
      area.append(empty);return;
    }
    const grid=node('div','dash-resume-grid');
    for(const r of recent.slice(0,3)){
      const card=node('article','dash-resume-card');
      card.append(node('span','dash-resume-icon','📚'),node('span','dash-resume-subject',r.subject||'Cours vérifié'),node('h3',null,r.title));
      card.append(node('p','dash-resume-detail','Cours consulté · '+new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'short'}).format(new Date(r.at))));
      card.append(node('p','dash-help','Le suivi d’achèvement n’est pas encore disponible.'));
      card.append(link('Reprendre ce cours →','./cours.html?lesson='+encodeURIComponent(r.id),'dash-action-link'));
      grid.append(card);
    }
    area.append(grid);
  }
  async function verifiedRecent(){
    if(!catalogue || !Array.isArray(catalogue.programs) || !Array.isArray(catalogue.contents))return [];
    const entries=storage.json('sw-learning-history')?.items||[];
    if(!Array.isArray(entries))return [];
    const out=[],seen=new Set();
    for(const item of entries.slice(0,20)){
      if(!item || typeof item.id!=='string'||!(/^[a-z0-9-]+$/.test(item.id))||!Number.isFinite(Date.parse(item.at))||seen.has(item.id))continue;
      const program=catalogue.programs.find(p=>p?.domains?.some(d=>d.chapters?.some(ch=>ch.id===item.id)));
      if(!program || program.reference_status!=='verified' ||
         !program.effective_from || program.effective_from>'2026-09-01' ||
         (program.effective_until && program.effective_until<'2027-08-31'))continue;
      const chapter=program.domains.flatMap(d=>d.chapters||[]).find(ch=>ch.id===item.id);
      const hasContent=catalogue.contents.some(c=>c.kind==='course' && c.review_status==='verified' &&
         c.program_id===program.id && c.program_version===program.version &&
         Array.isArray(c.chapter_ids)&&c.chapter_ids.includes(item.id));
      if(!chapter||!hasContent)continue;
      const scope=catalogue.scopes?.find(s=>s.id===program.scope_id);
      const subject=scope?.subjects?.find(s=>s.id===program.subject_id)?.title||'Cours';
      seen.add(item.id);out.push({id:item.id,title:chapter.title,subject,at:item.at});
    }
    return out;
  }
  function beamAdvice(recent,ctx){
    const box=$('dashboardBeamAdvice');if(!box)return;
    if(recent.length)box.textContent='Tu peux reprendre « '+recent[0].title+' » : un cours que tu as déjà consulté. Beam propose une aide guidée sur certains chapitres disponibles.';
    else if(ctx.soon.length)box.textContent='Tu as '+ctx.soon.length+' échéance(s) enregistrée(s) dans les sept prochains jours. Consulte ton calendrier pour organiser tes révisions.';
    else box.textContent='Commence par choisir un cours vérifié ou ajoute une révision dans ton calendrier. Beam peut te guider vers les ressources disponibles.';
  }
  function results(ctx){
    const box=$('dashboardGradesSummary');if(!box)return;box.replaceChildren();
    const title=node('strong',null,'Mes notes scolaires');
    const subtitle=node('p','dash-help','Notes saisies manuellement, jamais confondues avec les quiz StudyBeam.');
    box.append(title,subtitle);
    if(!ctx.grades.length){
      box.append(node('p','dash-empty-small','Aucune note scolaire enregistrée sur cet appareil.'));
    }else{
      for(const grade of ctx.grades.slice(0,3)){
        const item=node('div','dash-grade-row');
        item.append(node('span',null,grade.subject),node('strong',null,grade.average.toFixed(1)+'/20'));
        const track=node('div','dash-grade-track');const bar=node('div','dash-grade-bar');
        bar.style.width=Math.max(0,Math.min(100,grade.average/20*100))+'%';
        track.append(bar);item.append(track);box.append(item);
      }
    }
    box.append(link('Ouvrir mes notes scolaires →','./mes-notes.html'));
  }
  function notifications(ctx){
    const count=$('dashboardNotificationsCount'),panel=$('dashboardNotifications'),toggle=$('dashboardNotificationsToggle');
    if(!panel||!count||!toggle)return;
    const pending=ctx.events.filter(e=>!e.overdue).slice(0,5);
    count.hidden=!pending.length;count.textContent=String(pending.length);
    panel.replaceChildren(node('strong',null,'Échéances enregistrées'));
    if(!pending.length)panel.append(node('p','dash-help','Aucune échéance dans les 14 prochains jours.'));
    for(const item of pending){
      const row=node('div','dash-notification-item');
      row.append(node('strong',null,item.title),node('span',null,[format(item.date),item.subject,item.start].filter(Boolean).join(' · ')));
      panel.append(row);
    }
    panel.append(link('Ouvrir le calendrier →','./calendrier.html'));
    toggle.setAttribute('aria-label',pending.length?pending.length+' échéance(s) à consulter':'Consulter les échéances');
  }
  async function render(){
    greet();schoolIdentity();
    const ctx=prepareContext();
    const recent=await verifiedRecent();
    dailyFocus(ctx,recent);stats(ctx,recent);resume(recent);results(ctx);beamAdvice(recent,ctx);notifications(ctx);
  }
  function bind(){
    appearance();
    $('dashboardSavePrefs')?.addEventListener('click',()=>{
      const accent=$('dashboardAccentChoice').value;
      if(!Object.prototype.hasOwnProperty.call(palette,accent))return;
      storage.set('sw-dashboard-accent-v1',accent);
      const favorites=$('dashboardFavoriteSubjects').value.split(',').map(s=>s.trim()).filter(Boolean).slice(0,8).map(s=>s.slice(0,45));
      storage.set('sw-dashboard-favorites-v1',favorites.join(', '));
      appearance();
      $('dashboardPrefsStatus').textContent='Préférences enregistrées sur cet appareil.';
      document.dispatchEvent(new Event('studybeam:dashboard-preferences'));
    });
    let toggle=$('dashboardNotificationsToggle'),panel=$('dashboardNotifications');
    // Le générateur des pages peut recréer la topbar : installer les contrôles si absents.
    if(!toggle || !panel){
      const holder=document.querySelector('.top-account');
      if(holder){
        toggle=node('button','dash-notification-button','🔔');toggle.type='button';toggle.id='dashboardNotificationsToggle';
        toggle.setAttribute('aria-label','Afficher les échéances enregistrées');toggle.setAttribute('aria-expanded','false');
        toggle.setAttribute('aria-controls','dashboardNotifications');
        const badge=node('span','dash-notification-count');badge.id='dashboardNotificationsCount';badge.hidden=true;toggle.append(badge);
        panel=node('div','dash-notifications');panel.id='dashboardNotifications';panel.hidden=true;panel.setAttribute('role','region');panel.setAttribute('aria-label','Mes prochaines échéances');
        holder.prepend(panel);holder.prepend(toggle);
      }
    }
    toggle?.addEventListener('click',()=>{
      panel.hidden=!panel.hidden;
      toggle.setAttribute('aria-expanded',String(!panel.hidden));
    });
    document.addEventListener('keydown',event=>{
      if(event.key==='Escape'&&panel&&!panel.hidden){panel.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.focus()}
    });
    document.addEventListener('pointerdown',event=>{
      if(panel&&!panel.hidden&&!panel.contains(event.target)&&!toggle.contains(event.target)){
        panel.hidden=true;toggle.setAttribute('aria-expanded','false');
      }
    });
    const beam=()=>{if(typeof window.studybeamBeamPanel?.open==='function')window.studybeamBeamPanel.open();else $('beamLauncher')?.click()};
    $('dashboardOpenBeam')?.addEventListener('click',beam);
    $('dashboardBeamChat')?.addEventListener('click',beam);
    $('displayNameForm')?.addEventListener('submit',()=>queueMicrotask(render));
    for(const id of ['grade','schoolPathway','schoolType','schoolVariant','subject']){
      $(id)?.addEventListener('change',()=>queueMicrotask(render));
    }
    for(const key of ['studybeam:planner-updated','studybeam:learning-updated','studybeam:demo-quiz-completed']){
      document.addEventListener(key,render);
    }
    window.addEventListener('pageshow',render);
    window.addEventListener('storage',event=>{
      if(!event.key || ['studybeam-calendar-v1','studybeam-grades-v1','studybeam-goals-v1','sw-display-name','sw-school-profile','sw-learning-history','sw-last','sw-dashboard-accent-v1'].includes(event.key)){
        if(event.key==='sw-dashboard-accent-v1')appearance();
        render();
      }
    });
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)render()});
  }
  bind();render();
  (async()=>{
    try{
      catalogue=await (window.studybeamCatalogue||fetch('./curriculum/catalogue.json').then(r=>{if(!r.ok)throw Error('Catalogue indisponible');return r.json()}));
    }catch{catalogue=null}
    render();
  })();
})();
