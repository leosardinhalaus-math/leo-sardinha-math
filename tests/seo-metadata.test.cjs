const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const pages = ['index.html','educacao.html','sobre.html','classroom.html','imagens.html','wiki.html','algebra/index.html','geometria/index.html','professor/index.html','professor/listas/index.html','jogos/35-camelos/index.html','jogos/batalha-naval/index.html','jogos/batalha-naval/atividades.html','jogos/bingo-fracoes/index.html','jogos/bingo-quadricas/index.html','jogos/calculus-royale/index.html','jogos/calculus-royale/perfil/index.html','jogos/calculus-royale/ranking/index.html','jogos/ilha-das-derivadas-rpg/index.html','jogos/ilha-do-calculo/index.html','jogos/laboratorio-digital-matematica/index.html','jogos/laboratorio-digital-matematica/cartelas-magicas.html','jogos/laboratorio-digital-matematica/detetive-do-cpf.html'];
for (const page of pages) test('SEO favicon path: '+page, () => {
 const html=fs.readFileSync(path.join(root,page),'utf8');
 const matches=[...html.matchAll(/<link[^>]+rel=["']icon["'][^>]+href=["']([^"']+)["']/gi)];
 assert.ok(matches.length,'missing icon');
 const shared=matches.find(m=>m[1].endsWith('favicon.svg'));
 assert.ok(shared,'missing shared favicon');
 assert.ok(fs.existsSync(path.resolve(root,path.dirname(page),shared[1])),'broken favicon path');
 assert.match(html,/<title>[^<]+<\/title>/i);
});
test('sitemap exists',()=>{assert.ok(fs.existsSync(path.join(root,'sitemap.xml')));assert.ok(fs.existsSync(path.join(root,'robots.txt')))});

test('sitemap URLs are well-formed, unique and reference project pages',()=>{
 const xml=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
 const urls=[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match=>match[1]);
 assert.ok(urls.length>0,'empty sitemap');
 assert.equal(new Set(urls).size,urls.length,'duplicate sitemap URLs');
 for(const raw of urls){
  const url=new URL(raw);
  assert.equal(url.protocol,'https:');
  assert.equal(url.hash,'');
  assert.equal(url.search,'');
  assert.ok(url.pathname.includes('/leo-sardinha-math/'),'unexpected project path');
  const relative=url.pathname.split('/leo-sardinha-math/')[1];
  assert.ok(!relative.includes('..'),'invalid URL path');
  const file=path.join(root,relative,relative.endsWith('/')||relative===''?'index.html':'');
  assert.ok(fs.existsSync(file),'sitemap points to missing page: '+raw);
 }
});
test('robots sitemap matches the generated sitemap location',()=>{
 const robots=fs.readFileSync(path.join(root,'robots.txt'),'utf8');
 const match=robots.match(/^Sitemap:\s*(\S+)/mi);
 assert.ok(match,'robots.txt is missing Sitemap');
 const sitemap=new URL(match[1]);
 assert.equal(sitemap.pathname,'/leo-sardinha-math/sitemap.xml');
});

test('SEO launch guards: robots and sitemap consistency',()=>{
 const robots=fs.readFileSync(path.join(root,'robots.txt'),'utf8');
 const xml=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
 const urls=[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
 assert.match(robots,/^User-agent:\s*\*/mi);
 assert.match(robots,/^Allow:\s*\//mi);
 assert.doesNotMatch(robots,/^Disallow:\s*\/\s*$/mi);
 assert.match(xml,/<urlset\s+xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);
 assert.ok(urls.every(u=>u.startsWith('https://')));
 assert.ok(urls.every(u=>!u.includes('/perfil/')));
 assert.ok(urls.every(u=>!u.includes('/404')));
 const origin=new URL(urls[0]).origin;
 assert.ok(urls.every(u=>new URL(u).origin===origin));
 const declared=robots.match(/^Sitemap:\s*(\S+)/mi);
 assert.ok(declared);
 assert.equal(new URL(declared[1]).origin,origin);
});
test('SEO launch guards: page titles and descriptions',()=>{
 for(const name of ['index.html','educacao.html','sobre.html','classroom.html','imagens.html','wiki.html']){
  const html=fs.readFileSync(path.join(root,name),'utf8');
  assert.match(html,/<html[^>]+lang="pt-BR"/i);
  assert.match(html,/<meta\s+name="description"\s+content="[^"]{30,}"/i);
  assert.match(html,/<meta\s+property="og:title"/i);
  assert.match(html,/<meta\s+property="og:description"/i);
  assert.match(html,/<meta\s+name="twitter:card"/i);
  assert.match(html,/<meta\s+name="viewport"/i);
 }
 const error=fs.readFileSync(path.join(root,'404.html'),'utf8');
 assert.match(error,/noindex/i);
 const profile=fs.readFileSync(path.join(root,'jogos/calculus-royale/perfil/index.html'),'utf8');
 assert.match(profile,/noindex/i);
});
