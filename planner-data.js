/* StudyBeam — calculs pédagogiques locaux, aucune note ou échéance fictive. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.studybeamPlannerData = api;
})(typeof window !== 'undefined' ? window : null, function () {
  'use strict';
  const MAX_RECORDS = 1500;
  function parseList(value) {
    try {
      const items = typeof value === 'string' ? JSON.parse(value || '[]') : value;
      return Array.isArray(items) ? items.filter(x => x && typeof x === 'object' && !Array.isArray(x)).slice(0, MAX_RECORDS) : [];
    } catch { return []; }
  }
  function iso(date) {
    return [date.getFullYear(), String(date.getMonth()+1).padStart(2,'0'), String(date.getDate()).padStart(2,'0')].join('-');
  }
  function day(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const [y,m,d] = value.split('-').map(Number), result = new Date(y,m-1,d,12,0,0,0);
    return iso(result) === value ? result : null;
  }
  function shift(date, days) {
    const next = new Date(date.getFullYear(),date.getMonth(),date.getDate(),12);
    next.setDate(next.getDate()+days);
    return next;
  }
  function upcomingEvents(items, now = new Date(), horizon = 14, maxItems = 24) {
    const today = new Date(now.getFullYear(),now.getMonth(),now.getDate(),12);
    const result = [], seen = new Set();
    for (const item of parseList(items)) {
      const start = day(item.date);
      if (!start || !item.title || !['evaluation','revision','devoir'].includes(item.type)) continue;
      const weekly = item.repeat === 'weekly';
      if (item.done && !weekly) continue;
      for (let i = -7; i <= horizon; i++) {
        const date = shift(today,i), dateKey=iso(date);
        if (date < start) continue;
        const diff = Math.round((date-start)/86400000);
        if (weekly ? diff % 7 !== 0 : diff !== 0) continue;
        if (weekly && (item.done || (Array.isArray(item.completedDates) && item.completedDates.includes(dateKey)))) continue;
        const id = String(item.id || item.title) + '|' + dateKey;
        if (seen.has(id)) continue;
        seen.add(id);
        result.push({ id:String(item.id||''),title:String(item.title).slice(0,120),date:dateKey,
          start:typeof item.start === 'string' && /^\d{2}:\d{2}$/.test(item.start) ? item.start : '',
          subject:String(item.subject||'').slice(0,80),type:item.type,overdue:i<0,today:i===0,repeat:weekly});
        if (!weekly) break;
      }
    }
    result.sort((a,b)=>(a.date+'T'+a.start).localeCompare(b.date+'T'+b.start) || a.title.localeCompare(b.title,'fr'));
    return result.slice(0,Math.max(0,Math.min(maxItems,100)));
  }
  function gradeSummary(items) {
    const groups=new Map();
    for(const item of parseList(items)) {
      const score=Number(item.score),max=Number(item.max),subject=String(item.subject||'').trim().slice(0,80);
      if (!subject || !Number.isFinite(score) || !Number.isFinite(max) || max<=0 || score<0 || score>max || !day(item.date)) continue;
      const val=Math.round(score/max*2000)/100;
      if(!groups.has(subject)) groups.set(subject,[]);
      groups.get(subject).push({value:val,date:item.date});
    }
    return [...groups.entries()].map(([subject,arr])=>{
      arr.sort((a,b)=>a.date.localeCompare(b.date));
      return {subject,count:arr.length,average:Math.round(arr.reduce((sum,x)=>sum+x.value,0)/arr.length*100)/100,last:arr[arr.length-1].value};
    }).sort((a,b)=>a.subject.localeCompare(b.subject,'fr'));
  }
  function goalItems(value) {
    return parseList(value).slice(0,12).filter(x=>typeof x.text==='string' && x.text.trim()).map(x=>({
      id:String(x.id||''),text:x.text.trim().slice(0,120),done:!!x.done
    }));
  }
  return {parseList,iso,day,upcomingEvents,gradeSummary,goalItems};
});
