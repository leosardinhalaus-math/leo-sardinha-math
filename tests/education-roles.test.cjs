const test=require('node:test'),assert=require('node:assert/strict');
let security,roles;
test.before(async()=>{security=await import('../server/educacao/security.mjs');roles=await import('../server/educacao/roles.mjs')});
test('permissão administrativa vem somente da lista privada e não é concedida a entradas antigas',()=>{
 const user={email:'adult@example.test',sub:'stable',googleHostedEmail:true,role:'admin'};
 assert.equal(security.identityRole(user,['adult@example.test']),'teacher');
 assert.equal(security.identityRole(user,[{email:user.email,sub:user.sub}]),'teacher');
 assert.equal(security.identityRole(user,[{email:user.email,role:'admin'}]),'admin');
 assert.equal(security.identityRole({...user,googleHostedEmail:false},[{email:user.email,role:'admin'}]),null);
 assert.equal(security.identityRole({...user,googleHostedEmail:false},[{email:user.email,sub:'stable',role:'admin'}]),'admin');
 assert.equal(security.identityRole({...user,sub:'wrong'},[{email:user.email,sub:'stable',role:'admin'}]),null);
 for(const list of [[{email:user.email,role:'owner'}],[{email:user.email,role:'admin',unexpected:true}],[{email:user.email,role:'teacher'},{email:user.email,role:'admin'}]]){
  assert.equal(security.validAllowlist(list),false);assert.equal(security.identityRole(user,list),null);
 }
 assert.equal(roles.canAccessArea('teacher','admin'),false);assert.equal(roles.canAccessArea('admin','teacher'),true);
});
test('rotas reservadas delimitam espaços separados; páginas públicas não viram áreas privadas',()=>{
 assert.equal(roles.reservedArea('/admin/'),'admin');assert.equal(roles.reservedArea('/admin/arquivo.pdf'),'admin');
 assert.equal(roles.reservedArea('/professores/'),'teacher');
 for(const path of ['/professor/','/educacao.html','/administrator/','/index.html'])assert.equal(roles.reservedArea(path),null);
});
test('permissões são reavaliadas por requisição, com recusa de elevação, rebaixamento, revogação e alias',async()=>{
 const fs=require('node:fs/promises'),os=require('node:os'),path=require('node:path'),{spawn}=require('node:child_process');
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'edu-roles-')),site=path.join(dir,'site'),list=path.join(dir,'allowed.json');
 await fs.mkdir(path.join(site,'admin'),{recursive:true});await fs.mkdir(path.join(site,'assets/home'),{recursive:true});
 await fs.writeFile(path.join(site,'admin/index.html'),'PRIVATE ADMIN FILE');await fs.symlink(path.join(site,'admin/index.html'),path.join(site,'assets/home/alias.svg'));
 await fs.writeFile(path.join(site,'index.html'),'PUBLIC SITE');await fs.writeFile(path.join(site,'educacao.html'),'EDUCATION');
 await fs.writeFile(list,JSON.stringify([{email:'adult@example.test',role:'teacher'}]));
 const mock=path.join(dir,'mock.mjs');await fs.writeFile(mock,`import{generateKeyPairSync,sign}from'node:crypto';const{privateKey,publicKey}=generateKeyPairSync('rsa',{modulusLength:2048}),key={...publicKey.export({format:'jwk'}),kid:'test',use:'sig',alg:'RS256'};globalThis.fetch=async(url,options)=>{if(String(url).endsWith('/certs'))return Response.json({keys:[key]});if(String(url).endsWith('/token')){const nonce=new URLSearchParams(options.body).get('code'),now=Math.floor(Date.now()/1000),h=Buffer.from(JSON.stringify({alg:'RS256',kid:'test'})).toString('base64url'),b=Buffer.from(JSON.stringify({iss:'https://accounts.google.com',aud:'test-client',nonce,sub:'stable',email:'adult@example.test',email_verified:true,hd:'example.test',role:'admin',iat:now,exp:now+300})).toString('base64url');return Response.json({id_token:h+'.'+b+'.'+sign('RSA-SHA256',Buffer.from(h+'.'+b),privateKey).toString('base64url')})}throw Error('Unexpected request')};`);
 const port=22000+Math.floor(Math.random()*10000);
 const server=spawn(process.execPath,['--import',mock,'server/educacao/server.mjs'],{env:{...process.env,EDU_ORIGIN:'https://education.example.test',EDU_PORT:String(port),EDU_BIND:'127.0.0.1',EDU_CONTENT_ROOT:site,EDU_ALLOWLIST_FILE:list,EDU_GOOGLE_CLIENT_ID:'test-client',EDU_GOOGLE_CLIENT_SECRET:'fixture',EDU_PRIVACY_CONTACT:'adult@example.test',EDU_CONTROLLER_NAME:'Test controller',EDU_LEGAL_BASIS_NOTICE:'Test notice',EDU_PROVIDER_NOTICE:'Test providers',EDU_SUPERVISED_PILOT:'true',EDU_ACTIVITIES_ENABLED:'false'},stdio:'ignore'});
 try{
  const base='http://127.0.0.1:'+port;let ready=false;for(let i=0;i<100;i++){try{await fetch(base+'/healthz');ready=true;break}catch{await new Promise(resolve=>setTimeout(resolve,30))}}assert(ready);
  for(const p of ['/admin/','/professores/','/admin/hidden.pdf'])assert.equal((await fetch(base+p,{redirect:'manual'})).status,303);
  assert.equal(await(await fetch(base+'/')).text(),'PUBLIC SITE');
  let r=await fetch(base+'/auth/google',{redirect:'manual'});const google=new URL(r.headers.get('location')),flow=r.headers.getSetCookie()[0].split(';')[0];
  r=await fetch(base+'/auth/callback?'+new URLSearchParams({state:google.searchParams.get('state'),code:google.searchParams.get('nonce')}),{redirect:'manual',headers:{cookie:flow}});assert.equal(r.status,303);
  const cookie=r.headers.getSetCookie().find(x=>x.startsWith('__Host-edu-session=')).split(';')[0],get=p=>fetch(base+p,{redirect:'manual',headers:{cookie}});
  r=await get('/professores/');assert.equal(r.status,200);assert.match(r.headers.get('cache-control'),/no-store/);assert.doesNotMatch(await r.text(),/href="\/admin\//);
  for(const p of ['/admin/','/admin/?role=admin','/admin/?email=owner@example.test'])assert.equal((await get(p)).status,403);
  assert.equal((await fetch(base+'/admin/',{method:'POST',headers:{cookie}})).status,405);
  assert.equal((await get('/jogos/batalha-naval/')).status,403);assert.equal((await get('/assets/musica-atividades/exercicios.pdf')).status,403);
  await fs.writeFile(list,JSON.stringify([{email:'adult@example.test',role:'admin'}]));
  r=await get('/admin/');assert.equal(r.status,200);const body=await r.text();assert.match(body,/Administração/);assert.doesNotMatch(body,/test-client|fixture|adult@example.test/);
  assert.equal((await get('/professores/')).status,200);assert.equal((await get('/assets/home/alias.svg')).status,404);assert.equal((await get('/admin/hidden.pdf')).status,404);
  assert.equal((await fetch(base+'/admin/',{method:'HEAD',headers:{cookie}})).status,200);
  await fs.writeFile(list,JSON.stringify([{email:'adult@example.test',role:'teacher'}]));assert.equal((await get('/admin/')).status,403);assert.equal((await get('/professores/')).status,200);
  await fs.writeFile(list,'["different@example.test"]');assert.equal((await get('/professores/')).status,303);
 }finally{server.kill();await new Promise(resolve=>server.once('exit',resolve));await fs.rm(dir,{recursive:true,force:true})}
});
