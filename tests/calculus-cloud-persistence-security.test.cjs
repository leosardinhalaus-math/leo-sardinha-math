const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const player = fs.readFileSync(path.join(root,'jogos/calculus-royale/player.js'),'utf8');
const userId = 'a1e207f0-a2ab-46d8-8e32-333333333333';
const session = {user:{id:userId},access_token:'test-access'};
const PENDING = 'calculus-royale:pending-username';
const SESSION = 'calculus-royale:cloud-session';
const reply = (data,status=200) => ({ok:status>=200&&status<300,status,text:async()=>JSON.stringify(data)});

function harness(fetchImpl,initial={}) {
  const store = new Map(Object.entries(initial));
  const storage = {
    getItem:k=>store.has(k)?store.get(k):null,
    setItem:(k,v)=>store.set(k,String(v)),
    removeItem:k=>store.delete(k)
  };
  const window={CalculusCloudConfig:{provider:'supabase'}};
  vm.runInNewContext(player,{window,localStorage:storage,fetch:fetchImpl,document:{},location:{origin:'https://example.org',pathname:'/perfil/',reload(){}},console});
  return {cloud:window.CalculusCloud,store};
}
function route(url) {
  const u = new URL(url);
  return u.pathname;
}

test('profile creation needs a successful server representation',async()=>{
  const received=[];
  const {cloud,store}=harness(async(url,options={})=>{
    received.push({url,options});
    if (route(url).endsWith('/player_profiles') && options.method==='POST')
      return reply([{user_id:userId,username:'Mestre',public_slug:'mestre-a1e207'}],201);
    return reply([]);
  },{[PENDING]:'Mestre'});
  const created=await cloud.ensureProfile(session,'Mestre');
  assert.equal(created.user_id,userId);
  assert.equal(received.length,2);
  assert.equal(store.has(PENDING),false);
});

test('empty profile creation does not falsely report success or clear pending username',async()=>{
  const {cloud,store}=harness(async()=>reply([]),{[PENDING]:'Mestre'});
  await assert.rejects(cloud.ensureProfile(session,'Mestre'),/confirmar o perfil/);
  assert.equal(store.get(PENDING),'Mestre');
});

test('another user ID in a profile response cannot be accepted',async()=>{
  const bad='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
  const {cloud}=harness(async(url,options={})=>options.method==='POST'?reply([{user_id:bad,username:'Intruso'}]):reply([]));
  await assert.rejects(cloud.ensureProfile(session,'Mestre'),/confirmar o perfil/);
});

test('successful save confirms matching user returned by Supabase',async()=>{
  let posts=0;
  const {cloud}=harness(async(url,options={})=>{
    if (options.method==='POST') {
      posts++;
      assert.equal(route(url),'/rest/v1/game_stats');
      assert.equal(options.headers.Prefer,'resolution=merge-duplicates,return=representation');
      assert.equal(JSON.parse(options.body).user_id,userId);
      return reply([{user_id:userId,trophies:0}],201);
    }
    return reply([{user_id:userId,username:'Mestre'}]);
  });
  const result=await cloud.syncProgress(session);
  assert.equal(result.user_id,userId);
  assert.equal(posts,1);
});

test('save returning no rows is a failed confirmation, not a cloud backup',async()=>{
  const {cloud}=harness(async(url,options={})=>options.method==='POST'?reply([]):reply([{user_id:userId}]));
  await assert.rejects(cloud.syncProgress(session),/confirmar o salvamento online/);
});

test('save with a different returned owner is rejected',async()=>{
  const {cloud}=harness(async(url,options={})=>options.method==='POST'?reply([{user_id:'other'}]):reply([{user_id:userId}]));
  await assert.rejects(cloud.syncProgress(session),/confirmar o salvamento online/);
});

test('invalid public profile slugs never touch the database',async()=>{
  let calls=0;
  const {cloud}=harness(async()=>{calls++;throw Error('unexpected');});
  for (const slug of ['a)or.true','../../../etc','', 'bad value', 'A', 'a'.repeat(49),null]) {
    assert.equal(await cloud.publicProfile(slug),null);
  }
  assert.equal(calls,0);
});

test('well-formed slugs retain the existing public profile request',async()=>{
  let calls=0;
  const {cloud}=harness(async(url)=>{
    calls++;
    assert.equal(new URL(url).searchParams.get('public_slug'),'eq.mestre-a1e207');
    return reply([]);
  });
  assert.equal(await cloud.publicProfile('mestre-a1e207'),null);
  assert.equal(calls,1);
});

test('invalid local session missing owner is purged without network access',async()=>{
  let calls=0;
  const invalid={access_token:'token',refresh_token:'refresh',expires_at:9999999999};
  const {cloud,store}=harness(async()=>{calls++;throw Error('unexpected');},{[SESSION]:JSON.stringify(invalid)});
  assert.equal(await cloud.session(),null);
  assert.equal(calls,0);
  assert.equal(store.has(SESSION),false);
});
