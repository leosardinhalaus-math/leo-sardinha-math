const assert=require('node:assert/strict');
const M=require('../malba-tahan/engine.js');
let seed=1931;const random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296};
const ids=['camelos','paes','quatros','vasos','xadrez','magico','amigos','perfeitos'];let checked=0;
for(const id of ids)for(let i=0;i<500;i++){
const v=M.generate(id,random);
if(id==='camelos'){assert.equal(v.total,v.n+1);assert.equal(v.answers[0]+v.answers[1]+v.answers[2]+v.answers[3],v.total);assert(v.answers.every(Number.isInteger));assert(v.answers[3]>=2);}
if(id==='paes'){assert(v.answers.every(x=>Number.isInteger(x)&&x>0));assert.equal(v.answers[0]+v.answers[1],v.coins);assert.equal(3*v.a-v.coins,v.answers[0]);}
if(id==='quatros'){assert.equal(M.expression(v.solution),v.target);assert.equal((v.solution.match(/4/g)||[]).length,4);}
if(id==='vasos'){assert(M.check(v,Array(9).fill(String(v.m/3))).ok);assert(!M.check(v,Array(9).fill('0')).ok);assert.equal(v.total,3*v.m);}
if(id==='xadrez'){let total=0;for(let j=0;j<v.cells;j++)total+=v.start*2**j;assert.equal(total,v.total);assert.equal(v.last,v.start*2**(v.cells-1));}
if(id==='magico'){const g=v.grid;for(let j=0;j<3;j++){assert.equal(g[j*3]+g[j*3+1]+g[j*3+2],v.constant);assert.equal(g[j]+g[j+3]+g[j+6],v.constant)}assert.equal(g[0]+g[4]+g[8],v.constant);assert.equal(g[2]+g[4]+g[6],v.constant);assert.equal(new Set(g).size,9);}
if(id==='amigos'){assert.equal(M.sum(v.da),v.b);assert.equal(M.sum(v.db),v.a);}
if(id==='perfeitos'){assert.equal(v.s,M.sum(v.d));assert(v.d.every(n=>n<v.n&&v.n%n===0));}
if(id!=='vasos')assert(M.check(v,id==='quatros'?[v.solution]:v.answers.map(String)).ok,id);
const next=M.next(id,v.key,random);assert.notEqual(String(next.key),String(v.key));checked++;
}
for(const s of ['4+4+4+44','4/0+4+4+4','alert(4)+4+4+4','4**4+4+4','(4+4)/(4-4)','4+4+4','44-44','4 4-4-4'])assert.throws(()=>M.expression(s));
assert.equal(M.expression('(4+4)÷(4+4)'),1);
console.log(`OK: ${checked} exemplos matemáticos, condições das partilhas, oito somas dos quadrados, soluções e validação de expressões.`);
