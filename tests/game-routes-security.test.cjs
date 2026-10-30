const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const pages = ['index.html','educacao.html'];

function gameLinks(html) {
  return [...html.matchAll(/href=["'](jogos\/[^"'?#]+)["']/g)].map(match => match[1]);
}

test('every game linked from homepage and education page has a real entry point', () => {
  for (const page of pages) {
    const html = fs.readFileSync(path.join(root,page),'utf8');
    const urls = gameLinks(html);
    assert.ok(urls.length >= 7,page+' should link to the educational games');
    for (const url of urls) {
      const normalized = path.posix.normalize(url);
      assert.ok(normalized.startsWith('jogos/') && !normalized.includes('../'),page+' has unsafe game path '+url);
      const target = path.join(root,normalized,url.endsWith('/') ? 'index.html' : '');
      assert.ok(fs.existsSync(target),page+' links to a missing game entry: '+url);
    }
  }
});

test('unreleased Godot version is clearly marked and points to the playable browser arena', () => {
  const route='jogos/calculus-royale-godot/';
  const landing=fs.readFileSync(path.join(root,route,'index.html'),'utf8');
  for (const page of pages) {
    const html=fs.readFileSync(path.join(root,page),'utf8');
    assert.match(html,/Godot 3D · em desenvolvimento/);
    assert.doesNotMatch(html,/Jogar versão Godot 3D/);
  }
  assert.match(landing,/Godot ainda está sendo preparada/);
  assert.match(landing,/href="\.\.\/calculus-royale\/"/);
  assert.match(landing,/name="viewport"/);
  assert.match(landing,/<main>/);
});
