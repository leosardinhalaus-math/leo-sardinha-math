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
