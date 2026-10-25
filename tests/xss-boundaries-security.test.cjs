const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const pages=['jogos/calculus-royale/perfil/index.html','jogos/calculus-royale/ranking/index.html'];
for(const file of pages){
 test(file+' escapes dynamic user-generated content',()=>{
  const text=fs.readFileSync(path.join(root,file),'utf8');
  assert.match(text,/C\.safe\(row\.profile\.username\)|C\.safe\(profile\.username\)/);
  assert.doesNotMatch(text,/innerHTML\s*=\s*(?:row\.profile\.username|profile\.username)/);
 });
}
test('source and published player files stay byte-for-byte identical',()=>{
 const a=fs.readFileSync(path.join(root,'jogos/calculus-royale/player.js'));
 const b=fs.readFileSync(path.join(root,'jogos/calculus-royale-src/client/public/player.js'));
 assert.deepEqual(a,b);
});
