const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'..'),data=JSON.parse(fs.readFileSync(path.join(root,'ensino-medio/curriculo.json'))),M=require('../ensino-medio/math.js');
test('complete homologated EM13MAT inventory, unique codes and official page references',()=>{
 const expected=[...[101,102,103,104,105,106],201,202,203,...Array.from({length:16},(_,i)=>301+i),...Array.from({length:7},(_,i)=>401+i),...Array.from({length:11},(_,i)=>501+i)].map(n=>'EM13MAT'+n);
 assert.deepEqual(data.skills.map(s=>s.code),expected);assert.equal(new Set(data.skills.map(s=>s.code)).size,43);
 const html=fs.readFileSync(path.join(root,'ensino-medio/index.html'),'utf8');
 for(const s of data.skills){assert.ok(s.activity&&s.question&&s.answer&&s.evidence&&s.relation);assert.ok(data.resources[s.resource]);assert.ok(s.page>=534&&s.page<=542);assert.ok(html.includes(`id="${s.code}"`));}
});
test('mapped local resources and linked portal assets exist',()=>{
 for(const r of Object.values(data.resources)){if(!r.href||r.href.startsWith('#'))continue;const clean=r.href.split(/[?#]/)[0];assert.ok(fs.existsSync(path.resolve(root,'ensino-medio',clean)),r.href);}
 const html=fs.readFileSync(path.join(root,'ensino-medio/index.html'),'utf8');for(const match of html.matchAll(/(?:href|src)="([^"#]+)"/g)){let url=match[1];if(/^https?:/.test(url))continue;url=url.split(/[?#]/)[0];assert.ok(fs.existsSync(path.resolve(root,'ensino-medio',url)),url);}
});
const p={family:'quadratic',a:-1,b:10,c:0,q:2,min:0,max:10};
test('canteiro: area maximum and endpoints match the physical model',()=>{assert.equal(M.value(p,0),0);assert.equal(M.value(p,5),25);assert.equal(M.value(p,10),0);assert.ok(M.sample(p).every(({y})=>y>=0&&y<=25));});
test('octaves and inverse exponential/logarithm',()=>{const exp={...p,family:'exponential',a:220};assert.equal(M.value(exp,3),1760);const log={...p,family:'logarithmic',min:.25,max:8};for(const x of [-2,0,3])assert.ok(Math.abs(M.value(log,2**x)-x)<1e-12);});
test('invalid domains and overflow give actionable rejection rather than corrupt SVG',()=>{assert.throws(()=>M.sample({...p,min:10,max:0}));assert.throws(()=>M.sample({...p,family:'logarithmic',min:0}));for(const q of [0,1,-2])assert.throws(()=>M.sample({...p,family:'exponential',q}));assert.throws(()=>M.sample({...p,family:'exponential',q:100,min:0,max:1000}));assert.throws(()=>M.sample({...p,a:NaN}));});
