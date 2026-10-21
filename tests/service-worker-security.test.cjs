// Testes de regressão para isolamento dos Service Workers.
// Execute na raiz do repositório: node --test tests/service-worker-security.test.cjs
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const targets = [
  { file: 'jogos/calculus-royale/sw.js', scope: '/leo-sardinha-math/jogos/calculus-royale/', cache: 'calculus-royale-v3', prefix: 'calculus-royale-' },
  { file: 'jogos/laboratorio-digital-matematica/service-worker.js', scope: '/leo-sardinha-math/jogos/laboratorio-digital-matematica/', cache: 'ldm-v23', prefix: 'ldm-v' }
];

function harness(target) {
  const handlers = new Map();
  const items = new Map([
    ['calculus-royale-v2', new Map()],
    ['ldm-v22', new Map()],
    ['outro-jogo-v1', new Map()]
  ]);
  const deleted = [];
  let fetchCalls = 0, respondCount = 0;
  const base = 'https://example.github.io' + target.scope;
  const fakeCache = name => ({
    addAll: async () => {},
    put: async (req, res) => { items.get(name).set(String(req.url || req), res); }
  });
  const caches = {
    keys: async () => [...items.keys()],
    delete: async name => { deleted.push(name); return items.delete(name); },
    open: async name => { if (!items.has(name)) items.set(name, new Map()); return fakeCache(name); },
    match: async req => {
      for (const store of items.values()) if (store.has(String(req.url || req))) return store.get(String(req.url || req));
      return undefined;
    }
  };
  const self = {
    location: { origin: 'https://example.github.io' },
    registration: { scope: base },
    clients: { claim: async () => {} },
    skipWaiting: async () => {},
    addEventListener: (name, listener) => handlers.set(name, listener)
  };
  const context = {
    self, caches, URL, console,
    Request: class { constructor(url) { this.url = new URL(url, base).href; } },
    fetch: async () => {
      fetchCalls++;
      return { ok: true, clone() { return this; } };
    }
  };
  const code = fs.readFileSync(target.file, 'utf8');
  vm.runInNewContext(code, context, { filename: target.file });
  async function dispatch(name, req) {
    let pending;
    let responded = false;
    handlers.get(name)({
      request: req,
      waitUntil(p) { pending = p; },
      respondWith(p) { responded = true; respondCount++; pending = p; }
    });
    if (pending) await pending;
    return responded;
  }
  return { dispatch, deleted, items, handlers, stats: () => ({ fetchCalls, respondCount }) };
}

for (const target of targets) {
  test(target.file + ': preserva caches de outros aplicativos', async () => {
    const h = harness(target);
    await h.dispatch('activate');
    assert.ok(h.items.has('outro-jogo-v1'));
    assert.ok(h.items.has(target.cache) === false); // Ativação não cria cache novo
    assert.ok(!h.items.has(target.prefix === 'ldm-v' ? 'ldm-v22' : 'calculus-royale-v2'));
    assert.ok(h.deleted.every(name => name.startsWith(target.prefix)));
  });

  test(target.file + ': não intercepta outras pastas ou origens', async () => {
    const h = harness(target);
    const req = url => ({ method: 'GET', url, mode: 'same-origin' });
    assert.equal(await h.dispatch('fetch', req('https://example.github.io/leo-sardinha-math/jogos/outro-jogo/a.js')), false);
    assert.equal(await h.dispatch('fetch', req('https://outro.exemplo.org/a.js')), false);
    assert.equal(h.stats().fetchCalls, 0);
    assert.equal(await h.dispatch('fetch', req('https://example.github.io' + target.scope + 'index.html')), true);
    assert.equal(h.stats().fetchCalls, 1);
  });

  test(target.file + ': não intercepta POST', async () => {
    const h = harness(target);
    assert.equal(await h.dispatch('fetch', {
      method: 'POST', url: 'https://example.github.io' + target.scope + 'index.html', mode: 'same-origin'
    }), false);
  });
}
