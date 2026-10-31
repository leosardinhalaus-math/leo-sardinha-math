const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../matematica-em-papel/index.html'),'utf8');
const source=html.match(/<script>([\s\S]*?)<\/script>/)[1].replace(/\nrender\(\);\s*$/,'');
const api=vm.runInNewContext(source+';({ppGeometry,ppAffinePairs,pgArea,spGeometry,spPoint})');
const geo=api.ppGeometry();
const contains=(poly,p)=>{let sign=0;for(let i=0;i<poly.length;i++){let a=poly[i],b=poly[(i+1)%poly.length],d=(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);if(Math.abs(d)<1e-10)continue;let s=Math.sign(d);if(sign&&s!==sign)return false;sign=s}return true};
test('Poly Puzzle: 21 peças, mesma área e isometria com inversão de lado em todas as peças',()=>{
 assert.equal(geo.pieces.length,21);
 for(const side of ['front','back'])assert(Math.abs(geo.pieces.reduce((s,p)=>s+api.pgArea(p[side]),0)-3*Math.sqrt(3)/2)<1e-10);
 for(const p of geo.pieces){let t=api.ppAffinePairs(p.front,p.back);assert(Math.abs(t[0]*t[3]-t[1]*t[2]+1)<1e-9);assert(Math.abs(t[0]**2+t[1]**2-1)<1e-9);assert(Math.abs(t[2]**2+t[3]**2-1)<1e-9);assert(Math.abs(t[0]*t[2]+t[1]*t[3])<1e-9);for(let i=0;i<p.front.length;i++)for(let j=0;j<p.front.length;j++)assert(Math.abs(Math.hypot(p.front[i][0]-p.front[j][0],p.front[i][1]-p.front[j][1])-Math.hypot(p.back[i][0]-p.back[j][0],p.back[i][1]-p.back[j][1]))<1e-9)}
});
test('Poly Puzzle: hexágono e quadrado cobertos sem lacunas nem sobreposição em amostra independente',()=>{
 for(let i=0;i<53;i++)for(let j=0;j<53;j++){
  let front=[-1+(i+.371)*2/53,-Math.sqrt(3)/2+(j+.619)*Math.sqrt(3)/53];
  assert.equal(geo.pieces.filter(p=>contains(p.front,front)).length,contains(geo.hex,front)?1:0,'Cobertura da frente');
  let back=[(i+.371)*geo.side/53,(j+.619)*geo.side/53];assert.equal(geo.pieces.filter(p=>contains(p.back,back)).length,1,'Cobertura do verso');
 }
});
test('Sphericon: setores de 127,279°, arco de semicírculo e área total correta',()=>{
 let g=api.spGeometry(35);assert(Math.abs(g.angle*180/Math.PI-127.27922061357856)<1e-10);assert(Math.abs(g.slant*g.angle-35*Math.PI)<1e-10);assert(Math.abs(4*g.slant**2*g.angle/2-2*Math.SQRT2*Math.PI*35**2)<1e-8);
 for(let k=0;k<4;k++)assert(Math.abs(Math.hypot(...api.spPoint(k,1,.37))-1)<1e-10);
});
test('Sphericon: todas as emendas curvas e retas fecham em 3D com orientação oposta',()=>{
 const same=(a,b)=>assert(Math.hypot(...a.map((v,i)=>v-b[i]))<1e-10);
 for(let i=0;i<=20;i++){let u=i/20;same(api.spPoint(0,1,u),api.spPoint(1,1,1-u));same(api.spPoint(2,1,u),api.spPoint(3,1,1-u));for(const [a,ta,b,tb]of [[0,0,2,0],[0,1,3,1],[1,0,3,0],[1,1,2,1]])same(api.spPoint(a,u,ta),api.spPoint(b,1-u,tb))}
});
