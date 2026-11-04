'use strict';
(()=>{
  const menu=document.getElementById('home-menu'),toggle=document.getElementById('menu-toggle');
  if(!menu||!toggle)return;
  document.body.classList.add('js');
  toggle.hidden=false;
  const setMenu=open=>{menu.classList.toggle('is-open',open);toggle.setAttribute('aria-expanded',String(open));};
  toggle.addEventListener('click',()=>setMenu(toggle.getAttribute('aria-expanded')!=='true'));
  menu.addEventListener('keydown',event=>{if(event.key==='Escape'){setMenu(false);toggle.focus();}});
  menu.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>setMenu(false)));
  // Preserve old links to the former home catalog.
  function redirectOldCatalog(){if(['#atividades','#fundamental','#ensino-medio','#ensino-superior','#professores'].includes(location.hash)){
    history.replaceState(null,'','#explorar');
    document.getElementById('explorar').scrollIntoView({block:'start',behavior:'instant'});
  }}
  window.addEventListener('hashchange',redirectOldCatalog);
  redirectOldCatalog();
})();
