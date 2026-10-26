const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const base=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(base,p),'utf8');

test('published and source account/ranking pages remain synchronized',()=>{
  for(const page of ['perfil/index.html','ranking/index.html']){
    assert.equal(read('jogos/calculus-royale/'+page),read('jogos/calculus-royale-src/client/public/'+page));
  }
});

test('account fields have programmatic labels and login status is announced',()=>{
  const html=read('jogos/calculus-royale/perfil/index.html');
  for(const id of ['email','password','username']){
    assert.match(html,new RegExp('<label for="'+id+'">'));
    assert.match(html,new RegExp('<input id="'+id+'"'));
  }
  assert.match(html,/id="authMsg"[^>]*role="status"[^>]*aria-live="polite"/);
  assert.match(html,/id="email"[^>]*autocomplete="email"/);
  assert.match(html,/id="password"[^>]*autocomplete="current-password"/);
  assert.match(html,/id="username"[^>]*autocomplete="nickname"/);
});

test('sorting buttons expose pressed state and update it when selected',()=>{
  const html=read('jogos/calculus-royale/ranking/index.html');
  assert.match(html,/data-sort="trophies\.desc" aria-pressed="true"/);
  assert.match(html,/data-sort="best_tower_wave\.desc" aria-pressed="false"/);
  assert.match(html,/item\.setAttribute\('aria-pressed',String\(selected\)\)/);
});

test('published profile, site and main game have visible keyboard focus styles',()=>{
  assert.match(read('jogos/calculus-royale/player.css'),/:focus-visible/);
  assert.match(read('assets/site.css'),/:focus-visible/);
  const main=read('jogos/calculus-royale-src/client/src/main.tsx');
  assert.match(main,/import "\.\/accessibility\.css";/);
  assert.match(read('jogos/calculus-royale-src/client/src/accessibility.css'),/:focus-visible/);
});

test('reduced-motion mode disables decorative animation but not gameplay simulation',()=>{
  const scene=read('jogos/calculus-royale-src/client/src/game/scene.ts');
  assert.match(scene,/matchMedia\?\.\('\(prefers-reduced-motion: reduce\)'\)/);
  assert.match(scene,/visual\.mixer\.update\(reducedMotion\?0:dt\)/);
  assert.match(scene,/preview\?\.mixer\.update\(reducedMotion\?0:dt\)/);
  assert.match(scene,/worldTime\+=reducedMotion\?0:dt/);
  assert.match(scene,/synchronize\(\)/);
  const css=read('jogos/calculus-royale-src/client/src/accessibility.css');
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(css,/animation-duration:\.01ms!important/);
  assert.match(css,/transition-duration:\.01ms!important/);
});
