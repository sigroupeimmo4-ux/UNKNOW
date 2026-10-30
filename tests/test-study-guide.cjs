'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const guide=require('../beam-study-guide.js');
const root=path.resolve(__dirname,'..');
const lessons=new Set(['cp-dizaines-unites','cp-comparer-nombres','cp-droite-graduee']);
let requested=[];
async function local(pathname){
 requested.push(pathname);
 const match=pathname.match(/^\.\/curriculum\/lessons\/(cp-[a-z-]+)\.json$/);
 assert(match&&lessons.has(match[1]),'Only allowlisted lesson JSON may be requested');
 return {ok:true,json:async()=>JSON.parse(fs.readFileSync(path.join(root,'curriculum','lessons',match[1]+'.json'),'utf8'))};
}
(async()=>{
 assert.equal(guide.pick('Explique les dizaines').id,'cp-dizaines-unites');
 assert.equal(guide.pick('Comparer deux nombres').id,'cp-comparer-nombres');
 assert.equal(guide.pick('Exercice sur la droite graduée').id,'cp-droite-graduee');
 assert.equal(guide.classify('Fiche sur les comparaisons'),'sheet');
 assert.equal(guide.classify('quiz sur les dizaines'),'quiz');
 const a=await guide.respond('Explique les dizaines',local);
 assert(a.text.includes('Explication guidée')&&a.text.includes('Réponse préparée'));
 assert(a.text.includes('sachets')||a.text.includes('billes'));
 assert(a.links.some(x=>x.href==='./cours.html?lesson=cp-dizaines-unites'));
 const b=await guide.respond('exercice sur la droite graduée',local);
 assert(b.text.includes('À toi de jouer')&&b.text.includes('Indice'));
 const c=await guide.respond('fiche sur les comparaisons',local);
 assert(c.text.includes('À retenir'));
 const d=await guide.respond('quiz sur les dizaines',local);
 assert(d.links.some(x=>x.href==='./quiz.html?lesson=cp-dizaines-unites'));
 const n=requested.length;
 const unknown=await guide.respond('Explique-moi les fractions',local);
 assert(unknown.text.includes('trois chapitres')&&requested.length===n,'Unknown topics must not trigger remote loading');
 const errors=await guide.respond('explique les dizaines',async()=>({ok:false}));
 assert(errors.text.includes('ne peut pas être chargé'));
 const catalog=JSON.parse(fs.readFileSync(path.join(root,'data/videos.json'),'utf8'));
 assert.equal(catalog.configured,true);
 assert.equal(catalog.videos.length,3);
 assert(catalog.review_scope.includes('NON'));
 const ids=new Set();
 for(const video of catalog.videos){
   const u=new URL(video.url);
   assert.equal(u.protocol,'https:');assert.equal(u.hostname,'www.lumni.fr');
   assert(video.url.startsWith('https://www.lumni.fr/video/'));
   assert.equal(video.grade,'CP');assert.equal(video.pathway,'commun');assert.equal(video.subjectId,'mathematiques-commun');
   assert(lessons.has(video.chapterId));assert(!ids.has(video.chapterId));ids.add(video.chapterId);
   assert(video.source.includes('Réseau Canopé'));
 }
 const app=fs.readFileSync(path.join(root,'app.html'),'utf8');
 assert(app.indexOf('beam-study-guide.js')<app.indexOf('beam-assistant.js'));
 for(const html of ['index.html','calendrier.html','mes-notes.html']){
   const txt=fs.readFileSync(path.join(root,html),'utf8');
   assert(txt.indexOf('beam-study-guide.js')<txt.indexOf('beam-global.js'),html);
 }
 const signup=fs.readFileSync(path.join(root,'signup.html'),'utf8');
 assert(signup.includes('id="adultTester"')&&signup.includes('name="adultTester" required'));
 console.log('OK — Beam guide grounded in 3 CP lessons, 3 sourced Lumni videos, app scripts and beta notice');
})().catch(error=>{console.error(error);process.exitCode=1});
