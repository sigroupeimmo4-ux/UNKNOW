/* Référentiel vidéos approuvées : lecture publique sans clés secrètes. */
(() => {
 'use strict';
 const box=document.getElementById('studybeamVideoRecommendations');
 if(!box)return;
 const api=window.STUDYBEAM_SUPABASE_URL,key=window.STUDYBEAM_SUPABASE_ANON_KEY;
 const status=document.getElementById('videoRecommendationsStatus');
 const state={grade:'',pathway:'',subject_id:'',chapter_id:''};
 const parameters=new URLSearchParams(location.search);
 const ids=['grade','pathway','subjectId','chapterId'];
 const getValue=id=>parameters.get(id)||'';
 const text=(tag,content,cl)=>{const e=document.createElement(tag);e.textContent=content;if(cl)e.className=cl;return e;};
 function show(videos){
  box.replaceChildren();
  if(!videos.length){status.textContent='Aucune vidéo vérifiée pour ce chapitre. Les suggestions non validées ne sont pas affichées.';return;}
  status.textContent=videos.length+' vidéo(s) pédagogiques validée(s) pour le parcours sélectionné.';
  for(const video of videos){
   const article=text('article','', 'video-recommendation');
   const a=document.createElement('a');a.textContent=video.title;a.href=video.url;a.target='_blank';a.rel='noopener noreferrer nofollow';
   const meta=text('p',[video.channel,video.duration_seconds?Math.floor(video.duration_seconds/60)+' min':'Durée non indiquée',video.language.toUpperCase()].filter(Boolean).join(' · '),'small muted');
   article.append(a,meta,text('p',video.description||'Vidéo pédagogique validée.'),text('span','Validée par StudyBeam','video-verified'));
   box.append(article);
  }
 }
 async function load(){
  const selection=window.studybeamVideoSelection||window.studybeamSchool?.getSelection()||{};
  const grade=getValue('grade')||selection.grade,pathway=getValue('pathway')||selection.pathway;
  const subjectId=getValue('subjectId')||selection.subjectId,chapterId=getValue('chapterId')||selection.chapterId;
  if(!grade||!pathway||!subjectId||!chapterId){show([]);status.textContent='Choisis une classe, une matière et un chapitre pour afficher les vidéos validées.';return;}
  if(!api||!key){status.textContent='Catalogue vidéo temporairement indisponible.';return;}
  const q=new URLSearchParams({select:'title,channel,duration_seconds,description,language,url',school_year:'eq.2026-2027',grade:'eq.'+grade,pathway:'eq.'+pathway,subject_id:'eq.'+subjectId,chapter_id:'eq.'+chapterId,status:'eq.approved',order:'relevance_score.desc.nullslast',limit:'12'});
  status.textContent='Recherche des recommandations vérifiées…';
  try {const result=await fetch(api+'/rest/v1/studybeam_videos?'+q,{headers:{apikey:key,Accept:'application/json'},signal:AbortSignal.timeout(10000)});
   if(!result.ok)throw Error('Catalogue indisponible');
   const records=await result.json();show(Array.isArray(records)?records.filter(v=>{try{return new URL(v.url).protocol==='https:'}catch{return false}}):[]);
  }catch{box.replaceChildren();status.textContent='Impossible de charger les recommandations. Réessaie plus tard.';}
 }
 window.studybeamVideoRecommendations={reload:load};
 load();
 document.addEventListener('change',event=>{if(['grade','schoolPathway','subject','chapter','curriculumGrade','curriculumSubject','curriculumChapter'].includes(event.target.id))setTimeout(load,0)});
})();
