const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const dirs=['jogos/calculus-royale','jogos/calculus-royale-src/client/public'];
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

test('public and source copies of player, profile and ranking are identical',()=>{
 for(const file of ['player.js','ranking/index.html','perfil/index.html']){
  assert.equal(read(dirs[0]+'/'+file),read(dirs[1]+'/'+file),'copies diverged: '+file);
 }
});
for(const dir of dirs){
 test(dir+': leaderboard says scores are self-reported',()=>{
  const rank=read(dir+'/ranking/index.html');
  const profile=read(dir+'/perfil/index.html');
  assert.match(rank,/Ranking informal: os resultados são enviados pelos próprios jogadores/);
  assert.match(profile,/estatísticas são informadas pelo jogador e não verificadas pelo servidor/);
  assert.match(rank,/C\.safe\(row\.profile\.username\)/);
 });
 test(dir+': rejects unsupported sort parameters',async()=>{
  const player=read(dir+'/player.js');
  const context=vm.createContext({window:{},document:{},localStorage:{},location:{}});
  vm.runInContext(player,context);
  await assert.rejects(
   context.window.CalculusCloud.leaderboard('user_id.desc,secret.asc'),
   /Ordenação de ranking inválida/
  );
  assert.match(player,/const stats = \{ user_id: s\.user\.id, \.\.\.localProgress\(\)/);
 });
}
