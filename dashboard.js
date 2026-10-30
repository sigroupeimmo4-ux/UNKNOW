/* Présentation des seules données locales réelles. Aucun résultat simulé. */
(() => {
  const storage=window.studybeamStorage;
  if(!storage)return;
  const make=(tag,text,cls)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;return el;};
  function action(text,url,cls='btn'){const a=make('a',text,cls);a.href=url;return a;}
  const raw=storage.json('sw-learning-history');
  let records=Array.isArray(raw?.items)?raw.items.slice(0,20):[];
  function remember(id){
    if(typeof id!=='string'||!/^[a-z0-9-]+$/.test(id))return;
    records=[{id,at:new Date().toISOString()},...records.filter(item=>item?.id!==id)].slice(0,20);
    storage.set('sw-learning-history',JSON.stringify({items:records}));
  }
  window.studybeamDashboard={remember,refresh:()=>render()};
  const welcomes=document.querySelectorAll('[data-welcome]');
  function greeting(){const name=(storage.get('sw-display-name')||'').trim().slice(0,50);welcomes.forEach(el=>el.textContent=name?'Bonjour '+name+' !':'Bonjour !');}
  greeting();
  const nameForm=document.getElementById('displayNameForm');
  if(nameForm){const input=document.getElementById('displayName');input.value=(storage.get('sw-display-name')||'').slice(0,50);nameForm.onsubmit=event=>{event.preventDefault();storage.set('sw-display-name',input.value.trim().slice(0,50));greeting();document.getElementById('displayNameStatus').textContent='Prénom enregistré sur cet appareil.';};}
  const score=key=>{const value=storage.get(key);return value!==null&&/^[0-3]$/.test(value)?Number(value):null;};
  async function render(){
    let valid=[];let available=false;
    try{
      const data=await (window.studybeamCatalogue||fetch('./curriculum/catalogue.json').then(response=>{if(!response.ok)throw new Error();return response.json();}));
      available=true;
      for(const item of records){
        if(!item||typeof item.id!=='string'||!Number.isFinite(Date.parse(item.at)))continue;
        const program=data.programs.find(p=>p.domains.some(domain=>domain.chapters.some(ch=>ch.id===item.id)));
        if(!program||program.reference_status!=='verified'||!program.effective_from||program.effective_from>'2026-09-01'||program.effective_until&&program.effective_until<'2027-08-31')continue;
        const chapter=program.domains.flatMap(domain=>domain.chapters).find(ch=>ch.id===item.id);
        if(!data.contents.some(c=>c.kind==='course'&&c.review_status==='verified'&&c.program_id===program.id&&c.program_version===program.version&&c.chapter_ids.includes(chapter.id)))continue;
        if(!valid.some(v=>v.id===chapter.id))valid.push({id:chapter.id,title:chapter.title,at:item.at});
      }
    }catch{/* Une indisponibilité du catalogue ne produit pas de faux historique. */}
    for(const box of document.querySelectorAll('[data-resume]')){
      box.replaceChildren();const panel=make('section',undefined,'resume-card');panel.append(make('div','REPRENDRE MON APPRENTISSAGE','section-kicker'));
      if(valid.length){const last=valid[0];panel.append(make('h2',last.title),make('p','Dernier cours consulté sur cet appareil.','muted'),action('Reprendre le cours →','./cours.html?lesson='+encodeURIComponent(last.id)));}
      else panel.append(make('h2',available?'Ton prochain petit pas commence ici.':'Ton espace d’apprentissage'),make('p',available?'Découvre les ressources disponibles et choisis une notion à explorer.':'L’historique ne peut pas être vérifié pour le moment.','muted'),action('Découvrir les programmes →','./programmes.html'));
      box.append(panel);
    }
    for(const box of document.querySelectorAll('[data-learning-summary]')){
      box.replaceChildren();const panel=make('section',undefined,'learning-summary');const head=make('div',undefined,'summary-heading');head.append(make('h2','Ma progression'),action('Voir le détail →','./app.html#progress','text-link'));panel.append(head);
      const stats=make('div',undefined,'summary-stats');
      for(const [label,value,detail] of [['Cours consultés',available?String(valid.length):'—','Historique local, jusqu’à 20 cours'],['Chapitres terminés','—','La fin d’un chapitre n’est pas suivie'],['Dernier quiz',score('sw-last')===null?'—':score('sw-last')+'/3','Quiz de démonstration uniquement']]){const stat=make('div',undefined,'summary-stat');stat.append(make('span',label),make('strong',value),make('small',detail));stats.append(stat);}
      const note=make('div',undefined,'summary-notes');
      const core=window.studybeamPlannerData;
      if(core){
        const grades=core.gradeSummary(core.parseList(storage.get('studybeam-grades-v1')));
        const goals=core.goalItems(storage.get('studybeam-goals-v1'));
        const revisions=core.upcomingEvents(core.parseList(storage.get('studybeam-calendar-v1')),new Date(),7,60).filter(e=>e.type==='revision'&&!e.overdue);
        note.append(make('p',grades.length?'Notes suivies : '+grades.length+' matière(s), consulte leur évolution plus haut.':'Notes suivies : ajoute tes notes pour voir tes moyennes.'));
        note.append(make('p',revisions.length?'Révisions planifiées sur les 7 prochains jours : '+revisions.length+'.':'Révisions planifiées : aucune dans les 7 prochains jours.'));
        note.append(make('p',goals.length?'Objectifs personnels : '+goals.filter(x=>x.done).length+'/'+goals.length+' réalisés.':'Objectifs personnels : aucun objectif encore enregistré.'));
      }else note.append(make('p','Tes données locales ne peuvent pas être lues pour le moment.'));
      panel.append(stats,note);box.append(panel);
    }
  }
  if(document.querySelector('[data-resume],[data-learning-summary]'))render();
})();
