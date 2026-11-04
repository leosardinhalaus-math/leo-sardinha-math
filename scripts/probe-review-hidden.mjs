// Public document-review URLs only; no credentials, sessions or OAuth.
export const reviewSite='https://leosardinhalaus-math.github.io/leo-sardinha-math';
export const retiredReviewRoutes=[
 '/docs/revisao-privacidade.html',
 '/docs/revisao-publica/',
 '/docs/revisao-publica/provedores.pdf',
 '/docs/revisao-publica/verificacoes.pdf',
 '/docs/privacidade-rascunho.pdf',
 '/docs/termos-rascunho.pdf',
 '/docs/POLITICA_PRIVACIDADE_RASCUNHO.md'
];
export async function probeReviewHidden(fetchImpl=fetch){
 for(const route of retiredReviewRoutes){
  const r=await fetchImpl(reviewSite+route,{redirect:'manual',signal:AbortSignal.timeout(20000),headers:{'Cache-Control':'no-cache','User-Agent':'Document-review-publication-check'}});
  console.log(JSON.stringify({check:route,status:r.status,hidden:[404,410].includes(r.status)}));
  if(![404,410].includes(r.status))throw Error('Review route is still available: '+route+' HTTP '+r.status);
 }
}
if(process.argv[1]&&new URL(import.meta.url).pathname===process.argv[1])await probeReviewHidden();
