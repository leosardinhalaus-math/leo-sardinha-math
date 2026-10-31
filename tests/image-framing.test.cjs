const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../matematica-em-papel/index.html'),'utf8'),source=html.match(/<script>([\s\S]*?)<\/script>/)[1].replace(/\nrender\(\);\s*$/,'');
const{photoFrame,kOutline}=vm.runInNewContext(source+';({photoFrame,kOutline})');
for(const type of ['hex','oct'])for(const [w,h]of [[800,1600],[1800,1000],[3000,500],[600,600]]){
 test(`${type} ${w}×${h}: a foto inteira cabe na forma sem corte nem distorção`,()=>{let poly=kOutline(type),f=photoFrame(w,h,poly,false);assert.deepEqual(Array.from(f.source),[0,0,w,h]);let[x,y,W,H]=f.target;assert(Math.abs(W/H-w/h)<1e-9);for(let p of[[x,y],[x+W,y],[x+W,y+H],[x,y+H]])for(let i=0;i<poly.length;i++){let a=poly[i],b=poly[(i+1)%poly.length];assert((b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0])>=-1e-6)}});
 test(`${type} ${w}×${h}: preencher cobre toda a forma e preserva proporção`,()=>{let poly=kOutline(type);for(let pos of[0,50,100]){let f=photoFrame(w,h,poly,true,1.5,pos,pos),[sx,sy,sw,sh]=f.source,[x,y,W,H]=f.target;assert(sx>=-1e-9&&sy>=-1e-9&&sx+sw<=w+1e-9&&sy+sh<=h+1e-9);assert(Math.abs(sw/sh-W/H)<1e-9);for(let p of poly)assert(p[0]>=x-1e-9&&p[0]<=x+W+1e-9&&p[1]>=y-1e-9&&p[1]<=y+H+1e-9)}});
}
