const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const publicRoot=path.join(root,'jogos/calculus-royale-src/client/public');
const source=fs.readFileSync(path.join(publicRoot,'firebase-cloud.js'),'utf8');
const modulePromise=import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
function storage(entries={}){
 const values=new Map(Object.entries(entries));
 return {values,getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};
}
function service(createFirebaseCloud,{user='alice',saved={},local={wins:1}}={}){
 const auth={currentUser:user?{uid:user}:null},documents=new Map(Object.entries(saved)),writes=[],queries=[];
 const store=storage({'calculus-royale:wins':'1','calculus-royale:cloud-session':'DO NOT UPLOAD'});
 let closed=false;
 const sdk={
  doc:(_,name,id)=>name+'/'+id,collection:(_,name)=>name,
  getDoc:async key=>({exists:()=>documents.has(key),data:()=>documents.get(key)}),
  setDoc:async(key,data)=>{writes.push(key);documents.set(key,data);},
  query:(name,...conditions)=>({name,conditions}),where:(...args)=>({where:args}),limit:value=>({limit:value}),orderBy:(...args)=>({orderBy:args}),
  getDocs:async q=>{queries.push(q);return {docs:[]};},
  onSnapshot:(q,next)=>{queries.push(q);next({docs:[]});return ()=>{closed=true;};},
  serverTimestamp:()=> 'SERVER_TIMESTAMP',
  signInWithEmailAndPassword:async()=>{auth.currentUser={uid:'alice'};},
  createUserWithEmailAndPassword:async()=>{auth.currentUser={uid:'alice'};},
  signOut:async()=>{auth.currentUser=null;}
 };
 const adapter=createFirebaseCloud({auth,db:{},sdk,localProgress:()=>local,storage:store});
 return {adapter,auth,sdk,store,documents,writes,queries,closed:()=>closed};
}

test('Firebase snapshots exclude credentials and unrelated application data',async()=>{
 const {readSave,restoreSave}=await modulePromise;
 const old=storage({'calculus-royale:wins':'12','calculus-royale:cloud-session':'secret','ldm:estacao':'private note'});
 const snapshot=readSave(old);assert.deepEqual(JSON.parse(snapshot),{'calculus-royale:wins':'12'});
 const next=storage({'calculus-royale:wins':'0','calculus-royale:coins':'90','calculus-royale:cloud-session':'keep'});
 restoreSave(next,snapshot);assert.equal(next.getItem('calculus-royale:wins'),'12');
 assert.equal(next.getItem('calculus-royale:coins'),null);assert.equal(next.getItem('calculus-royale:cloud-session'),'keep');
});
test('empty or oversized saves cannot overwrite a cloud save',async()=>{
 const {readSave}=await modulePromise;assert.throws(()=>readSave(storage()),/Jogue/);
 assert.throws(()=>readSave(storage({'calculus-royale:player-name':JSON.stringify('x'.repeat(200000))})),/limite/);
});
test('malformed restores leave device storage unchanged',async()=>{
 const {restoreSave}=await modulePromise;
 const original={'calculus-royale:wins':'7'};
 for(const json of ['null','[]','{}','{broken',JSON.stringify({'calculus-royale:cloud-session':'"token"'}),JSON.stringify({'calculus-royale:wins':7}),JSON.stringify({'calculus-royale:wins':'broken'})]){
  const target=storage(original);assert.throws(()=>restoreSave(target,json));assert.deepEqual(Object.fromEntries(target.values),original);
 }
});
test('a failed restore rolls back previously changed game keys',async()=>{
 const {restoreSave}=await modulePromise;const target=storage({'calculus-royale:wins':'7','calculus-royale:coins':'10'});
 const set=target.setItem;let fail=true;
 target.setItem=(key,value)=>{if(key==='calculus-royale:coins'&&fail){fail=false;throw Error('quota');}return set(key,value);};
 assert.throws(()=>restoreSave(target,JSON.stringify({'calculus-royale:wins':'8','calculus-royale:coins':'20'})));
 assert.equal(target.getItem('calculus-royale:wins'),'7');assert.equal(target.getItem('calculus-royale:coins'),'10');
});
test('normalized sessions do not expose Firebase tokens',async()=>{
 const {createFirebaseCloud}=await modulePromise;const h=service(createFirebaseCloud);
 assert.deepEqual(await h.adapter.session(),{user:{id:'alice'}});await h.adapter.logout();assert.equal(await h.adapter.session(),null);
});
test('reading the profile and own stats does not auto-upload or overwrite',async()=>{
 const {createFirebaseCloud}=await modulePromise;const save={payload_json:'{}',summary:{wins:18}};
 const h=service(createFirebaseCloud,{saved:{'players/alice':{user_id:'alice',username:'Alice'},'progress/alice':save}});
 await h.adapter.getProfile();assert.equal((await h.adapter.getMyStats()).wins,18);assert.equal(h.writes.length,0);
 assert.equal(h.documents.get('progress/alice'),save);
});
test('uploads use the signed-in UID and never publish scores',async()=>{
 const {createFirebaseCloud}=await modulePromise;const h=service(createFirebaseCloud);
 await h.adapter.syncProgress({user:{id:'bob'}});assert.deepEqual(h.writes,['progress/alice']);
 const doc=h.documents.get('progress/alice');assert.equal(doc.user_id,'alice');assert.ok(!doc.payload_json.includes('DO NOT UPLOAD'));
 assert.equal(doc.updated_at,'SERVER_TIMESTAMP');assert.ok(!h.documents.has('leaderboard/alice'));
});
test('guests cannot save or restore',async()=>{
 const {createFirebaseCloud}=await modulePromise;const h=service(createFirebaseCloud,{user:null});
 await assert.rejects(h.adapter.syncProgress(),/Entre/);await assert.rejects(h.adapter.restoreProgress(),/Entre/);assert.equal(h.writes.length,0);
});
test('profile creation excludes email and uses an unambiguous owner slug',async()=>{
 const {createFirebaseCloud}=await modulePromise;const h=service(createFirebaseCloud);
 const profile=await h.adapter.ensureProfile({user:{id:'bob'}},'Alice');
 assert.equal(profile.public_slug,'jogador-alice');assert.equal(profile.user_id,'alice');assert.equal('email' in profile,false);
 assert.deepEqual(h.writes,['players/alice']);
});
test('ranking queries are bounded, reject arbitrary sorting and unsubscribe',async()=>{
 const {createFirebaseCloud}=await modulePromise;const h=service(createFirebaseCloud);let rows;
 const stop=h.adapter.subscribeLeaderboard('completed_worlds.desc,xp.desc',value=>rows=value,()=>{});
 assert.deepEqual(rows,[]);assert.deepEqual(h.queries[0].conditions,[{orderBy:['completed_worlds','desc']},{orderBy:['xp','desc']},{limit:100}]);
 stop();assert.ok(h.closed());await assert.rejects(h.adapter.leaderboard('__proto__'),/inválida/);
});
test('cloud stats cannot introduce strings or non-finite numeric UI values',async()=>{
 const {cleanStats}=await modulePromise;const value=cleanStats({wins:'<b>bad</b>',coins:Infinity,xp:-7,level:1.5,trophies:99999999999});
 assert.equal(value.wins,0);assert.equal(value.coins,0);assert.equal(value.xp,0);assert.equal(value.level,1);assert.equal(value.trophies,2000000000);
});
test('unconfigured Firebase does not make any external request',async()=>{
 const calls=[],context=vm.createContext({window:{CalculusCloudConfig:{provider:'firebase',firebase:null}},fetch:()=>calls.push('request')});
 vm.runInContext(fs.readFileSync(path.join(publicRoot,'player.js'),'utf8'),context);
 assert.equal(await context.window.CalculusCloud.session(),null);
 await assert.rejects(context.window.CalculusCloud.signIn('test@example.invalid','synthetic'),/ainda não/);
 assert.equal(calls.length,0);
});
for(const file of ['cloud-config.js','firebase-runtime.js','firebase-cloud.js','perfil/index.html','ranking/index.html'])test('Firebase source and published copies match: '+file,()=>{
 assert.equal(fs.readFileSync(path.join(publicRoot,file),'utf8'),fs.readFileSync(path.join(root,'jogos/calculus-royale',file),'utf8'));
});
