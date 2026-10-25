const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const files=['jogos/calculus-royale/player.js','jogos/calculus-royale-src/client/public/player.js'];
const SESSION_KEY='calculus-royale:cloud-session';
const PENDING_NAME_KEY='calculus-royale:pending-username';

for(const file of files){
 for(const online of [true,false]){
  test(file+' logout revokes online if reachable, clears local data regardless (online='+online+')', async()=>{
   const source=fs.readFileSync(path.join(root,file),'utf8');
   const storage=new Map([[SESSION_KEY,JSON.stringify({access_token:'TEST_TOKEN_NOT_REAL'})],[PENDING_NAME_KEY,'test']]);
   let reloaded=0;
   const requests=[];
   const ctx=vm.createContext({
    window:{},
    document:{},
    localStorage:{
     getItem:key=>storage.get(key)??null,
     removeItem:key=>storage.delete(key)
    },
    location:{reload:()=>{reloaded++}},
    fetch:async(url,options)=>{
     requests.push({url,options});
     if(!online)throw Error('network unavailable');
     return {ok:true,text:async()=>''};
    }
   });
   vm.runInContext(source,ctx);
   await ctx.window.CalculusCloud.logout();
   assert.equal(storage.has(SESSION_KEY),false);
   assert.equal(storage.has(PENDING_NAME_KEY),false);
   assert.equal(reloaded,1);
   assert.equal(requests.length,1);
   assert.match(requests[0].url,/\/auth\/v1\/logout$/);
   assert.equal(requests[0].options.method,'POST');
   assert.equal(requests[0].options.headers.Authorization,'Bearer TEST_TOKEN_NOT_REAL');
  });
 }
 test(file+' logout without a session still clears pending profile data', async()=>{
   const source=fs.readFileSync(path.join(root,file),'utf8');
   const storage=new Map([[PENDING_NAME_KEY,'test']]);
   let reloaded=0,requests=0;
   const ctx=vm.createContext({
    window:{},document:{},
    localStorage:{getItem:key=>storage.get(key)??null,removeItem:key=>storage.delete(key)},
    location:{reload:()=>{reloaded++}},
    fetch:()=>{requests++;throw Error('unexpected remote call')}
   });
   vm.runInContext(source,ctx);
   await ctx.window.CalculusCloud.logout();
   assert.equal(reloaded,1);
   assert.equal(requests,0);
   assert.equal(storage.size,0);
 });
}
