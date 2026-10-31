const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../matematica-em-papel/index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1].replace(/\nrender\(\);\s*$/,'');
const api=vm.runInNewContext(source+';({kCubePose,kCubeGeometry,kCubeSource,kAffine,kOutline})');
const dist=(a,b)=>Math.hypot(...a.map((x,i)=>x-b[i]));
const area=p=>Math.abs(p.reduce((s,a,i)=>{let b=p[(i+1)%p.length];return s+a[0]*b[1]-a[1]*b[0]},0))/2;
const near=(a,b)=>assert(Math.abs(a-b)<1e-7,`${a} != ${b}`);
test('Schatz: six rigid tetrahedra and all six hinges close throughout a full cycle',()=>{
 const edges=[[0,1,1],[2,3,1],[0,2,Math.sqrt(5)],[1,3,Math.sqrt(3)],[0,3,2],[1,2,2]];
 for(let j=0;j<96;j++){let ring=api.kCubePose(j*Math.PI/48);ring.forEach((tet,i)=>{edges.forEach(([a,b,d])=>near(dist(tet[a],tet[b]),d));for(const id of i%2?[0,1]:[2,3])near(dist(tet[id],ring[(i+1)%6][id]),0)})}
});
test('Six printable nets preserve every 3D edge length and opposite face winding',()=>{
 const ring=api.kCubePose(0),net=api.kCubeGeometry();assert.equal(net.length,6);
 for(const {module,faces}of net){assert.equal(faces.length,4);for(const f of faces){for(let i=0;i<3;i++){near(dist(f.points[i],f.points[(i+1)%3]),18*dist(ring[module][f.ids[i]],ring[module][f.ids[(i+1)%3]]));assert(f.points[i][0]>3&&f.points[i][0]<274);assert(f.points[i][1]>24&&f.points[i][1]<163)}let [a,b,c]=f.points;assert((b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])>0)}}
});
for(let photo=0;photo<4;photo++)test(`Photo ${photo+1}: six sectors tile the triangle, without overlapping interiors; affine print matches each vertex`,()=>{
 const faces=api.kCubeGeometry().flatMap(p=>p.faces).filter(f=>f.photo===photo),outline=api.kOutline('cube');near(faces.reduce((s,f)=>s+area(f.source),0),area(outline));
 const inside=(p,t)=>{let signs=t.map((a,i)=>{let b=t[(i+1)%3];return (b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0])});return signs.every(x=>x>1e-6)||signs.every(x=>x< -1e-6)};
 for(let x=97.31;x<907;x+=17.87)for(let y=31.73;y<735;y+=19.11){let p=[x,y],expected=inside(p,[outline[0],outline[2],outline[4]]);assert.equal(faces.filter(f=>inside(p,f.source)).length,expected?1:0)}
 for(const f of faces){const m=api.kAffine(f.source,f.points);f.source.forEach((p,i)=>{near(m[0]*p[0]+m[2]*p[1]+m[4],f.points[i][0]);near(m[1]*p[0]+m[3]*p[1]+m[5],f.points[i][1])})}
});
test('Each tetrahedron net has four non-overlapping printable faces',()=>{
 const clip=vm.runInNewContext(source+';pgClip');
 for(const {faces}of api.kCubeGeometry())for(let i=0;i<4;i++)for(let j=i+1;j<4;j++){let overlap=faces[i].points;for(let k=0;k<3&&overlap.length;k++){let a=faces[j].points[k],b=faces[j].points[(k+1)%3],n=[a[1]-b[1],b[0]-a[0]];overlap=clip(overlap,n,a[0]*n[0]+a[1]*n[1])}assert(area(overlap)<1e-7)}
});
