const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

test('privacy notice explains that Supabase is selected and Firebase is not active',()=>{
  const notice=read('privacidade.html');
  const configuration=read('jogos/calculus-royale/cloud-config.js');
  assert.match(configuration,/provider: 'supabase'/);
  assert.match(configuration,/firebase: null/);
  assert.match(notice,/configurado para autenticação e estatísticas no Supabase/);
  assert.match(notice,/alternativa técnica para Firebase, mas ela não está ativada/);
});

test('privacy notice does not misrepresent ongoing LGPD work as certified compliance',()=>{
  const notice=read('privacidade.html');
  assert.match(notice,/Minuta informativa em revisão/);
  assert.match(notice,/ainda não é uma declaração de conformidade com a LGPD/);
  assert.match(notice,/crianças e adolescentes/i);
  assert.match(notice,/prazos de conservação/);
});

test('session tokens stored in the browser are disclosed, not in leaderboard markup',()=>{
  const notice=read('privacidade.html');
  const profile=read('jogos/calculus-royale/perfil/index.html');
  const ranking=read('jogos/calculus-royale/ranking/index.html');
  assert.match(notice,/tokens de autenticação e renovação no armazenamento local/);
  assert.match(profile,/privacidade\.html/);
  assert.match(ranking,/privacidade\.html/);
  assert.doesNotMatch(ranking,/refresh_token|service_role|access_token/);
});

test('technical data map records exposure separately from actual server authority',()=>{
  const map=read('docs/mapa-de-dados-calculus-royale-lgpd.md');
  assert.match(map,/public\.player_profiles/);
  assert.match(map,/public\.game_stats/);
  assert.match(map,/calculus-royale:cloud-session/);
  assert.match(map,/pontuação|pontuações|Pontuação|Pontos/);
  assert.match(map,/não verificados|não é verificada|não verificada/);
});
