const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('release security gates: secret protection',()=>{
 const ignore=read('.gitignore');
 for(const pattern of ['.env','.env.*','*.pem','*.p12','*.pfx','*.key']) assert.ok(ignore.includes(pattern),'missing ignore '+pattern);
 assert.ok(read('.github/workflows/secret-guard.yml').includes('check_tracked_secrets.py'));
 assert.ok(read('.github/workflows/history-secret-audit.yml').includes('fetch-depth: 0'));
 assert.ok(read('tools/check_git_history_secrets.py').includes('value withheld'));
});
test('release security gates: auth and published player',()=>{
 const cfg=read('jogos/calculus-royale/cloud-config.js');
 assert.ok(cfg.includes("provider: 'supabase'"));
 assert.equal(cfg,read('jogos/calculus-royale-src/client/public/cloud-config.js'));
 const player=read('jogos/calculus-royale/player.js');
 assert.equal(player,read('jogos/calculus-royale-src/client/public/player.js'));
 assert.ok(player.includes('public_slug=eq.'));
 assert.ok(!player.split('\n').find(x=>x.includes('player_profiles?public_slug=eq.')).includes('select=*'));
 assert.ok(!player.split('\n').find(x=>x.includes('game_stats?user_id=eq.')&&x.includes('profile.user_id')).includes('select=*'));
});
test('release security gates: policies and CI',()=>{
 const rules=read('firestore.rules');
 assert.match(rules,/match \/leaderboard\/\{id\}/);
 assert.match(rules,/allow write: if false/);
 assert.match(rules,/allow read, delete: if owner\(id\)/);
 assert.ok(read('.github/workflows/dependency-audit.yml').includes('npm audit'));
});

test('Calculus Royale build cannot push unreviewed artifacts to main',()=>{
 const workflow=read('.github/workflows/build-calculus-royale.yml');
 assert.match(workflow,/contents: read/);
 assert.match(workflow,/persist-credentials: false/);
 assert.match(workflow,/actions\/upload-artifact@v4/);
 assert.doesNotMatch(workflow,/git push|git commit|contents:\s*write/);
 assert.match(workflow,/calculus-royale-build-candidate/);
});
