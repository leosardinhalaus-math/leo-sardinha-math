// Verificação pública: sem conta real, início de OAuth ou acesso administrativo.
import {pathToFileURL} from 'node:url';

export const educationOrigin='https://leo-sardinha-educacao-v2.onrender.com';
const expectedHost=new URL(educationOrigin).hostname;

export function validateHealth(data){
  if(data?.status!=='ready')throw Error('Serviço não está pronto; verificar a configuração.');
  if(data.mode!=='auth-test')throw Error('Modo inesperado: a verificação exige atividades bloqueadas em auth-test.');
  if(data.build!=='auth-test-gate-v1'||data.diagnostics!=='setup-fields-v1')throw Error('Marcadores de versão não reconhecidos.');
  if(data.host!==expectedHost)throw Error('Hostname do diagnóstico não corresponde ao serviço v2.');
  if(typeof data.revision!=='string'||!/^[a-f0-9]{7,40}$/i.test(data.revision))throw Error('Revisão pública não reconhecida.');
  return {status:data.status,mode:data.mode,revision:data.revision,host:data.host};
}

export const routeChecks=Object.freeze([
  {path:'/',status:200},
  {path:'/login',status:200},
  {path:'/privacidade-educacao.html',status:200},
  {path:'/educacao.html',status:303,location:'/login'},
  {path:'/%65ducacao.html',status:303,location:'/login'},
  {path:'/jogos/batalha-naval/',status:303,location:'/login'},
  {path:'/jogos/batalha-naval/index.html',status:303,location:'/login'},
  {path:'/assets/musica-atividades/exercicios.pdf',status:303,location:'/login'},
  {path:'/educacao.html',method:'HEAD',status:303,location:'/login'},
  {path:'/assets/musica-atividades/exercicios.pdf',method:'HEAD',status:303,location:'/login'},
  {path:'/educacao.html',invalidSession:true,status:303,location:'/login'},
  {path:'/auth/session',status:401,unauthenticated:true},
  {path:'/server/educacao/.env',status:404},
  {path:'/docs/POLITICA_PRIVACIDADE_RASCUNHO.md',status:404}
]);

export async function probeEducation({fetchImpl=fetch,log=value=>console.log(JSON.stringify(value)),pause=ms=>new Promise(r=>setTimeout(r,ms))}={}){
  const request=(path,options={})=>fetchImpl(educationOrigin+path,{
    method:options.method||'GET',redirect:'manual',signal:AbortSignal.timeout(60000),
    headers:{'User-Agent':'Education-security-smoke-test',...(options.invalidSession?{Cookie:'__Host-edu-session=invalid-probe-session'}:{})}
  });
  let response,error;
  for(let attempt=0;attempt<2;attempt++){
    try{response=await request('/healthz');if(response.status===200)break;error=Error('Health HTTP '+response.status)}catch(e){error=e}
    if(attempt===0)await pause(5000);
  }
  if(!response||response.status!==200)throw error||Error('Health indisponível');
  const health=validateHealth(await response.json());
  log({check:'health',httpStatus:200,...health});
  for(const check of routeChecks){
    const r=await request(check.path,check);
    let good=r.status===check.status&&/\bno-store\b/i.test(r.headers.get('cache-control')||'');
    if(check.location)good=good&&r.headers.get('location')===check.location;
    if(check.unauthenticated){let data;try{data=await r.json()}catch{}good=good&&data?.authenticated===false&&!('csrf' in (data||{}));}
    log({check:check.path,method:check.method||'GET',invalidSession:!!check.invalidSession,status:r.status,expected:good});
    if(!good)throw Error('Resposta inesperada: '+(check.method||'GET')+' '+check.path+' HTTP '+r.status);
  }
  return health;
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  await probeEducation();
  console.log('RESULTADO: modo auth-test confirmado; rotas privadas exigem login, sessões inválidas são recusadas e arquivos internos não são entregues. Login Google com conta real não foi executado por esta sondagem.');
}
