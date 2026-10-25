const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'jogos/calculus-royale/player.js'), 'utf8');
const SESSION_KEY = 'calculus-royale:cloud-session';
const PENDING_NAME_KEY = 'calculus-royale:pending-username';
const uid = '11111111-1111-4111-8111-111111111111';

const reply = (body, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  text: async () => JSON.stringify(body)
});

function harness(responder, initial = {}) {
  const records = new Map(Object.entries(initial));
  const localStorage = {
    getItem: key => records.has(key) ? records.get(key) : null,
    setItem: (key, value) => records.set(key, String(value)),
    removeItem: key => records.delete(key)
  };
  let reloaded = 0;
  const window = { CalculusCloudConfig: { provider: 'supabase' } };
  vm.runInNewContext(source, {
    window, localStorage,
    fetch: responder,
    document: {},
    location: { origin: 'https://example.org', pathname: '/jogos/calculus-royale/perfil/', reload() { reloaded++; } },
    console
  });
  return { cloud: window.CalculusCloud, records, get reloads() { return reloaded; } };
}

test('signup with email confirmation keeps pending name but no authenticated session', async () => {
  const {cloud,records} = harness(async (url,opts) => {
    assert.match(url, /\/auth\/v1\/signup\?redirect_to=/);
    assert.equal(opts.method, 'POST');
    return reply({ user: { id: uid }, session: null });
  });
  const result = await cloud.signUp('player@example.org', 'secret123', ' Jogador ');
  assert.equal(result.user.id, uid);
  assert.equal(await cloud.session(), null);
  assert.equal(records.get(PENDING_NAME_KEY), 'Jogador');
  assert.equal(records.has(SESSION_KEY), false);
});

test('failed signup never overwrites or saves a pending username', async () => {
  const {cloud,records} = harness(async () => reply({ message: 'Falha' }, 400));
  await assert.rejects(cloud.signUp('player@example.org', 'invalid', 'Jogador'), /Falha/);
  assert.equal(records.has(PENDING_NAME_KEY), false);
});

test('simultaneous expired-session reads rotate the refresh token only once', async () => {
  let count = 0;
  const old = { access_token:'old', refresh_token:'old-refresh', expires_at:1, user:{id:uid} };
  const {cloud,records} = harness(async (url,opts) => {
    assert.match(url, /grant_type=refresh_token/);
    assert.equal(JSON.parse(opts.body).refresh_token,'old-refresh');
    count++;
    await Promise.resolve();
    return reply({access_token:'new',refresh_token:'new-refresh',expires_in:3600,user:{id:uid}});
  }, {[SESSION_KEY]: JSON.stringify(old)});
  const [first, second] = await Promise.all([cloud.session(),cloud.session()]);
  assert.equal(count, 1);
  assert.equal(first.access_token, 'new');
  assert.equal(second.access_token, 'new');
  assert.equal(JSON.parse(records.get(SESSION_KEY)).refresh_token, 'new-refresh');
});

test('rejected refresh removes expired credentials', async () => {
  const old = {access_token:'old',refresh_token:'expired',expires_at:1,user:{id:uid}};
  const {cloud,records} = harness(async () => reply({error:'invalid_grant'},401), {[SESSION_KEY]:JSON.stringify(old)});
  assert.equal(await cloud.session(),null);
  assert.equal(records.has(SESSION_KEY),false);
});

test('expired session without refresh token is removed locally', async () => {
  const old = {access_token:'old',expires_at:1,user:{id:uid}};
  const {cloud,records} = harness(async () => {throw Error('Unexpected request');}, {[SESSION_KEY]:JSON.stringify(old)});
  assert.equal(await cloud.session(),null);
  assert.equal(records.has(SESSION_KEY),false);
});

test('offline logout deletes session and pending name even if server is unreachable', async () => {
  const old = {access_token:'old',refresh_token:'secret',expires_at:10000000000,user:{id:uid}};
  const {cloud,records,reloads} = harness(async () => {throw Error('Offline');}, {
    [SESSION_KEY]:JSON.stringify(old),[PENDING_NAME_KEY]:'Jogador'
  });
  await cloud.logout();
  assert.equal(records.has(SESSION_KEY),false);
  assert.equal(records.has(PENDING_NAME_KEY),false);
});

test('profile pages distinguish email-confirmation response from active session', () => {
  for (const page of [
    'jogos/calculus-royale/perfil/index.html',
    'jogos/calculus-royale-src/client/public/perfil/index.html'
  ]) {
    const html = fs.readFileSync(path.join(root,page),'utf8');
    assert.match(html, /await C\.signUp\(/);
    assert.match(html, /if\(await C\.session\(\)\)await renderMine\(\)/);
    assert.doesNotMatch(html, /result\?\.user\?\.id\|\|result\?\.access_token/);
  }
});

test('valid login persists only the returned authenticated session', async () => {
  const {cloud,records} = harness(async (url,opts) => {
    assert.match(url,/grant_type=password/);
    assert.equal(opts.method,'POST');
    assert.equal(JSON.parse(opts.body).email,'player@example.org');
    return reply({access_token:'access',refresh_token:'refresh',expires_in:3600,user:{id:uid}});
  });
  const logged = await cloud.signIn('player@example.org','secret123');
  assert.equal(logged.user.id,uid);
  assert.equal(JSON.parse(records.get(SESSION_KEY)).access_token,'access');
});

test('malformed login response does not create an authenticated session', async () => {
  const {cloud,records} = harness(async () => reply({user:{id:uid},access_token:'token'}));
  await assert.rejects(cloud.signIn('player@example.org','secret123'), /confirmar o login/);
  assert.equal(records.has(SESSION_KEY),false);
});

test('missing session never makes a network request', async () => {
  let calls=0;
  const {cloud} = harness(async () => {calls++;throw Error('Unexpected request');});
  assert.equal(await cloud.session(),null);
  assert.equal(calls,0);
});

test('refresh response without a user clears expired session', async () => {
  const old = {access_token:'old',refresh_token:'refresh',expires_at:1,user:{id:uid}};
  const {cloud,records}=harness(async () => reply({access_token:'next',refresh_token:'next-refresh',expires_in:3600}),{
    [SESSION_KEY]:JSON.stringify(old)
  });
  assert.equal(await cloud.session(),null);
  assert.equal(records.has(SESSION_KEY),false);
});

test('late refresh cannot restore credentials after logout', async () => {
  const old={access_token:'old',refresh_token:'old-refresh',expires_at:1,user:{id:uid}};
  let resolveRefresh;
  const {cloud,records}=harness(async (url) => {
    if (url.includes('grant_type=refresh_token')) {
      return new Promise(resolve => { resolveRefresh=resolve; });
    }
    if (url.endsWith('/auth/v1/logout')) return reply({});
    throw Error('Unexpected request '+url);
  },{[SESSION_KEY]:JSON.stringify(old)});
  const refreshing=cloud.session();
  assert.equal(typeof resolveRefresh,'function');
  await cloud.logout();
  assert.equal(records.has(SESSION_KEY),false);
  resolveRefresh(reply({access_token:'late',refresh_token:'late-refresh',expires_in:3600,user:{id:uid}}));
  assert.equal(await refreshing,null);
  assert.equal(records.has(SESSION_KEY),false);
});

test('logout clears browser tokens even before server responds', async () => {
  const old={access_token:'old',refresh_token:'refresh',expires_at:10000000000,user:{id:uid}};
  let finish;
  const {cloud,records}=harness(async ()=>new Promise(resolve=>{finish=resolve;}),{[SESSION_KEY]:JSON.stringify(old)});
  const logout=cloud.logout();
  assert.equal(records.has(SESSION_KEY),false);
  assert.equal(typeof finish,'function');
  finish(reply({}));
  await logout;
});
