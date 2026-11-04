const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),os=require('node:os'),path=require('node:path');
let api;test.before(async()=>api=await import('../scripts/filter-document-review.mjs'));
test('revisão documental pausada não mantém arquivos de publicação na origem',async()=>{
 assert.equal(api.reviewPublication.paused,true);
 for(const p of api.reviewPaths())await assert.rejects(fs.lstat(p),e=>e.code==='ENOENT',p+' must remain outside the published source');
 assert(await fs.stat('educacao.html'));assert(await fs.stat('jogos/batalha-naval/index.html'));
});
test('artefato remove revisão e downloads sem remover Educação ou documentação alheia',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'review-paused-'));
 try{
  for(const p of ['docs/revisao-publica/index.html','docs/revisao-publica/provedores.pdf','docs/revisao-privacidade.html','docs/termos-rascunho.pdf','docs/FIREBASE.md','educacao.html','jogos/batalha-naval/index.html']){await fs.mkdir(path.dirname(path.join(dir,p)),{recursive:true});await fs.writeFile(path.join(dir,p),'fixture');}
  await api.filterDocumentReview(dir);
  for(const p of ['docs/revisao-publica','docs/revisao-privacidade.html','docs/termos-rascunho.pdf'])await assert.rejects(fs.lstat(path.join(dir,p)),e=>e.code==='ENOENT');
  for(const p of ['docs/FIREBASE.md','educacao.html','jogos/batalha-naval/index.html'])assert(await fs.stat(path.join(dir,p)));
  assert.deepEqual(await api.filterDocumentReview(dir),[]);
 }finally{await fs.rm(dir,{recursive:true,force:true})}
});
test('filtro recusa raiz do código, caminhos de escape e pais simbólicos',async()=>{
 await assert.rejects(api.filterDocumentReview('.'),/staged/);
 assert.throws(()=>api.reviewPaths({directories:['../outside'],files:[]}),/Invalid/);
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'review-symlink-')),outside=await fs.mkdtemp(path.join(os.tmpdir(),'review-outside-'));
 try{await fs.writeFile(path.join(outside,'termos-rascunho.pdf'),'preserve');await fs.symlink(outside,path.join(dir,'docs'));await assert.rejects(api.filterDocumentReview(dir),/Symlink/);assert.equal(await fs.readFile(path.join(outside,'termos-rascunho.pdf'),'utf8'),'preserve');}
 finally{await fs.rm(dir,{recursive:true,force:true});await fs.rm(outside,{recursive:true,force:true})}
});

test('verificação pública exige Início e Educação disponíveis, além dos documentos retirados',async()=>{
 const {probeReviewHidden}=await import('../scripts/probe-review-hidden.mjs');
 await assert.rejects(probeReviewHidden(async()=>new Response(null,{status:404}),()=>{}),/Main site or Education/);
 const checks=[];
 await probeReviewHidden(async url=>new Response(null,{status:['/leo-sardinha-math/','/leo-sardinha-math/educacao.html'].includes(new URL(url).pathname)?200:404}),value=>checks.push(value));
 assert.equal(checks.filter(x=>x.preserved).length,2);assert.equal(checks.filter(x=>x.hidden).length,7);
 await assert.rejects(probeReviewHidden(async()=>new Response(null,{status:200}),()=>{}),/Review route is still available/);
});
