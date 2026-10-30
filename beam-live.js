/* Beam Live: geometric 3D character with independently animated limbs and face.
   The character is procedural, not a cinema-quality production rig. */
(async()=>{
'use strict';
let T;
try{T=await import('https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js')}catch{return}
const {Scene,PerspectiveCamera,WebGLRenderer,Group,Mesh,SphereGeometry,ConeGeometry,MeshStandardMaterial,AmbientLight,DirectionalLight,Color}=T;
const mat=(c,rough=.65)=>new MeshStandardMaterial({color:c,roughness:rough,metalness:0});
const lavender=mat('#a99ae8'),light=mat('#c6b6fb'),cream=mat('#fff0d9'),gold=mat('#e9ba58',.4),pink=mat('#f5b7cd'),white=mat('#fffdf8'),blue=mat('#2187d9',.27),black=mat('#182635'),mouthDark=mat('#693b58');
const geo=new SphereGeometry(1,24,16);
function ball(parent,color,x,y,z,sx,sy,sz){const mesh=new Mesh(geo,color);mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);parent.add(mesh);return mesh}
function horn(parent,x){const h=new Mesh(new ConeGeometry(.14,.52,14),gold);h.position.set(x,1.06,.03);h.rotation.z=x>0?-.25:.25;parent.add(h)}
function mount(host){
if(host.dataset.beamLive)return;host.dataset.beamLive='pending';
const scene=new Scene(),camera=new PerspectiveCamera(31,1,.1,100);camera.position.set(0,.10,7.4);camera.lookAt(0,-.06,0);
const renderer=new WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6));renderer.setClearColor(0x000000,0);renderer.outputColorSpace=T.SRGBColorSpace;
scene.add(new AmbientLight(0xffffff,2.3));const lamp=new DirectionalLight(0xffffff,2.2);lamp.position.set(-3,5,6);scene.add(lamp);
const dragon=new Group();scene.add(dragon);
const body=new Group();dragon.add(body);
ball(body,lavender,0,-.50,0,.65,.82,.52);
ball(body,cream,0,-.54,.43,.46,.59,.16);
const head=new Group();head.position.y=.53;body.add(head);
ball(head,lavender,0,.15,.02,.91,.78,.77);
ball(head,light,0,-.14,.65,.57,.32,.38);
ball(head,cream,0,-.28,.76,.42,.19,.23);
horn(head,-.59);horn(head,.59);
for(const x of [-.36,.36]){
 ball(head,white,x,.27,.70,.295,.345,.16);
 ball(head,blue,x+(.06*Math.sign(x)),.25,.855,.177,.24,.065);
 ball(head,black,x+(.06*Math.sign(x)),.25,.913,.111,.18,.035);
 ball(head,white,x-.048,.34,.955,.05,.067,.018);
 ball(head,lavender,x,.65,.63,.29,.074,.10);
}
const lids=[ball(head,lavender,-.36,.53,.78,.296,.025,.175),ball(head,lavender,.36,.53,.78,.296,.025,.175)];
for(const x of [-.12,.12])ball(head,lavender,x,-.03,1.005,.04,.032,.018);
const jaw=new Group();jaw.position.set(0,-.41,.83);head.add(jaw);
ball(jaw,mouthDark,0,-.025,0,.255,.037,.07);
ball(jaw,pink,0,-.07,.045,.13,.028,.045);
const wingGroups=[];
for(const side of [-1,1]){
 const wing=new Group();wing.position.set(side*.55,.0,-.25);body.add(wing);wingGroups.push(wing);
 const membrane=ball(wing,pink,side*.52,.20,-.03,.60,.38,.095);membrane.rotation.z=side*.28;
 const ridge=ball(wing,light,side*.28,.32,.02,.45,.07,.11);ridge.rotation.z=side*.42;
 const paw=ball(body,lavender,side*.49,-1.07,.23,.24,.27,.32);
 for(const toe of [-1,0,1])ball(body,cream,side*.49+toe*.14,-1.26,.46,.065,.082,.065);
 const arm=new Group();arm.position.set(side*.57,-.48,.36);body.add(arm);arm.userData.side=side;
 ball(arm,lavender,side*.10,-.15,.11,.22,.31,.22);
 ball(arm,cream,side*.15,-.40,.22,.14,.14,.12);
 if(!body.userData.arms)body.userData.arms=[];body.userData.arms.push(arm);
}
const tail=new Group();tail.position.set(.48,-.77,-.39);body.add(tail);
let pivot=tail;for(let i=0;i<4;i++){const seg=new Group();seg.position.set(.19,0,-.16);pivot.add(seg);ball(seg,i===3?light:lavender,.19,-.05,-.08,.32-i*.045,.19-i*.023,.23-i*.02);seg.rotation.y=.22;pivot=seg;}
const ro=new ResizeObserver(()=>{const r=host.getBoundingClientRect();renderer.setSize(Math.max(r.width,1),Math.max(r.height,1),false);camera.aspect=Math.max(r.width,1)/Math.max(r.height,1);camera.updateProjectionMatrix()});ro.observe(host);
const canvas=renderer.domElement;canvas.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none';host.style.position='relative';host.append(canvas);ro.observe(host);
let state='idle',speech=false,time=0,frame,last=performance.now(),visible=true;
const io=new IntersectionObserver(entries=>{visible=entries.some(x=>x.isIntersecting)});io.observe(host);
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const onState=e=>{const v=e.detail?.state;if(['idle','greet','think','talk','happy','rest','fly'].includes(v))state=v};document.addEventListener('studybeam:beam-state',onState);
function animate(now){frame=requestAnimationFrame(animate);const dt=Math.min((now-last)/1000,.05);last=now;if(!visible||document.hidden)return;time+=dt;
 const quiet=reduced.matches||document.documentElement.classList.contains('beam-quiet');
 const t=quiet?0:time,eff=quiet?0:1;
 dragon.position.y=Math.sin(t*1.25)*.11*eff;dragon.rotation.z=Math.sin(t*.72)*.025*eff;
 body.scale.y=1+Math.sin(t*2.2)*.013*eff;head.rotation.y=Math.sin(t*.6)*.055*eff;
 const blink=quiet?0:(Math.sin(t*1.43)+Math.sin(t*2.71)>.1?0:0);
 // Brief eyelid closure with irregular sine harmonics.
 const phase=(t+(Math.sin(t*.47)*.5))%4.8;
 const closed=phase>4.63?Math.sin((phase-4.63)/.17*Math.PI):0;
 lids.forEach(l=>{l.position.y=.53-closed*.26;l.scale.y=.025+closed*.30});
 wingGroups.forEach((w,i)=>{w.rotation.z=(i?1:-1)*(.06+Math.sin(t*2.4)*.22)*eff});
 body.userData.arms.forEach((arm,i)=>{arm.rotation.z=(i?1:-1)*(state==='greet'?.65+Math.sin(t*7)*.12:.08+Math.sin(t*1.8)*.08)*eff});
 tail.rotation.y=Math.sin(t*1.6)*.24*eff;
 jaw.rotation.x=(speech||state==='talk'?Math.abs(Math.sin(t*13))*.42:state==='happy'?.25:0)*eff;
 head.rotation.z=(state==='think'?.13:0)+Math.sin(t*.9)*.02*eff;
 if(state==='happy'){dragon.position.y+=Math.abs(Math.sin(t*4))*.15*eff;wingGroups.forEach((w,i)=>w.rotation.z=(i?1:-1)*Math.sin(t*8)*.45*eff)}
 renderer.render(scene,camera)}
animate(last);
host.dataset.beamLive='ready';host.classList.add('beam-live-ready');host.querySelector('img')?.setAttribute('aria-hidden','true');
window.studybeamBeamLive={setState:s=>{state=s},setSpeaking:v=>{speech=!!v},speak(text){if(!('speechSynthesis'in window)||typeof text!=='string')return false;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text.slice(0,900));u.lang='fr-FR';u.rate=.95;u.onstart=()=>{speech=true;state='talk'};u.onend=u.onerror=()=>{speech=false;state='idle'};speechSynthesis.speak(u);return true},stop(){speechSynthesis?.cancel();speech=false;state='idle'}};
}
function attach(){const launcher=document.querySelector('.beam-launcher');if(!launcher)return false;let host=launcher.querySelector('.beam-avatar-host');if(!host){const img=launcher.querySelector('img');if(!img)return false;host=document.createElement('span');host.className='beam-avatar-host';img.parentNode.insertBefore(host,img);host.append(img)}mount(host);return true}
if(!attach()){const observer=new MutationObserver(()=>{if(attach())observer.disconnect()});observer.observe(document.documentElement,{subtree:true,childList:true})}
})();