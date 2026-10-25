const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const builds=['jogos/calculus-royale/player.js','jogos/calculus-royale-src/client/public/player.js'];
for(const p of builds){
 test(p+' public endpoints request only explicit columns',()=>{
  const src=fs.readFileSync(path.join(root,p),'utf8');
  const lines=src.split('\n');
  const profile=lines.find(line=>line.includes('player_profiles?public_slug=eq.'));
  const stats=lines.find(line=>line.includes('game_stats?user_id=eq.')&&line.includes('profile.user_id'));
  assert.ok(profile,'missing public profile endpoint');
  assert.ok(stats,'missing public game stats endpoint');
  for(const line of [profile,stats]){
   assert.equal(line.includes('select=*'),false,'public endpoint must avoid wildcard select');
   assert.match(line,/select=[\w,]+/,'public endpoint must list explicit columns');
  }
 });
}
