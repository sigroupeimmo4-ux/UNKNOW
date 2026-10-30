/* Beam — aide guidée hors ligne au sens "sans IA", fondée sur les 3 leçons CP déjà vérifiées. 
   Ne transmet jamais la question au serveur d'IA; charge seulement un JSON local autorisé. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object' && module.exports)module.exports=api;
  if(root)root.studybeamLessonGuide=api;
})(typeof window!=='undefined'?window:null,function(){
 'use strict';
 const TOPICS=Object.freeze({
  dizaines:{id:'cp-dizaines-unites',name:'Dizaines et unités',pattern:/dizaine|unite|decompos|groupement|paquet|numeration|37|58/i},
  comparer:{id:'cp-comparer-nombres',name:'Comparer les nombres',pattern:/compar|ranger|croissant|decroissant|plus.grand|plus.petit|inferieur|superieur/i},
  droite:{id:'cp-droite-graduee',name:'Droite graduée',pattern:/droite|gradu|avant|apres|repere|trait|intervalle/i}
 });
 const LIST='Je peux déjà t’aider sur trois chapitres de mathématiques CP : « dizaines et unités », « comparer les nombres » et « droite graduée ». Essaie « explique les dizaines », « exercice sur la droite graduée » ou « fiche sur les comparaisons ». Pour les autres matières, explore les cours disponibles.';
 function normalize(value){return String(value||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').slice(0,500);}
 function pick(question){
  const q=normalize(question);
  // Specific subject takes precedence over the fallback list.
  for(const topic of Object.values(TOPICS))if(topic.pattern.test(q))return topic;
  return null;
 }
 function classify(question){
  const q=normalize(question);
  if(/quiz|teste|test|question|evaluation/.test(q))return 'quiz';
  if(/corrig|solution|reponse.*exercice/.test(q))return 'solution';
  if(/exercice|entrain|indice|aide.moi/.test(q))return 'exercise';
  if(/fiche|resume|revis|essentiel|retenir/.test(q))return 'sheet';
  return 'explain';
 }
 function validLesson(data,topic){
  return data && data.id===topic.id && data.program_id==='CP-mathematiques-commun'
   && typeof data.guided_explanation==='string' && data.guided_explanation.length>25
   && Array.isArray(data.revision_sheet) && Array.isArray(data.exercises) && Array.isArray(data.quiz);
 }
 async function respond(question,fetcher){
  const topic=pick(question);
  if(!topic)return {text:LIST,guide:true,links:[{label:'Explorer les cours',href:'./cours.html'}]};
  const mode=classify(question),load=fetcher||((path)=>fetch(path,{cache:'force-cache'}));
  let lesson;
  try{
   const response=await load('./curriculum/lessons/'+topic.id+'.json');
   if(!response?.ok)throw new Error('not_found');
   lesson=await response.json();
   if(!validLesson(lesson,topic))throw new Error('invalid_lesson');
  }catch{return {text:'Le contenu pédagogique de ce chapitre ne peut pas être chargé pour le moment. Tu peux ouvrir la page du cours et réessayer.',guide:true,links:[{label:'Ouvrir le cours',href:'./cours.html?lesson='+topic.id}]};}
  const head=topic.name+' (mathématiques CP) — ';
  const links=[{label:'Voir le cours vérifié',href:'./cours.html?lesson='+topic.id}];
  let content;
  if(mode==='sheet'){
   content='À retenir : '+lesson.revision_sheet.slice(0,5).filter(s=>typeof s==='string').join(' ');
   links.push({label:'Lire la fiche',href:'./fiches.html?lesson='+topic.id});
  }else if(mode==='exercise'){
   const item=lesson.exercises[0];
   content=item&&typeof item.prompt==='string'?'À toi de jouer : '+item.prompt+' Indice : '+(item.success_criterion||'Réfléchis étape par étape.'):'Ouvre le cours et retrouve les exercices.';
   links.push({label:'Voir les exercices',href:'./ressource.html?kind=exercise&lesson='+topic.id});
  }else if(mode==='solution'){
   const item=lesson.exercises[0];
   content=item&&typeof item.solution==='string'?'Correction du premier exercice : '+item.solution:'La correction est dans la ressource.';
   links.push({label:'Voir les corrections',href:'./ressource.html?kind=exercise&lesson='+topic.id});
  }else if(mode==='quiz'){
   content='Tu peux tester ce chapitre avec son quiz de '+lesson.quiz.length+' questions, préparé à partir du contenu existant.';
   links.push({label:'Commencer le quiz',href:'./quiz.html?lesson='+topic.id});
  }else{
   content='Explication guidée : '+lesson.guided_explanation;
  }
  return {text:head+content+' (Réponse préparée, sans IA générative.)',guide:true,links};
 }
 return {normalize,pick,classify,respond,TOPICS};
});
