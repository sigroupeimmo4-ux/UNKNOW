'use strict';
const assert=require('node:assert/strict');
const planner=require('../planner-data.js');
const date=planner.day;
assert.equal(planner.iso(date('2026-10-30')),'2026-10-30');
assert.equal(date('2026-02-31'),null,'invalid calendar dates are rejected');
assert.equal(date('not-a-date'),null);
assert.deepEqual(planner.parseList('{not json'),[]);
assert.deepEqual(planner.parseList('{"items":[]}'),[]);
const today=new Date(2026,9,30,12);
const events=[
  {id:'r1',title:'Mathématiques',type:'revision',subject:'Mathématiques',repeat:'weekly',date:'2026-10-23',start:'17:00',done:false},
  {id:'e1',title:'Contrôle français',type:'evaluation',subject:'Français',date:'2026-11-03',start:'09:00'},
  {id:'old',title:'Exposé terminé',type:'devoir',date:'2026-10-29',done:true},
  {id:'invalid',title:'Bad date',type:'devoir',date:'2026-02-31'}
];
const upcoming=planner.upcomingEvents(events,today,14,50);
assert(upcoming.some(x=>x.title==='Mathématiques'&&x.date==='2026-10-30'&&x.today));
assert(upcoming.some(x=>x.title==='Mathématiques'&&x.date==='2026-11-06'&&x.repeat));
assert(upcoming.some(x=>x.title==='Contrôle français'&&x.date==='2026-11-03'));
assert(!upcoming.some(x=>x.id==='old'||x.id==='invalid'));
assert(!upcoming.some(x=>x.title==='Mathématiques'&&x.date==='2026-10-23'&&x.overdue===false));
assert.equal(planner.upcomingEvents([{...events[0],completedDates:['2026-10-30']}],today,0,30).filter(x=>x.today).length,0);
const overdue=planner.upcomingEvents([{id:'d',title:'À rendre',type:'devoir',date:'2026-10-28'}],today,5);
assert.equal(overdue[0].overdue,true);
const grades=planner.gradeSummary([
 {id:'n1',subject:'Mathématiques',date:'2026-10-25',score:8,max:10},
 {id:'n2',subject:'Mathématiques',date:'2026-10-28',score:14,max:20},
 {id:'n3',subject:'Français',date:'2026-10-26',score:15,max:20},
 {id:'n4',subject:'Mathématiques',date:'2026-10-26',score:22,max:20},
 {id:'n5',subject:'Français',date:'2026-02-31',score:20,max:20},
]);
const maths=grades.find(x=>x.subject==='Mathématiques');
assert.equal(maths.count,2);
assert.equal(maths.average,15);
assert.equal(maths.last,14);
assert.equal(grades.find(x=>x.subject==='Français').average,15);
assert.deepEqual(planner.gradeSummary([]),[]);
assert.equal(planner.goalItems([{id:'a',text:' Relire la fiche ',done:true}])[0].text,'Relire la fiche');
console.log('OK — study planner date, recurrence, grades, invalid data and goals checks');
