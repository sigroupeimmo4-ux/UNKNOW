/* StudyBeam: choix clair/sombre local, sans profil serveur ni dépendance externe. */
(function(){
  'use strict';
  const KEY='sw-color-mode-v1';
  const allowed=new Set(['light','dark']);
  const read=()=>{
    try{const value=localStorage.getItem(KEY);return allowed.has(value)?value:'light';}
    catch{return 'light';}
  };
  let mode=read();
  function reflect(){
    document.documentElement.setAttribute('data-studybeam-theme',mode);
    document.documentElement.style.colorScheme=mode;
    const themeColor=document.querySelector('meta[name="theme-color"]');
    if(themeColor)themeColor.setAttribute('content',mode==='dark'?'#121D26':'#FAF9F5');
    document.querySelectorAll('[data-theme-choice]').forEach(button=>{
      const active=button.getAttribute('data-theme-choice')===mode;
      button.setAttribute('aria-pressed',String(active));
      button.classList.toggle('is-active',active);
    });
    document.querySelectorAll('[data-theme-toggle]').forEach(button=>{
      const next=mode==='light'?'dark':'light';
      button.textContent=mode==='light'?'☾':'☀';
      button.setAttribute('aria-label',next==='dark'?'Activer le mode sombre':'Activer le mode clair');
      button.setAttribute('title',next==='dark'?'Passer en mode sombre':'Passer en mode clair');
      button.setAttribute('aria-pressed',String(mode==='dark'));
    });
    const info=document.getElementById('themeModeStatus');
    if(info)info.textContent='Mode '+(mode==='light'?'clair':'sombre')+' activé sur cet appareil.';
  }
  function setMode(value){
    if(!allowed.has(value))return false;
    mode=value;
    try{localStorage.setItem(KEY,value);}catch{}
    reflect();
    document.dispatchEvent(new CustomEvent('studybeam:color-mode',{detail:{mode}}));
    return true;
  }
  function init(){
    const holder=document.querySelector('.top-account')||document.querySelector('.school-top');
    if(holder&&!holder.querySelector('[data-theme-toggle]')){
      const button=document.createElement('button');
      button.type='button';button.id='studybeamThemeToggle';button.className='studybeam-theme-toggle';
      button.setAttribute('data-theme-toggle','');
      if(holder.classList.contains('school-top'))holder.append(button);
      else holder.insertBefore(button,holder.firstChild);
    }
    document.querySelectorAll('[data-theme-toggle]').forEach(button=>{
      button.addEventListener('click',()=>setMode(mode==='light'?'dark':'light'));
    });
    document.querySelectorAll('[data-theme-choice]').forEach(button=>{
      button.addEventListener('click',()=>setMode(button.getAttribute('data-theme-choice')));
    });
    reflect();
  }
  window.studybeamColorMode={get:()=>mode,set:setMode};
  reflect(); // avant la peinture initiale si le script est dans <head>
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
  window.addEventListener('storage',event=>{
    if(event.key===KEY||event.key===null){mode=read();reflect();}
  });
})();
