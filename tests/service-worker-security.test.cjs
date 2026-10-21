const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const origin='https://example.github.io';
const targets=[
 {file:'jogos/calculus-royale/sw.js',scope:'/leo-sardinha-math/jogos/calculus-royale/',cache:'calculus-royale-v4',prefix:'calculus-royale-',navigation:true},
 {file:'jogos/calculus-royale-src/client/public/sw.js',scope:'/leo-sardinha-math/jogos/calculus-royale/',cache:'calculus-royale-v4',prefix:'calculus-royale-',navigation:true},
 {file:'jogos/laboratorio-digital-matematica/service-worker.js',scope:'/leo-sardinha-math/jogos/laboratorio-digital-matematica/',cache:'ldm-v24',prefix:'ldm-v',navigation:false}
];

function harness(target,options={}){
 const base=origin+target.scope,handlers=new Map(),deleted=[],writes=[],requests=[],warnings=[];
 const stores=new Map(['calculus-royale-v2','ldm-v22','outro-jogo-v1',target.cache].map(name=>[name,new Map()]));
 const key=request=>new URL(typeof request==='string'?request:request.url,base).href;
 const response=(source,status=200)=>({source,status,ok:status>=200&&status<300,clone(){return response(source,status);}});
 const caches={
  keys:async()=>[...stores.keys()],
  delete:async name=>{deleted.push(name);return stores.delete(name);},
  open:async name=>{
   if(options.openError)throw Error('simulated unavailable storage');
   if(!stores.has(name))stores.set(name,new Map());
   return {
    addAll:async entries=>{for(const entry of entries)stores.get(name).set(key(entry),response('precache'));},
    match:async request=>{if(options.matchError)throw Error('simulated read failure');return stores.get(name).get(key(request));},
    put:async(request,value)=>{if(options.putError)throw Error('simulated quota limit');writes.push({name,url:key(request)});stores.get(name).set(key(request),value);}
   };
  },
  // A worker must never look through caches belonging to other applications.
  match:async()=>{throw Error('global cache lookup is forbidden');}
 };
 const self={location:{origin},registration:{scope:base},clients:{claim:async()=>{}},skipWaiting:async()=>{},addEventListener:(name,fn)=>handlers.set(name,fn)};
 vm.runInNewContext(fs.readFileSync(path.join(root,target.file),'utf8'),{
  self,caches,URL,Response:{error:()=>response('error',0)},
  Request:class{constructor(url){this.url=key(url);}},
  console:{warn:(...args)=>warnings.push(args)},
  fetch:async request=>{requests.push(key(request));if(options.offline)throw Error('simulated offline');return response('network',options.status??200);}
 },{filename:target.file});
 return {
  base,stores,deleted,writes,requests,warnings,
  seed(name,url,source){stores.get(name).set(key(url),response(source));},
  async dispatch(name,request){
   let pending,intercepted=false;
   handlers.get(name)({request,waitUntil:p=>pending=p,respondWith:p=>{intercepted=true;pending=p;}});
   return {intercepted,response:await pending};
  }
 };
}

for(const target of targets){
 const check=(name,fn)=>test(target.file+': '+name,fn);
 const request=(url,mode='same-origin',method='GET')=>({url,mode,method});
 check('activation preserves current and foreign caches',async()=>{
  const h=harness(target);await h.dispatch('activate');
  assert.ok(h.stores.has(target.cache));assert.ok(h.stores.has('outro-jogo-v1'));
  assert.ok(h.stores.has(target.prefix==='ldm-v'?'calculus-royale-v2':'ldm-v22'));
  assert.equal(h.deleted.length,1);assert.ok(h.deleted.every(name=>name.startsWith(target.prefix)));
 });
 check('installation precaches only into its own cache',async()=>{
  const h=harness(target);await h.dispatch('install');
  assert.ok(h.stores.get(target.cache).has(h.base+'index.html'));
  assert.equal(h.stores.get('outro-jogo-v1').size,0);
 });
 check('ignores foreign origin, other folders and POST',async()=>{
  const h=harness(target);
  for(const req of [request('https://other.example/app.js'),request(origin+'/outro-jogo/a.js'),request(h.base.slice(0,-1)+'-outro/a.js'),request(h.base+'index.html','same-origin','POST')]){
   assert.equal((await h.dispatch('fetch',req)).intercepted,false);
  }
  assert.equal(h.requests.length,0);
 });
 check('does not return a foreign cache entry for the same URL',async()=>{
  const h=harness(target);h.seed('outro-jogo-v1','index.html','foreign');
  const result=await h.dispatch('fetch',request(h.base+'index.html'));
  assert.equal(result.response.source,'network');assert.equal(h.requests.length,1);
  assert.equal(h.writes[0].name,target.cache);
 });
 check('serves an own cached asset without network',async()=>{
  const h=harness(target);h.seed('outro-jogo-v1','asset.js','foreign');h.seed(target.cache,'asset.js','own');
  assert.equal((await h.dispatch('fetch',request(h.base+'asset.js'))).response.source,'own');
  assert.equal(h.requests.length,0);
 });
 check('never caches HTTP errors',async()=>{
  const h=harness(target,{status:404});
  assert.equal((await h.dispatch('fetch',request(h.base+'missing','navigate'))).response.status,404);
  assert.equal(h.writes.length,0);
 });
 for(const fault of ['openError','matchError','putError'])check(fault+' does not discard a successful network response',async()=>{
  const h=harness(target,{[fault]:true});
  assert.equal((await h.dispatch('fetch',request(h.base+'asset.js'))).response.source,'network');
  assert.ok(h.warnings.length>0);
 });
 if(target.navigation){
  check('navigation refreshes cached HTML from the network',async()=>{
   const h=harness(target);h.seed(target.cache,'index.html','old');
   assert.equal((await h.dispatch('fetch',request(h.base+'index.html','navigate'))).response.source,'network');
   assert.equal(h.stores.get(target.cache).get(h.base+'index.html').source,'network');
  });
  check('offline navigation falls back only to its own index',async()=>{
   const h=harness(target,{offline:true});h.seed('outro-jogo-v1','index.html','foreign');h.seed(target.cache,'index.html','own');
   assert.equal((await h.dispatch('fetch',request(h.base+'unknown-page','navigate'))).response.source,'own');
  });
  check('offline navigation without own fallback fails closed',async()=>{
   const h=harness(target,{offline:true});h.seed('outro-jogo-v1','index.html','foreign');
   assert.equal((await h.dispatch('fetch',request(h.base+'unknown-page','navigate'))).response.source,'error');
  });
 }
}

for(const file of ['sw.js','player.js'])test('generated and source '+file+' stay identical',()=>{
 assert.equal(fs.readFileSync(path.join(root,'jogos/calculus-royale',file),'utf8'),fs.readFileSync(path.join(root,'jogos/calculus-royale-src/client/public',file),'utf8'));
});
