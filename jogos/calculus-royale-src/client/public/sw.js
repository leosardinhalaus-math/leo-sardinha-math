const CACHE='calculus-royale-v5';
const CORE=['./','./index.html','./manifest.webmanifest','./assets/icons/calculus-mark.svg','./player.js','./cloud-config.js','./firebase-cloud.js','./firebase-runtime.js'];
async function matchOwn(request){
 try{return await (await caches.open(CACHE)).match(request);}
 catch(error){console.warn('Cache indisponível:',error);return undefined;}
}
async function remember(request,response){
 if(response.ok){
  try{await (await caches.open(CACHE)).put(request,response.clone());}
  catch(error){console.warn('Não foi possível guardar a resposta:',error);}
 }
 return response;
}
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE.map(path=>new Request(path,{cache:'reload'})))).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('calculus-royale-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const request=event.request;if(request.method!=='GET')return;
 const url=new URL(request.url),scope=new URL(self.registration.scope);
 if(url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname))return;
 if(request.mode==='navigate'){
  event.respondWith(fetch(request).then(response=>remember(request,response)).catch(async()=>
   await matchOwn(request)||await matchOwn(new URL('index.html',scope).href)||Response.error()
  ));return;
 }
 event.respondWith(matchOwn(request).then(hit=>hit||fetch(request).then(response=>remember(request,response))));
});
