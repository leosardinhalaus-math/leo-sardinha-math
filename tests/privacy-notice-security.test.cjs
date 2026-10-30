const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=(file)=>fs.readFileSync(path.join(root,file),'utf8');

test('public data notice is accessible as a local privacy page',()=>{
  const privacy=read('privacidade.html');
  assert.match(privacy,/<html lang="pt-BR">/);
  assert.match(privacy,/Minuta informativa em revisão/);
  assert.match(privacy,/Crianças e adolescentes/);
  assert.match(privacy,/Supabase/);
  assert.match(privacy,/dados pessoais/);
});

for(const area of ['jogos/calculus-royale','jogos/calculus-royale-src/client/public']){
  test(area+' warns prospective registrants about public usernames',()=>{
    const html=read(area+'/perfil/index.html');
    assert.match(html,/O cadastro online é opcional/);
    assert.match(html,/não revele seu nome completo, escola ou outros dados pessoais/);
    assert.match(html,/href="\.\.\/\.\.\/\.\.\/privacidade\.html"/);
    assert.match(html,/estatísticas são informadas pelo jogador/);
  });
  test(area+' labels unverified public ranking and links privacy policy',()=>{
    const html=read(area+'/ranking/index.html');
    assert.match(html,/Ranking informal: os resultados são enviados pelos próprios jogadores/);
    assert.match(html,/O nome de jogador e as pontuações ficam públicos/);
    assert.match(html,/href="\.\.\/\.\.\/\.\.\/privacidade\.html"/);
  });
}
test('two copies of pages are identical for privacy notices',()=>{
  for(const page of ['perfil/index.html','ranking/index.html']){
    assert.equal(read('jogos/calculus-royale/'+page),read('jogos/calculus-royale-src/client/public/'+page));
  }
});
test('CI security regressions include all Calculus Royale source paths',()=>{
  const yaml=read('.github/workflows/security-regressions.yml');
  const list=yaml.match(/'jogos\/calculus-royale-src\/\*\*'/g)||[];
  assert.equal(list.length,2);
  assert.doesNotMatch(yaml,/calculus-royale-src\/client\/public\/\*\*/);
});
