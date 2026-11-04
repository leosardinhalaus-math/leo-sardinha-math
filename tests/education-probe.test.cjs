const test=require('node:test'),assert=require('node:assert/strict');
let api;test.before(async()=>api=await import('../scripts/probe-education.mjs'));
const ready={status:'ready',mode:'auth-test',build:'auth-test-gate-v1',diagnostics:'setup-fields-v1',revision:'6a76c491b291',host:'leo-sardinha-educacao-v2.onrender.com'};
function mockFetch(change=()=>{}){return async(url,options)=>{
 const pathname=new URL(url).pathname;
 if(pathname==='/healthz')return Response.json(ready);
 const check=api.routeChecks.find(c=>c.path===pathname&&(c.method||'GET')===options.method&&!!c.invalidSession===!!options.headers.Cookie);
 assert(check,'Unexpected probe path '+pathname);
 const config={status:check.status,headers:{'Cache-Control':'private, no-store',...(check.location?{Location:check.location}:{})},body:check.unauthenticated?JSON.stringify({authenticated:false}):null};
 change(config,check);return new Response(config.body,{status:config.status,headers:config.headers});
}}
test('sondagem exige auth-test e metadados do serviço correto',()=>{
 assert.equal(api.validateHealth(ready).mode,'auth-test');
 for(const patch of [{status:'setup'},{mode:'activities'},{mode:'configured'},{build:'old'},{diagnostics:'old'},{host:'other.onrender.com'},{revision:null}])assert.throws(()=>api.validateHealth({...ready,...patch}));
});
test('sondagem verifica GET, HEAD, sessão inválida e caminhos internos sem OAuth',async()=>{
 const logs=[];await api.probeEducation({fetchImpl:mockFetch(),log:value=>logs.push(value)});
 assert(logs.some(l=>l.method==='HEAD'));assert(logs.some(l=>l.invalidSession));
 assert(logs.some(l=>l.check==='/server/educacao/.env'));assert(!logs.some(l=>l.check==='/auth/google'));
});
test('sondagem falha se uma rota privada entregar conteúdo ou redirecionar para outro destino',async()=>{
 for(const patch of [c=>{c.status=200;delete c.headers.Location},c=>{c.headers.Location='/other'}]){
  await assert.rejects(api.probeEducation({fetchImpl:mockFetch((config,check)=>{if(check.path==='/educacao.html')patch(config)}),log:()=>{}}),/Resposta inesperada/);
 }
});
test('sondagem falha se respostas permitirem cache ou expuserem sessão autenticada',async()=>{
 await assert.rejects(api.probeEducation({fetchImpl:mockFetch(c=>{delete c.headers['Cache-Control']}),log:()=>{}}),/Resposta inesperada/);
 await assert.rejects(api.probeEducation({fetchImpl:mockFetch((c,check)=>{if(check.unauthenticated)c.body=JSON.stringify({authenticated:true,csrf:'fixture'})}),log:()=>{}}),/Resposta inesperada/);
});
