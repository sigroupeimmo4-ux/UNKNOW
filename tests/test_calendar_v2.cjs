/* StudyBeam calendar v2: assertions without external test dependencies. */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const js=read('school-tools.js');
const html=read('calendrier.html');
const css=read('calendar-v2.css');

new vm.Script(js,{filename:'school-tools.js'});
assert.match(html,/data-school-tool="calendar"/);
assert.match(html,/calendar-v2\.css\?v=calendar-v2-20261101/);
assert.match(html,/school-tools\.js\?v=calendar-v2-20261101/);
assert.match(html,/aria-current="page"/);
assert.match(css,/body\[data-school-tool="calendar"\]/);
assert.match(css,/@media\(max-width:730px\)/);
assert.match(css,/prefers-reduced-motion/);
for(const color of ['#DDD6F7','#CFE7F7','#D8F0E4','#F6D9E8'])assert.ok(css.includes(color));
for(const feature of ['calendar-stats','calendar-day-agenda','calendar-filters','calendar-list','calendar-reminders'])assert.ok(js.includes(feature));
assert.ok(js.includes('Exporter mes données (JSON)'));
assert.ok(js.includes('Importer une sauvegarde (JSON)'));
assert.ok(js.includes('function initGrades(){'));

const start=js.indexOf('function occurrences(start,end){');
const end=js.indexOf('  const matches=item=>',start);
assert.ok(start!==-1&&end>start);
const fragment=js.slice(start,end);
const toDay=iso=>new Date(iso+'T12:00:00');
const dateVal=d=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
const plusDays=(d,n)=>{const result=new Date(d);result.setDate(result.getDate()+n);return result};
const validDate=d=>typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&dateVal(toDay(d))===d;
const make=new Function('data','validDate','toDay','plusDays','dateVal','allowed','formatTime',fragment+';return occurrences;');
const data=[
  {id:'weekly',date:'2026-09-07',type:'revision',start:'17:00',end:'18:00',title:'Réviser',repeat:'weekly',done:false,completedDates:['2026-11-02']},
  {id:'once',date:'2026-11-04',type:'evaluation',start:'08:00',end:'09:00',title:'Évaluation',repeat:'none',done:false},
  {id:'bad-date',date:'2026-02-30',type:'revision',start:'08:00',title:'Invalide',repeat:'none'},
  {id:'bad-type',date:'2026-11-02',type:'unknown',start:'10:00',title:'Type invalide',repeat:'none'}
];
const list=make(data,validDate,toDay,plusDays,dateVal,new Set(['evaluation','revision','devoir']),v=>v);
const entries=list('2026-11-01','2026-11-15');
assert.deepEqual(entries.map(x=>[x.id,x.day,x.done]),[
  ['weekly','2026-11-02',true],['once','2026-11-04',false],['weekly','2026-11-09',false]
]);
assert.equal(list('2026-09-01','2026-09-06').length,0);
assert.equal(list('2026-11-11','2026-11-11').length,0);
assert.ok(js.includes("direction*7"),'Week arrows must move by seven days');
assert.ok(js.includes('new Date(cursor.getFullYear(),cursor.getMonth()+direction,1)'),'Month arrows must change month safely');
assert.ok(js.includes('selected=dateVal(cursor)'),'Navigation must reset selected date');
console.log('StudyBeam calendar v2: syntax, navigation, persistence, recurrence and style checks passed.');
