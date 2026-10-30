/* Beam3D — vrai runtime glTF, aucun faux squelette ni fausse animation. */
(() => {
 'use strict';
 const modelURL='./assets/beam-rigged.glb';
 const names=['idle','greet','think','talk','happy','rest','fly'];
 let active=null;
 async function mount(host){
  if(!host||host.dataset.beam3d)return null;
  host.dataset.beam3d='loading';
  try{
   const probe=await fetch(modelURL,{method:'HEAD'});
   if(!probe.ok)throw Error('Official rigged model not installed');
   const THREE=await import('https://esm.sh/three@0.170.0');
   const {GLTFLoader}=await import('https://esm.sh/three@0.170.0/examples/jsm/loaders/GLTFLoader.js');
   const gltf=await new GLTFLoader().loadAsync(modelURL);
   const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,.1,100);
   const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
   renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;
   const canvas=renderer.domElement;canvas.className='beam-3d-canvas';canvas.setAttribute('aria-hidden','true');host.append(canvas);
   scene.add(new THREE.AmbientLight(0xffffff,2));
   const light=new THREE.DirectionalLight(0xffffff,2);light.position.set(2,3,4);scene.add(light);
   const root=gltf.scene;scene.add(root);
   const bounds=new THREE.Box3().setFromObject(root),size=bounds.getSize(new THREE.Vector3());
   root.position.sub(bounds.getCenter(new THREE.Vector3()));
   const height=Math.max(size.y,.1);camera.position.set(0,height*.15,Math.max(height*2.7,2));camera.lookAt(0,0,0);
   const mixer=new THREE.AnimationMixer(root);
   const clips=new Map(gltf.animations.map(clip=>[clip.name.toLowerCase(),clip]));
   let action=null,frame=0,shown=true,last=performance.now();
   const reduced=matchMedia('(prefers-reduced-motion: reduce)');
   function play(state){
    if(!names.includes(state)||!clips.has(state))return false;
    const next=mixer.clipAction(clips.get(state));next.reset();
    if(['greet','happy'].includes(state)){next.setLoop(THREE.LoopOnce,1);next.clampWhenFinished=true;}
    else next.setLoop(THREE.LoopRepeat,Infinity);
    next.play();if(action&&action!==next)action.crossFadeTo(next,.3,false);action=next;return true;
   }
   function resize(){const r=host.getBoundingClientRect(),w=Math.max(r.width,1),h=Math.max(r.height,1);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
   const ro=new ResizeObserver(resize);ro.observe(host);resize();
   const io=new IntersectionObserver(items=>{shown=items.some(x=>x.isIntersecting)});io.observe(host);
   function tick(now){frame=requestAnimationFrame(tick);if(!shown||document.hidden||reduced.matches||document.documentElement.classList.contains('beam-quiet')){last=now;return;}mixer.update(Math.min((now-last)/1000,.05));last=now;renderer.render(scene,camera);}
   play('idle');tick(last);host.dataset.beam3d='ready';host.classList.add('beam-3d-ready');
   active={play,availableStates:[...clips.keys()],dispose(){cancelAnimationFrame(frame);ro.disconnect();io.disconnect();mixer.stopAllAction();renderer.dispose();canvas.remove();host.classList.remove('beam-3d-ready');}};
   return active;
  }catch{host.dataset.beam3d='unavailable';host.classList.remove('beam-3d-ready');return null;}
 }
 window.studybeamBeam3D={mount,play:state=>active?.play(state)||false,get ready(){return !!active},modelURL};
 document.addEventListener('studybeam:beam-state',e=>{if(typeof e.detail?.state==='string')active?.play(e.detail.state);});
 function attach(){
  document.querySelectorAll('.beam-launcher img').forEach(img=>{
   if(img.closest('[data-beam-3d-host]'))return;
   const host=document.createElement('span');host.className='beam-avatar-host';host.dataset.beam3dHost='';
   img.parentNode.insertBefore(host,img);host.append(img);mount(host);
  });
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',attach,{once:true});else attach();
 window.studybeamBeam3D.attach=attach;
})();
