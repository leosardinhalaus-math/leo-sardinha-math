const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const playerSource = fs.readFileSync(path.join(root, 'jogos/calculus-royale/player.js'), 'utf8');

function renderPage(relativePath, cloudOverrides, search = '') {
  const elements = new Map();
  const document = {
    querySelector(selector) {
      if (!elements.has(selector)) elements.set(selector, { innerHTML: '', textContent: '', style: {}, className: '', value: '' });
      return elements.get(selector);
    },
    querySelectorAll() { return []; },
  };
  const window = { CalculusCloudConfig: { provider: 'supabase' }, addEventListener() {} };
  const localStorage = { getItem() { return null; }, setItem() {}, removeItem() {} };
  const location = { search, origin: 'https://example.test', pathname: '/perfil/', reload() {} };
  const context = vm.createContext({
    document, window, localStorage, location, URLSearchParams, URL, encodeURIComponent, console,
    fetch() { throw new Error('Unexpected network request in DOM regression'); },
  });
  vm.runInContext(playerSource, context, { timeout: 1000 });
  Object.assign(window.CalculusCloud, cloudOverrides);
  const html = fs.readFileSync(path.join(root, relativePath), 'utf8');
  const inlineScripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)]
    .map(match => match[1]).filter(script => script.trim());
  assert.equal(inlineScripts.length, 1, 'Expected exactly one inline page controller');
  vm.runInContext(inlineScripts[0], context, { timeout: 1000 });
  return elements;
}

const hostile = '<img src=x onerror="alert(1)"><svg onload=alert(2)>';
const hostileSlug = '" onmouseover="alert(3)';

test('public profile escapes untrusted avatar, name, slug and statistics before innerHTML', async () => {
  const elements = renderPage('jogos/calculus-royale/perfil/index.html', {
    publicProfile: async () => ({
      profile: { avatar_seed: hostile, username: hostile, public_slug: hostile },
      stats: { trophies: hostile, wins: hostile, level: hostile },
    }),
  }, '?u=demo');
  await new Promise(resolve => setImmediate(resolve));
  const html = elements.get('#profilePanel').innerHTML;
  assert.equal(elements.get('#heroTitle').textContent, hostile, 'Title uses textContent');
  assert.match(html, /&lt;img/);
  assert.match(html, /&lt;svg/);
  assert.doesNotMatch(html, /<img\b|<svg\b/i, 'Untrusted markup must not become HTML elements');
  assert.doesNotMatch(html, /<script\b/i);
});

test('ranking escapes untrusted score fields and encodes profile slug in href', async () => {
  const elements = renderPage('jogos/calculus-royale/ranking/index.html', {
    leaderboard: async () => [{
      profile: { username: hostile, public_slug: hostileSlug },
      trophies: hostile, wins: hostile, level: hostile, xp: hostile,
    }],
  });
  await new Promise(resolve => setImmediate(resolve));
  const html = elements.get('#rank').innerHTML;
  assert.match(html, /&lt;img/);
  assert.match(html, /&lt;svg/);
  assert.doesNotMatch(html, /<img\b|<svg\b/i);
  assert.match(html, /href="\.\.\/perfil\/\?u=%22/);
  assert.doesNotMatch(html, /href="[^"]*"\s+onmouseover=/i, 'Slug must not create HTML attributes');
});
