const VERSAO='ldm-v24';
const ARQUIVOS=['./','./index.html','./manifest.webmanifest','./css/tema.css','./css/estilos.css','./css/fracsoma.css','./css/inicio.css','./css/chibi-3d.css','./images/laboratorio-hero.webp','./images/mago-chibi.webp','./images/laboratorio-chibi.webp','./images/chibi-detetive.webp','./images/chibi-fracsoma.webp','./images/chibi-adivinhacao.webp','./images/chibi-abelha.webp','./images/chibi-poligonos.webp','./images/chibi-divisores.webp','./images/chibi-cpf.webp','./images/chibi-kente.webp','./images/chibi-estacao.webp','./images/batalha-chibi.webp','./cartelas-magicas.html','./detetive-do-cpf.html','./js/main.js','./js/main.js?v=22','./js/animacao/ChibiCharacter.js','./js/animacao/ativar-chibis.js','./js/animacao/ativar-chibis.js?v=22','./js/core/estado.js','./js/core/ui.js','./js/core/ui.js?v=22','./js/core/roteador.js','./js/core/roteador.js?v=22','./js/dados/textos.js','./js/dados/abelha.js','./js/modulos/adivinhacao/index.js','./js/modulos/adivinhacao/index.js?v=22','./js/modulos/fracsoma/index.js','./js/modulos/fracsoma/index.js?v=22','./js/modulos/abelha/index.js','./js/modulos/abelha/index.js?v=22','./js/modulos/poligonos/index.js','./js/modulos/poligonos/index.js?v=22','./js/modulos/divisores/index.js','./js/modulos/divisores/index.js?v=22','./js/modulos/cpf/index.js','./js/modulos/cpf/index.js?v=22','./js/modulos/kente/index.js','./js/modulos/kente/index.js?v=22','./js/modulos/estacao/index.js','./js/modulos/estacao/index.js?v=22','./js/modulos/teoria/index.js','./js/modulos/avaliador/index.js','./js/modulos/espiral/index.js','./js/modulos/referencias/index.js','./icons/icon-192.png','./icons/icon-512.png','./icons/icon-maskable-512.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(VERSAO).then(cache=>cache.addAll(ARQUIVOS.map(path=>new Request(path,{cache:'reload'}))))));
self.addEventListener('activate',event=>event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('ldm-v')&&k!==VERSAO).map(k=>caches.delete(k)))),self.clients.claim()])));
self.addEventListener('fetch',event=>{
 const request=event.request;if(request.method!=='GET')return;
 const url=new URL(request.url),scope=new URL(self.registration.scope);
 if(url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname))return;
 event.respondWith((async()=>{
  let cache;
  try{cache=await caches.open(VERSAO);const hit=await cache.match(request);if(hit)return hit;}
  catch(error){console.warn('Cache indisponível:',error);}
  const response=await fetch(request);
  if(response.ok&&cache){
   try{await cache.put(request,response.clone());}
   catch(error){console.warn('Não foi possível guardar a resposta:',error);}
  }
  return response;
 })());
});
self.addEventListener('message',event=>{if(event.data?.tipo==='ATIVAR')self.skipWaiting()});
