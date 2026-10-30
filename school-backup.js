/* StudyBeam — import/export validated for local school tools; no network calls. */
(function (root, factory) {
  const api=factory();
  if(typeof module==='object' && module.exports)module.exports=api;
  if(root)root.studybeamSchoolBackup=api;
})(typeof window!=='undefined'?window:null,function(){
  'use strict';
  const MAX_ITEMS=1500;
  const VALID_TYPES=new Set(['evaluation','revision','devoir']);
  const VALID_REPEAT=new Set(['none','weekly']);
  const VALID_REMINDERS=new Set(['none','1d','3h','1h']);
  const MAX_FILE_BYTES=1024*1024;
  const text=(value,max)=>typeof value==='string'?value.trim().slice(0,max):'';
  function validDate(v){
    if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v))return false;
    const [year,month,day]=v.split('-').map(Number);
    const parsed=new Date(Date.UTC(year,month-1,day));
    return parsed.getUTCFullYear()===year&&parsed.getUTCMonth()===month-1&&parsed.getUTCDate()===day;
  }
  const validTime=v=>typeof v==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(v);
  function normalizeItems(section,items){
    if(!['calendar','grades'].includes(section))throw new Error('Type de sauvegarde non reconnu.');
    if(!Array.isArray(items)||items.length>MAX_ITEMS)throw new Error('Le fichier doit contenir au plus 1 500 entrées.');
    const ids=new Set();
    return items.map((item,i)=>{
      if(!item||typeof item!=='object'||Array.isArray(item))throw new Error('Entrée '+(i+1)+' invalide.');
      const id=text(item.id,100)||'import-'+(i+1);
      if(ids.has(id))throw new Error('Identifiants dupliqués dans le fichier.');
      ids.add(id);
      if(!validDate(item.date))throw new Error('Date invalide pour l’entrée '+(i+1)+'.');
      if(section==='calendar'){
        const title=text(item.title,120),subject=text(item.subject,80),start=item.start,end=item.end;
        const type=item.type,repeat=item.repeat||'none',reminder=item.reminder||'none';
        if(!title||!subject||!VALID_TYPES.has(type)||!VALID_REPEAT.has(repeat)||!VALID_REMINDERS.has(reminder)||!validTime(start)||!validTime(end)||end<=start)throw new Error('Événement incomplet ou invalide : '+(i+1)+'.');
        const completedDates=item.completedDates===undefined?[]:item.completedDates;
        if(!Array.isArray(completedDates)||completedDates.length>800||completedDates.some(d=>!validDate(d)))throw new Error('Dates de révision terminées invalides.');
        return {id,date:item.date,title,subject,type,start,end,chapter:text(item.chapter,120),description:text(item.description,1000),repeat,reminder,done:item.done===true,completedDates:[...new Set(completedDates)]};
      }
      const subject=text(item.subject,80),label=text(item.label,100),score=Number(item.score),max=Number(item.max);
      if(!subject||!Number.isFinite(score)||!Number.isFinite(max)||max<=0||score<0||score>max||max>10000)throw new Error('Note ou barème invalide : '+(i+1)+'.');
      return {id,date:item.date,subject,label,score,max};
    });
  }
  function decode(textInput,expectedSection){
    if(typeof textInput!=='string'||textInput.length>MAX_FILE_BYTES)throw new Error('Fichier trop volumineux.');
    let parsed;
    try{parsed=JSON.parse(textInput)}catch{throw new Error('Ce fichier JSON est illisible.');}
    if(!parsed||parsed.format!=='studybeam-local-v1'||parsed.section!==expectedSection)throw new Error('Ce fichier ne correspond pas à cette rubrique StudyBeam.');
    return normalizeItems(expectedSection,parsed.items);
  }
  return {MAX_FILE_BYTES,validDate,validTime,normalizeItems,decode};
});
