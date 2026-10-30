(() => {
  const desktop=matchMedia('(min-width: 901px)');
  document.querySelectorAll('[data-main-menu]').forEach(menu=>{
    const adapt=()=>{menu.open=desktop.matches;};
    menu.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{if(!desktop.matches)menu.open=false;}));adapt();desktop.addEventListener('change',adapt);
  });
  const path=location.pathname.split('/').pop()||'index.html';
  document.querySelectorAll('[data-main-menu] a').forEach(link=>{
    const target=new URL(link.href);if(target.pathname.split('/').pop()===path && (!target.hash || target.hash===location.hash))link.setAttribute('aria-current','page');
  });
})();
