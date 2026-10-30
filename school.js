(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const labels = {commun:'Enseignements communs',generale:'Générale',technologique:'Technologique',professionnelle:'Professionnelle','generale-technologique':'Générale et technologique'};
  let catalogue, selection = {}, loaded = false;
  function options(id,items,value) {
    const select=$(id);select.replaceChildren(...items.map(item=>new Option(item.title,item.id)));
    if(items.some(item=>item.id===value))select.value=value;
    select.disabled=!items.length;
    return select.value;
  }
  function render(next = {}) {
    const grade=options('grade',[...new Set(catalogue.scopes.map(s=>s.grade))].map(id=>({id,title:id})),next.grade);
    const scopes=catalogue.scopes.filter(s=>s.grade===grade);
    const pathway=options('schoolPathway',scopes.map(s=>({id:s.pathway,title:labels[s.pathway]})),next.pathway);
    const scope=scopes.find(s=>s.pathway===pathway);
    const type=options('schoolType',[{id:'commun',title:'Commun'},{id:'specialite',title:'Spécialité'},{id:'option',title:'Option'}].filter(t=>scope.subjects.some(s=>s.teaching_type===t.id)),next.type);
    const variant=options('schoolVariant',[{id:'',title:'Choisir une série'},...(scope.variants||[])],next.variant);
    $('schoolVariantField').hidden=pathway!=='technologique';
    const subjects=scope.subjects.filter(s=>s.teaching_type===type && (!s.variant || s.variant===variant));
    const subjectId=options('subject',subjects,next.subjectId || 'mathematiques-commun');
    const program=catalogue.programs.find(p=>p.scope_id===scope.id&&p.subject_id===subjectId);
    const chapters=program?.reference_status==='verified' && program.effective_from<='2026-09-01' && (!program.effective_until||program.effective_until>='2027-08-31') ? program.domains.flatMap(d=>d.chapters) : [];
    const chapterId=options('chapter',chapters.length ? chapters : [{id:'',title:'Aucun chapitre disponible'}],next.chapterId);
    $('chapter').disabled=!chapters.length;
    selection={grade,pathway,type,variant,subjectId,chapterId};
    const context=getContext();
    $('pathSummary').textContent=[grade,labels[pathway],context.subject,context.chapter].filter(Boolean).join(' · ');
    $('schoolStatus').textContent=!subjects.length?'Choisis une série pour consulter les spécialités recensées.':chapters.length?'Premières activités disponibles pour cette sélection. La couverture du programme reste partielle.':'Matière recensée : les chapitres et activités restent à intégrer ou à vérifier. Aucun exemple de démonstration ne les remplace.';
  }
  function getContext() {
    return {grade:selection.grade||'',pathway:selection.pathway||'',type:selection.type||'',variant:selection.variant||'',subject:$('subject').selectedOptions[0]?.textContent||'',chapter:selection.chapterId ? $('chapter').selectedOptions[0]?.textContent||'' : ''};
  }
  function setSelection(next,persist = false) {
    if(!loaded)return;
    render({...selection,...next});
    if(persist) window.studybeamStorage.set('sw-school-profile',JSON.stringify(selection));
  }
  const ready=(async()=>{
    try {
      catalogue=await window.studybeamCatalogue;loaded=true;
      const saved=window.studybeamStorage.json('sw-school-profile');
      let initial=saved || {grade:'CP',pathway:'commun',type:'commun',subjectId:'mathematiques-commun'};
      // Lecture seule des anciens choix ; les anciens chapitres libres ne deviennent pas officiels.
      if(!saved){const legacy=window.studybeamStorage.json('sw-profile');if(legacy && catalogue.scopes.some(s=>s.grade===legacy.grade)){
        const scope=catalogue.scopes.find(s=>s.grade===legacy.grade);
        const subject=scope.subjects.find(s=>s.title.toLocaleLowerCase('fr')===String(legacy.subject||'').toLocaleLowerCase('fr'));
        initial={grade:legacy.grade,pathway:scope.pathway,type:subject?.teaching_type||'commun',subjectId:subject?.id};
      }}
      render(initial);
      for(const id of ['grade','schoolPathway','schoolType','schoolVariant','subject','chapter'])$(id).addEventListener('change',()=>{
        const next={grade:$('grade').value,pathway:$('schoolPathway').value,type:$('schoolType').value,variant:$('schoolVariant').value,subjectId:$('subject').value,chapterId:$('chapter').value};
        if(id==='grade'){next.pathway='';next.variant='';next.subjectId='';next.chapterId='';}
        if(['schoolPathway','schoolType','schoolVariant'].includes(id)){next.subjectId='';next.chapterId='';}
        if(id==='subject')next.chapterId='';
        setSelection(next,true);
      });
      return true;
    } catch {
      $('schoolStatus').textContent='Le parcours scolaire ne peut pas être chargé. Réessaie le chargement ; les démonstrations restent accessibles.';
      $('schoolRetry').hidden=false;return false;
    }
  })();
  window.studybeamSchool={ready,getSelection:()=>({...selection}),getContext,setSelection};
})();
