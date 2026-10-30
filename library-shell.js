/* État en lecture seule pour les nouvelles pages : aucune migration de données. */
(() => {
  let selected={grade:'CP',pathway:'commun',type:'commun',variant:'',subjectId:'mathematiques-commun',chapterId:''};
  const ready=(async()=>{try{
    const data=await window.studybeamCatalogue;
    const saved=window.studybeamStorage.json('sw-school-profile');
    if(saved && data.scopes.some(s=>s.grade===saved.grade&&s.pathway===saved.pathway))selected={...selected,...saved};
    else {const legacy=window.studybeamStorage.json('sw-profile');if(legacy){const scope=data.scopes.find(s=>s.grade===legacy.grade);if(scope){const subject=scope.subjects.find(s=>s.title.toLowerCase()===String(legacy.subject||'').toLowerCase());selected={...selected,grade:scope.grade,pathway:scope.pathway,type:subject?.teaching_type||'commun',subjectId:subject?.id||''};}}}
    return true;
  }catch{return false;}})();
  window.studybeamSchool={ready,getSelection:()=>({...selected}),setSelection:next=>{selected={...selected,...next};},getContext:()=>({...selected})};
  window.showPage=id=>{
    const files={home:'app.html',curriculum:'programmes.html',course:'cours.html',sheets:'fiches.html',audio:'audio.html',quiz:'quiz.html',videos:'videos.html'};
    const views=new Set(['tutor','progress','settings','demo','demo-course','demo-sheets','demo-audio','demo-quiz']);
    location.assign('./'+(files[id]||'app.html'+(views.has(id)?'#'+id:'')));
  };
  const palettes={Lavande:['#f6f4ff','#6859d9','#efecff'],Rose:['#fff4f7','#b94778','#ffe7f0'],Menthe:['#f1faf5','#28795b','#dcf4e8'],Ciel:['#f1f8ff','#2867a7','#deedff'],Neutre:['#f4f4f3','#45484d','#e8e8e5']};
  const theme=window.studybeamStorage.get('sw-theme');const values=Object.hasOwn(palettes,theme)?palettes[theme]:palettes.Lavande;
  ['--bg','--primary','--soft'].forEach((name,i)=>document.documentElement.style.setProperty(name,values[i]));
  const size=window.studybeamStorage.get('sw-size');if(['16','18','20','22'].includes(size))document.documentElement.style.fontSize=size+'px';
  if(typeof ResizeObserver==='function'){
    const update=()=>document.documentElement.style.setProperty('--app-header-height',document.querySelector('.topbar').getBoundingClientRect().height+'px');
    new ResizeObserver(update).observe(document.querySelector('.topbar'));update();
  }
  addEventListener('pagehide',()=>window.speechSynthesis?.cancel());
})();
