const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const playerSource = fs.readFileSync(path.join(__dirname, '../jogos/calculus-royale/player.js'), 'utf8');
const id1 = '11111111-1111-4111-8111-111111111111';
const id2 = '22222222-2222-4222-8222-222222222222';

function loadCloud(mockFetch) {
  const window = { CalculusCloudConfig: { provider: 'supabase' } };
  const localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
  vm.runInNewContext(playerSource, { window, localStorage, fetch: mockFetch, document: {}, location: { reload() {} }, console });
  return window.CalculusCloud;
}

function okJson(body) {
  return { ok: true, text: async () => JSON.stringify(body) };
}

test('ranking fetches only profiles referenced by top stats, preserving order', async () => {
  const urls = [];
  const cloud = loadCloud(async (url) => {
    const parsed = new URL(url);
    urls.push(parsed);
    if (parsed.pathname.endsWith('/game_stats')) {
      return okJson([{ user_id: id2, trophies: 80 }, { user_id: id1, trophies: 40 }]);
    }
    if (parsed.pathname.endsWith('/player_profiles')) {
      assert.equal(parsed.searchParams.get('user_id'), `in.(${id2},${id1})`);
      assert.equal(parsed.searchParams.get('limit'), '100');
      return okJson([{ user_id: id1, username: 'Primeiro' }, { user_id: id2, username: 'Segundo' }]);
    }
    throw new Error('Unexpected request ' + url);
  });
  const result = await cloud.leaderboard();
  assert.deepEqual(Array.from(result, r => r.profile.username), ['Segundo', 'Primeiro']);
  assert.equal(urls.length, 2);
});

test('empty ranking makes no profile request', async () => {
  let calls = 0;
  const cloud = loadCloud(async () => { calls++; return okJson([]); });
  const result = await cloud.leaderboard();
  assert.equal(result.length, 0);
  assert.equal(calls, 1);
});

test('invalid ranking sort is rejected before querying database', async () => {
  let calls = 0;
  const cloud = loadCloud(async () => { calls++; return okJson([]); });
  await assert.rejects(cloud.leaderboard('trophies.desc&limit=10000'), /inválida/);
  assert.equal(calls, 0);
});

test('malformed user identifiers cannot enter the profile REST filter', async () => {
  let calls = 0;
  const cloud = loadCloud(async () => {
    calls++;
    return okJson([{ user_id: 'injected,)invalid', trophies: 1000 }]);
  });
  const result = await cloud.leaderboard();
  assert.equal(result.length, 0);
  assert.equal(calls, 1);
});
