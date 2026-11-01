/* Contrôles de non-régression du tableau de bord StudyBeam. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
const html=read('app.html'),css=read('dashboard-v2.css'),js=read('dashboard-v2.js');
new vm.Script(js,{filename:'dashboard-v2.js'});
new vm.Script(read('dashboard.js'),{filename:'dashboard.js'});
new vm.Script(read('planner-dashboard.js'),{filename:'planner-dashboard.js'});
const home=html.slice(html.indexOf('<section id="home"'),html.indexOf('<section id="demo"'));
assert.match(home,/data-dashboard-version="2"/);
assert.match(html,/dashboard-v2\.css\?v=pastel-20261101/);
assert.match(html,/dashboard-v2\.js\?v=dashboard-20261101/);
for(const id of ['dashboardDailyFocus','dashboardStatCards','dashboardIdentity','dashboardBeamAdvice','dashboardGradesSummary','dashboardFavoriteSubjects','dashboardAccentChoice','dashboardOpenBeam','dashboardBeamChat','pathSummary','homeProgress','grade','schoolPathway']){
  assert.match(html,new RegExp('id="'+id+'"'),'missing '+id);
}
for(const route of ['cours.html','fiches.html','audio.html','quiz.html','videos.html','calendrier.html','mes-notes.html']){
  assert.ok(html.includes('href="./'+route+'"'),'missing route '+route);
}
for(const value of ['#BBDCF2','#C5E9D9','#F8DCCE','#F7E9AC','#F2DCE8','#FAF9F5','#527F99','#34434A']){
  assert.ok(css.includes(value)||js.includes(value),'missing official color '+value);
}
assert.match(css,/not\(\[data-library\]\)/);
assert.match(css,/@media\(max-width:560px\)/);
assert.match(css,/prefers-reduced-motion/);
assert.ok(js.includes("Cours terminés',value:'—'"),'completion must not be fabricated');
assert.ok(js.includes("Chapitres révisés',value:'—'"),'chapter completion must not be fabricated');
assert.ok(js.includes("Réussite aux quiz',value:'—'"),'global quiz rate must not be fabricated');
assert.ok(js.includes("'studybeam-grades-v1'"),'separate manually entered grades');
assert.ok(js.includes("'sw-last'"),'demonstration quiz score distinct');
assert.ok(js.includes("'studybeam-calendar-v1'"),'real calendar used');
assert.ok(js.includes("window.studybeamBeamPanel.open"),'must open existing Beam dock');
assert.ok(!js.includes('.innerHTML'), 'dashboard must build nodes safely');
assert.ok(html.includes('assets/studybeam-logo.webp?v=dragon-1'),'official mascot retained');
assert.match(read('dashboard.js'),/dataset\.dashboardVersion/);
assert.match(read('planner-dashboard.js'),/studybeam:planner-updated/);
assert.match(read('scripts/build_navigation_pages.py'),/\('app\.html','Tableau de bord','home'\)/);
assert.match(read('scripts/build_navigation_pages.py'),/\('calendrier\.html','Calendrier','programmes'\)/);
assert.match(read('scripts/build_navigation_pages.py'),/\('mes-notes\.html','Mes résultats scolaires','progress'\)/);
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(ids.length,new Set(ids).size,'Duplicate IDs in app HTML');
console.log('StudyBeam dashboard v2: source, routes, storage separation, CSS, safety and JS syntax OK.');
