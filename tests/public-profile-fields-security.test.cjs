const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const builds=['jogos/calculus-royale/player.js','jogos/calculus-royale-src/client/public/player.js'];
for(const p of builds){
 test(p+' public endpoints request only explicit columns',()=>{
  const src=fs.readFileSync(path.join(root,p),'utf8');
  for(const endpoint of ['player_profiles?public_slug=eq.','game_stats?user_id=eq.']){
   const line=src.split('\n').find(line=>line.includes(endpoint));
   assert.ok(line,'missing endpoint '+endpoint);
   assert.equal(line.includes('select=*'),false,'public endpoint must avoid wildcard select');
  }
 });
}
