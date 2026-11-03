// Sondagem pública: sem credenciais, cookies persistidos ou alterações no serviço.
const origin='https://leo-sardinha-educacao.onrender.com';
async function get(path){return fetch(origin+path,{redirect:'manual',signal:AbortSignal.timeout(60000),headers:{'User-Agent':'Education-security-smoke-test'}})}
let response,error;
for(let attempt=0;attempt<2;attempt++){try{response=await get('/healthz');if(response.status===200)break;error=Error('Health HTTP '+response.status)}catch(e){error=e}if(attempt===0)await new Promise(r=>setTimeout(r,5000))}
if(!response||response.status!==200)throw error||Error('Health indisponível');
const health=(await response.text()).trim();let mode;
if(health==='ok')mode='configured';else {let data;try{data=JSON.parse(health)}catch{}if(data?.status==='setup')mode='setup';else if(data?.status==='ready'&&['auth-test','activities'].includes(data.mode))mode='configured';else throw Error('Health não reconhecido')}
console.log(JSON.stringify({check:'health',status:200,mode}));
for(const path of ['/','/educacao.html','/jogos/batalha-naval/','/assets/musica-atividades/exercicios.pdf','/login']){
 const r=await get(path);let good=false;
 if(mode==='setup')good=r.status===503;
 else if(path==='/'||path==='/login')good=r.status===200;
 else {const location=r.headers.get('location');good=r.status===303&&location==='/login'}
 console.log(JSON.stringify({check:path,status:r.status,expected:good}));
 if(!good)throw Error('Resposta inesperada: '+path+' HTTP '+r.status)
}
console.log(mode==='setup'?'RESULTADO: configuração pendente; conteúdo não entregue nas rotas verificadas.':'RESULTADO: rotas privadas exigem login. Login Google com conta real não foi testado.');
