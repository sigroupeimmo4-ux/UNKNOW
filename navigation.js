/* Navigation partagée : pages statiques, barre latérale et routes existantes. */
(() => {
  const desktop=matchMedia('(min-width: 901px)'),menu=document.querySelector('[data-main-menu]');
  if(!menu)return;
  const collapse=document.getElementById('sidebarCollapse'),summary=menu.querySelector('summary');
  const palettes={PastelDream:['#FAF9F5','#527F99','#EAF3F4']};
  // Theme choices are retained for compatibility, but Pastel Dream is the single official site palette.
  const applyTheme=()=>{for(const key of ['--bg','--primary','--soft']) document.documentElement.style.removeProperty(key);};
  window.studybeamAppearance={palettes,applyTheme};
  try{applyTheme();const size=localStorage.getItem('sw-size');if(['16','18','20','22'].includes(size))document.documentElement.style.fontSize=size+'px';}catch{}
  const header=document.querySelector('.design-topbar');
  if(header&&typeof ResizeObserver==='function'){const update=()=>document.documentElement.style.setProperty('--chrome-height',header.getBoundingClientRect().height+'px');new ResizeObserver(update).observe(header);update();}

  const backdrop=document.createElement('button');backdrop.id='sidebarBackdrop';backdrop.type='button';backdrop.setAttribute('aria-label','Fermer le menu');backdrop.hidden=true;document.body.append(backdrop);
  function backdropState(){backdrop.hidden=desktop.matches||!menu.open;summary.setAttribute('aria-expanded',String(menu.open));}
  function close(){menu.open=false;backdropState();}
  const adapt=()=>{menu.open=desktop.matches;backdropState();};
  adapt();desktop.addEventListener('change',adapt);menu.addEventListener('toggle',backdropState);
  backdrop.onclick=()=>{close();summary.focus();};
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!desktop.matches&&menu.open){close();summary.focus();}});
  menu.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{if(!desktop.matches)close();}));
  document.addEventListener('click',event=>{
    if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||event.button!==0)return;
    const link=event.target.closest('a[href^="./app.html#"]');if(!link||typeof window.showPage!=='function')return;
    const target=new URL(link.href);if(target.pathname!==location.pathname||target.origin!==location.origin)return;
    const route=target.hash.slice(1);if(!['dragon','progress','settings','tutor','demo'].includes(route))return;
    event.preventDefault();window.showPage(route);
  });
  function compact(value){document.documentElement.toggleAttribute('data-sidebar-collapsed',value);collapse?.setAttribute('aria-expanded',String(!value));collapse?.setAttribute('aria-label',value?'Agrandir la barre latérale':'Réduire la barre latérale');}
  try{compact(localStorage.getItem('sw-sidebar-collapsed')==='true');}catch{compact(false);}
  if(collapse)collapse.onclick=()=>{const value=!document.documentElement.hasAttribute('data-sidebar-collapsed');compact(value);try{localStorage.setItem('sw-sidebar-collapsed',String(value));}catch{}};
  function active(){
    const path=location.pathname.split('/').pop()||'index.html',hash=location.hash;
    const aliases={'a-propos.html':'index.html','forgot-password.html':'login.html','reset-password.html':'login.html','auth-callback.html':'login.html'};
    const routePath=path==='ressource.html'?(['exercise','assessment'].includes(new URLSearchParams(location.search).get('kind'))?'quiz.html':'cours.html'):(aliases[path]||path);
    for(const link of menu.querySelectorAll('.app-nav a')){
      const target=new URL(link.href),same=target.pathname.split('/').pop()===routePath;
      const route=path==='app.html'?(hash.startsWith('#demo-')?'#demo':hash==='#home'?'':hash):'';
      if(same&&target.hash===route)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');
    }
    const library=document.getElementById('libraryBreadcrumbs');
    const name=(library?Array.from(library.children).slice(1).map(el=>el.textContent.trim()).join(' / '):'')||document.title.replace(/ — StudyBeam.*$/,'');
    const title=document.getElementById('topPageName');if(title){title.textContent=name;title.title=name;}
  }
  active();addEventListener('hashchange',active);addEventListener('popstate',active);
  new MutationObserver(active).observe(document.querySelector('title'),{childList:true,subtree:true,characterData:true});
  const crumbs=document.getElementById('libraryBreadcrumbs');if(crumbs)new MutationObserver(active).observe(crumbs,{childList:true,subtree:true});
})();
