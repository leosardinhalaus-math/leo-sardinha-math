// Verifica a geometria publicada e a recomposição das fotos em posições fechadas do anel.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../matematica-em-papel/index.html'),'utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1].replace(/\nrender\(\);\s*$/,'');
const api=vm.runInNewContext(script+'\n;({kClassicGeometry,kEdges,kPhotoTriangle,kAffine,kaleidoTypes})');
const add=(a,b)=>a.map((v,i)=>v+b[i]);
const mul=(v,k)=>v.map(x=>x*k);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
for(const type of ['hex','oct']){
 test(type+': 4 faces por módulo, triângulos congruentes e abas com bordas correspondentes',()=>{
  const g=api.kClassicGeometry(type),leg=Math.hypot(g.base/2,g.height),expected=[g.base,leg,leg].sort((a,b)=>a-b);
  assert.equal(g.faces.length,g.n*4);
  assert.equal([...api.kEdges(g.faces).values()].filter(e=>e.count===1).length,g.n*2+4);
  for(const f of g.faces){const sides=Array.from(f.points,(p,i)=>Math.hypot(p[0]-f.points[(i+1)%3][0],p[1]-f.points[(i+1)%3][1])).sort((a,b)=>a-b);sides.forEach((n,i)=>assert(Math.abs(n-expected[i])<1e-8));for(const p of f.points){assert(p[0]>0&&p[0]<277);assert(p[1]>0&&p[1]<160)}}
  for(let i=0;i<g.n;i++){let len=([a,b])=>Math.hypot(a[0]-b[0],a[1]-b[1]);assert(Math.abs(len(g.top[i])-len(g.bottom[i]))<1e-8)}
 });
 for(let phase=0;phase<4;phase++)test(`${type}: foto ${phase+1} recomposta em um único polígono após o fechamento`,()=>{
  // Construção independente em 3D: eixos de dobradiças consecutivas ortogonais.
  const g=api.kClassicGeometry(type),n=g.n,h=api.kaleidoTypes[type].alt,d=Math.sqrt(h*h-.25),verticalEven=phase===0||phase===2;
  const u=Array.from({length:n},(_,i)=>{let vertical=verticalEven?i%2===0:i%2===1,angle=(verticalEven?i-1:i)*2*Math.PI/n;return vertical?[0,0,1]:[Math.cos(angle),Math.sin(angle),0]});
  let m=[[0,0,0]];
  for(let i=0;i<n;i++)m.push(add(m[i],mul(cross(u[i],u[(i+1)%n]),d*(i%2?-1:1))));
  assert(Math.hypot(...m[n])<1e-10,'As duas extremidades do anel devem coincidir.');m.pop();
  const mean=m.reduce((s,v)=>add(s,mul(v,1/n)),[0,0,0]);m=m.map(v=>add(v,mul(mean,-1)));
  const A=m.map((v,i)=>add(v,mul(u[i],-.5))),B=m.map((v,i)=>add(v,mul(u[i],.5)));
  let source=[],projection=[];
  for(const f of g.faces.filter(f=>f.photo===phase)){
   const i=f.module,j=(i+1)%n,C=B[j],D=A[j],face=i%2?3-phase:phase;
   const vertices=[[A[i],C,D],[C,A[i],B[i]],[B[i],C,D],[D,B[i],A[i]]][face];
   source.push(...api.kPhotoTriangle(f,type));
   projection.push(...vertices.map(v=>[(phase===0||phase===3?-1:1)*v[0],v[1]]));
  }
  assert.equal(source.length,n*3);
  // Uma única transformação da imagem completa deve servir para TODOS os setores.
  const t=api.kAffine(source.slice(0,3),projection.slice(0,3));
  source.forEach((p,i)=>assert(Math.hypot(t[0]*p[0]+t[2]*p[1]+t[4]-projection[i][0],t[1]*p[0]+t[3]*p[1]+t[5]-projection[i][1])<1e-10,'Os pedaços da foto precisam se encontrar sem espelhamento ou troca de setores.'));
 });
}
