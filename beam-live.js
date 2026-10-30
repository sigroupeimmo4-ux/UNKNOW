/* Beam Live: geometric 3D character with independently animated limbs and face.
   The character is procedural, not a cinema-quality production rig. */
(async()=>{
'use strict';
let T;
try{T=await import('https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js')}catch{return}
const {Scene,PerspectiveCamera,WebGLRenderer,Group,Mesh,SphereGeometry,ConeGeometry,MeshStandardMaterial,AmbientLight,DirectionalLight,Color}=T;
const mat=(c,rough=.65)=>new MeshStandardMaterial({color:c,roughness:rough,metalness:0});
// Nouvelle identité : peau vert pomme, iris marron, détails lilas. Aucun objet tenu en main.
const lavender=mat('#9ADB38'),light=mat('#C4F16B'),cream=mat('#FFF3D4'),gold=mat('#8B58C9',.4),pink=mat('#EFA4C2'),white=mat('#FFFDF8'),blue=mat('#8B4B2B',.27),black=mat('#271D25'),mouthDark=mat('#68364C');
const spines=mat('#A66BD8'),toePurple=mat('#7751BD');
const geo=new SphereGeometry(1,36,24);
function ball(parent,color,x,y,z,sx,sy,sz){const mesh=new Mesh(geo,color);mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);parent.add(mesh);return mesh}
function horn(parent,x){const h=new Mesh(new ConeGeometry(.14,.52,14),gold);h.position.set(x,1.06,.03);h.rotation.z=x>0?-.25:.25;parent.add(h)}
function mount(host){
if(host.dataset.beamLive)return;host.dataset.beamLive='pending';
const scene=new Scene(),camera=new PerspectiveCamera(31,1,.1,100);camera.position.set(0,.08,5.5);camera.lookAt(0,-.06,0);
const renderer=new WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6));renderer.setClearColor(0x000000,0);renderer.outputColorSpace=T.SRGBColorSpace;
scene.add(new AmbientLight(0xffffff,2.3));const lamp=new DirectionalLight(0xffffff,2.2);lamp.position.set(-3,5,6);scene.add(lamp);
const dragon=new Group();scene.add(dragon);
const body=new Group();dragon.add(body);
ball(body,lavender,0,-.50,0,.65,.82,.52);
ball(body,cream,0,-.54,.43,.46,.59,.16);
const head=new Group();head.position.y=.53;body.add(head);
ball(head,lavender,0,.15,.02,1.00,.85,.79);
ball(head,light,0,-.15,.70,.64,.34,.40);
ball(head,cream,0,-.29,.79,.50,.19,.23);
horn(head,-.59);horn(head,.59);
// Crête 3D violette, placée derrière le visage sans cacher ses grands yeux.
for(const [x,y,z,scale] of [[-.34,.90,-.24,.22],[0,1.05,-.35,.28],[.34,.90,-.24,.22]]){
 const spike=new Mesh(new ConeGeometry(scale,scale*2.4,18),spines);
 spike.position.set(x,y,z);spike.rotation.z=x*.25;head.add(spike);
}

for(const x of [-.36,.36]){
 ball(head,white,x,.28,.73,.315,.365,.18);
 ball(head,blue,x+(.06*Math.sign(x)),.27,.90,.19,.25,.07); // iris marron
 ball(head,black,x+(.06*Math.sign(x)),.27,.96,.119,.185,.039);
 ball(head,white,x-.048,.38,1.005,.061,.073,.020);
 ball(head,lavender,x,.65,.63,.29,.074,.10);
}
const lids=[ball(head,lavender,-.36,.55,.80,.316,.025,.184),ball(head,lavender,.36,.55,.80,.316,.025,.184)];
for(const x of [-.12,.12])ball(head,lavender,x,-.03,1.005,.04,.032,.018);
// A warm curved smile, rosy cheeks and a little open-mouth expression.
for(const side of [-1,1])ball(head,pink,side*.70,-.16,.68,.22,.13,.055);
const smile=ball(head,mouthDark,0,-.365,.991,.31,.095,.05);
ball(head,cream,0,-.324,1.035,.29,.060,.026);
const jaw=new Group();jaw.position.set(0,-.44,.88);head.add(jaw);
ball(jaw,mouthDark,0,-.025,0,.255,.037,.07);
ball(jaw,pink,0,-.07,.045,.13,.028,.045);
const wingGroups=[];
for(const side of [-1,1]){
 const wing=new Group();wing.position.set(side*.55,.0,-.25);body.add(wing);wingGroups.push(wing);
 const membrane=ball(wing,pink,side*.52,.20,-.03,.60,.38,.095);membrane.rotation.z=side*.28;
 const ridge=ball(wing,light,side*.28,.32,.02,.45,.07,.11);ridge.rotation.z=side*.42;
 const paw=ball(body,lavender,side*.49,-1.07,.23,.24,.27,.32);
 for(const toe of [-1,0,1])ball(body,toePurple,side*.49+toe*.14,-1.26,.46,.065,.082,.065);
 const arm=new Group();arm.position.set(side*.57,-.48,.36);body.add(arm);arm.userData.side=side;
 ball(arm,lavender,side*.10,-.15,.11,.22,.31,.22);
 ball(arm,light,side*.15,-.40,.22,.14,.14,.12);
 if(!body.userData.arms)body.userData.arms=[];body.userData.arms.push(arm);
}
const tail=new Group();tail.position.set(.48,-.77,-.39);body.add(tail);
let pivot=tail;for(let i=0;i<4;i++){const seg=new Group();seg.position.set(.19,0,-.16);pivot.add(seg);ball(seg,i===3?spines:lavender,.19,-.05,-.08,.32-i*.045,.19-i*.023,.23-i*.02);seg.rotation.y=.22;pivot=seg;}
// Quelques écailles dorsales et doigts libres : Beam ne tient plus d'accessoire.
for(let i=0;i<4;i++){const spike=new Mesh(new ConeGeometry(.13-i*.014,.28-i*.02,16),spines);spike.position.set(0,.07-i*.28,-.53);spike.rotation.x=-.45;body.add(spike)}
const ro=new ResizeObserver(()=>{const r=host.getBoundingClientRect();renderer.setSize(Math.max(r.width,1),Math.max(r.height,1),false);camera.aspect=Math.max(r.width,1)/Math.max(r.height,1);camera.updateProjectionMatrix()});ro.observe(host);
const canvas=renderer.domElement;canvas.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none';host.style.position='relative';host.append(canvas);ro.observe(host);
let state='idle',speech=false,time=0,frame,last=performance.now(),visible=true,lastActivity=performance.now();
const io=new IntersectionObserver(entries=>{visible=entries.some(x=>x.isIntersecting)});io.observe(host);
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const validStates=['idle','greet','think','talk','happy','rest','fly','listen','surprised','dance'];
const onState=e=>{const v=e.detail?.state;if(validStates.includes(v)){state=v;lastActivity=performance.now()}};
document.addEventListener('studybeam:beam-state',onState);
document.addEventListener('pointerdown',()=>{lastActivity=performance.now();if(state==='rest')state='idle'},{passive:true});
function animate(now){frame=requestAnimationFrame(animate);const dt=Math.min((now-last)/1000,.05);last=now;if(!visible||document.hidden)return;time+=dt;
 const quiet=reduced.matches||document.documentElement.classList.contains('beam-quiet');
 const t=quiet?0:time,eff=quiet?0:1;
 if(state==='idle'&&now-lastActivity>120000)state='rest';
 const tired=state==='rest';
 const flying=state==='fly';
 const celebrating=state==='happy'||state==='dance';
 dragon.position.y=Math.sin(t*1.25)*.11*eff;dragon.rotation.z=Math.sin(t*.72)*.025*eff;
 body.scale.y=1+Math.sin(t*2.2)*.013*eff;head.rotation.y=Math.sin(t*.6)*.055*eff;
 
 // Brief eyelid closure with irregular sine harmonics.
 const phase=(t+(Math.sin(t*.47)*.5))%4.8;
 const closed=tired?1:(phase>4.63?Math.max(0,Math.sin((phase-4.63)/.17*Math.PI)):0);
 lids.forEach(l=>{l.position.y=.55-closed*.29;l.scale.y=.025+closed*.33});
 wingGroups.forEach((w,i)=>{w.rotation.z=(i?1:-1)*(.06+Math.sin(t*(flying?8:celebrating?7:2.4))*(flying?.60:celebrating?.50:tired?.04:.22))*eff});
 body.userData.arms.forEach((arm,i)=>{arm.rotation.z=(i?1:-1)*(state==='greet'?.65+Math.sin(t*7)*.12:celebrating?.38+Math.sin(t*6)*.22:state==='surprised'?.55:.08+Math.sin(t*1.8)*.08)*eff});
 tail.rotation.y=Math.sin(t*1.6)*.24*eff;
 jaw.rotation.x=(speech||state==='talk'?Math.abs(Math.sin(t*13))*.42:celebrating?.28:state==='surprised'?.48:0)*eff;
 head.rotation.z=(state==='think'?.13:tired?-.09:state==='listen'?-.06:0)+Math.sin(t*.9)*.02*eff;
 if(celebrating){dragon.position.y+=Math.abs(Math.sin(t*4))*.15*eff;dragon.rotation.y=Math.sin(t*5)*(state==='dance'?.22:.07)*eff;}else if(flying){dragon.position.y+=Math.abs(Math.sin(t*3))*.20*eff;dragon.rotation.z+=Math.sin(t*2)*.10*eff;dragon.rotation.y=Math.sin(t)*.15*eff;}else{dragon.rotation.y=Math.sin(t*.35)*.045*eff;}
 renderer.render(scene,camera)}
animate(last);
host.dataset.beamLive='ready';host.classList.add('beam-live-ready');host.querySelector('img')?.setAttribute('aria-hidden','true');
window.studybeamBeamLive={setState:s=>{state=s},setSpeaking:v=>{speech=!!v},speak(text){if(!('speechSynthesis'in window)||typeof text!=='string')return false;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text.slice(0,900));u.lang='fr-FR';u.rate=.95;u.onstart=()=>{speech=true;state='talk'};u.onend=u.onerror=()=>{speech=false;state='idle'};speechSynthesis.speak(u);return true},stop(){speechSynthesis?.cancel();speech=false;state='idle'}};
}
function attach(){const launcher=document.querySelector('.beam-launcher');if(!launcher)return false;let host=launcher.querySelector('.beam-avatar-host');if(!host){const img=launcher.querySelector('img');if(!img)return false;host=document.createElement('span');host.className='beam-avatar-host';img.parentNode.insertBefore(host,img);host.append(img)}try{mount(host);return true}catch(error){host.dataset.beamLive='unavailable';return false}}
if(!attach()){const observer=new MutationObserver(()=>{if(attach())observer.disconnect()});observer.observe(document.documentElement,{subtree:true,childList:true})}
})();