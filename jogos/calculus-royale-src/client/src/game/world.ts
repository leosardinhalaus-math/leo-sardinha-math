import * as T from 'three';

type Theme={accent:number;accent2:number;grass:number;foliage:number;sky:number;fog:number;rock:number;path:number;water:number;kind:'limits'|'derivatives'|'series'|'integrals'|'applications'};

// Cinco arquipélagos flutuantes inspirados diretamente nos mapas ilustrados.
// As duas rotas funcionais permanecem em Z = ±1,65, livres de colisões.
export function createWorld(index:number){
 const themes:Theme[]=[
  {kind:'limits',accent:0x4fdcff,accent2:0xffd66b,grass:0x426d4c,foliage:0x173f31,sky:0x071d46,fog:0x28568a,rock:0x26344c,path:0xe8d79c,water:0x169bd2},
  {kind:'derivatives',accent:0xff6a35,accent2:0xffd06a,grass:0x5f4d32,foliage:0x54251f,sky:0x35121c,fog:0x8c4436,rock:0x3d2c39,path:0xe8c88f,water:0xff5b2d},
  {kind:'series',accent:0xa276ff,accent2:0xf7d480,grass:0x343d54,foliage:0x392c66,sky:0x0b1645,fog:0x34356f,rock:0x292e4b,path:0xe0d2ac,water:0x6d58ff},
  {kind:'integrals',accent:0x59f0df,accent2:0xffda78,grass:0x3f6d4f,foliage:0x244b37,sky:0x083d54,fog:0x397f89,rock:0x33424d,path:0xeee1b2,water:0x39cad6},
  {kind:'applications',accent:0x48b9ff,accent2:0xffd363,grass:0x426c4b,foliage:0x173e2d,sky:0x092758,fog:0x315f92,rock:0x27384f,path:0xe7d9aa,water:0x168fd4},
 ];
 const theme=themes[index]??themes[0],root=new T.Group(),obstacles:T.Box3[]=[],animated:T.Object3D[]=[];root.name=`Ilha ${theme.kind}`;
 let seed=1471+index*811;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const std=(color:number,roughness=.68,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
 const rock=std(theme.rock,.92),grass=std(theme.grass,.82),foliage=std(theme.foliage,.86),path=std(theme.path,.72),gold=std(theme.accent2,.27,.74),stone=std(0xb9b5a7,.78,.12),dark=std(0x11182a,.72,.2),white=std(0xe7e0ca,.56,.16),wood=std(0x765038,.84);
 const glow=new T.MeshStandardMaterial({color:theme.accent,emissive:theme.accent,emissiveIntensity:1.45,roughness:.18,metalness:.3});
 const crystal=new T.MeshPhysicalMaterial({color:theme.accent,emissive:theme.accent,emissiveIntensity:1.8,roughness:.12,metalness:.25,transmission:.15,transparent:true,opacity:.9});
 const water=new T.MeshPhysicalMaterial({color:theme.water,emissive:theme.water,emissiveIntensity:.25,roughness:.16,metalness:.35,transparent:true,opacity:.82});
 function add(g:T.BufferGeometry,m:T.Material,x:number,y:number,z:number,solid=false,parent:T.Object3D=root){const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);if(solid){root.updateMatrixWorld(true);obstacles.push(new T.Box3().setFromObject(o));}return o;}
 const box=(w:number,h:number,d:number,m:T.Material,x:number,y:number,z:number,solid=false,parent:T.Object3D=root)=>add(new T.BoxGeometry(w,h,d,1,1,1),m,x,y,z,solid,parent);
 const cylinder=(rt:number,rb:number,h:number,segments:number,m:T.Material,x:number,y:number,z:number,solid=false,parent:T.Object3D=root)=>add(new T.CylinderGeometry(rt,rb,h,segments),m,x,y,z,solid,parent);
 const orb=(r:number,m:T.Material,x:number,y:number,z:number,parent:T.Object3D=root)=>add(new T.IcosahedronGeometry(r,2),m,x,y,z,false,parent);
 function beam(a:T.Vector3,b:T.Vector3,r:number,m:T.Material,parent:T.Object3D=root){const d=b.clone().sub(a),o=cylinder(r,r,d.length(),10,m,0,0,0,false,parent);o.position.copy(a).add(b).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return o;}
 function island(x:number,z:number,rx:number,rz:number,depth=3){const base=cylinder(1,.42,depth,40,rock,x,-depth/2+.03,z);base.scale.set(rx,1,rz);const top=cylinder(1,1,.18,40,grass,x,.06,z);top.scale.set(rx*1.01,1,rz*1.01);for(let i=0;i<Math.max(4,Math.floor(rx));i++){const a=random()*Math.PI*2,r=.55+random()*.38;const shard=add(new T.ConeGeometry(.2+random()*.28,.9+random()*1.4,6),rock,x+Math.cos(a)*rx*r,-depth-.2-random(),z+Math.sin(a)*rz*r);shard.rotation.z=(random()-.5)*.45;}return top;}
 function bridge(x:number,z:number,length:number,width:number,alongX=true){const group=new T.Group();group.position.set(x,.24,z);root.add(group);const deck=box(alongX?length:width,.16,alongX?width:length,path,0,0,0,false,group);for(const side of [-1,1]){const a=alongX?new T.Vector3(-length/2,.58,side*width/2):new T.Vector3(side*width/2,.58,-length/2);const b=alongX?new T.Vector3(length/2,.58,side*width/2):new T.Vector3(side*width/2,.58,length/2);beam(a,b,.045,gold,group);for(let i=0;i<5;i++){const t=i/4;const px=T.MathUtils.lerp(a.x,b.x,t),pz=T.MathUtils.lerp(a.z,b.z,t);beam(new T.Vector3(px,.03,pz),new T.Vector3(px,.58,pz),.025,gold,group);}}deck.receiveShadow=true;}
 function waterfall(x:number,z:number,w:number,h:number,rotation=0){const fall=box(w,h,.09,water,x,-h/2+.05,z);fall.rotation.y=rotation;fall.castShadow=false;const foam=orb(w*.45,glow,x,-h+.1,z);foam.scale.set(1,.18,.45);animated.push(fall);}
 function crystalCluster(x:number,z:number,scale=1){for(let i=0;i<5;i++){const a=i*Math.PI*2/5+random()*.4,c=add(new T.OctahedronGeometry((.17+random()*.15)*scale),crystal,x+Math.cos(a)*.32*scale,.42+random()*.35,z+Math.sin(a)*.32*scale);c.scale.y=1.7+random();}}
 function tree(x:number,z:number,h=1){cylinder(.07,.12,h*.5,8,wood,x,h*.25,z);for(let i=0;i<3;i++){const crown=orb(h*(.23-i*.03),i%2?foliage:grass,x+(i-1)*.1,h*(.62+i*.14),z+(i%2?.08:-.08));crown.scale.y=.9;}}
 function spire(x:number,z:number,h:number,material:T.Material=white,parent:T.Object3D=root){cylinder(.18,.28,h*.72,10,material,x,h*.36,z,false,parent);const roof=add(new T.ConeGeometry(.3,h*.32,10),gold,x,h*.88,z,false,parent);roof.castShadow=true;return roof;}
 function castle(x:number,z:number,scale=1){const g=new T.Group();g.position.set(x,.14,z);g.scale.setScalar(scale);root.add(g);box(2.5,1.25,1.7,white,0,.7,0,false,g);box(2.8,.16,1.95,gold,0,1.37,0,false,g);for(const sx of [-1.15,1.15])for(const sz of [-.72,.72])spire(sx,sz,2.25,stone,g);spire(0,-.1,3.2,white,g);const gate=box(.62,.9,.06,dark,0,.58,.88,false,g);const gateGlow=box(.38,.72,.07,glow,0,.58,.93,false,g);gateGlow.castShadow=false;for(let i=-2;i<=2;i++)spire(i*.38,-.65,1.9-i%2*.15,white,g);}
 function portal(x:number,z:number,scale=1){const group=new T.Group();group.position.set(x,.2,z);group.scale.setScalar(scale);root.add(group);const outer=add(new T.TorusGeometry(.7,.11,12,48),gold,0,.85,0,false,group),inner=add(new T.TorusGeometry(.55,.035,10,48),glow,0,.85,.02,false,group);outer.rotation.x=inner.rotation.x=0;const vortex=add(new T.CircleGeometry(.49,48),new T.MeshBasicMaterial({color:theme.accent,transparent:true,opacity:.58,side:T.DoubleSide,blending:T.AdditiveBlending,depthWrite:false}),0,.85,.01,false,group);animated.push(inner,vortex);for(const sx of [-.7,.7])spire(sx,0,1.35,stone,group);}
 function observatory(x:number,z:number,scale=1){const g=new T.Group();g.position.set(x,.18,z);g.scale.setScalar(scale);root.add(g);cylinder(.72,.85,.55,16,white,0,.28,0,false,g);const dome=add(new T.SphereGeometry(.69,20,12,0,Math.PI*2,0,Math.PI/2),dark,0,.55,0,false,g);const scope=cylinder(.13,.19,1.2,12,gold,.1,1.08,0,false,g);scope.rotation.z=-.8;dome.castShadow=true;}
 function armillary(x:number,z:number,scale=1){const g=new T.Group();g.position.set(x,.62,z);g.scale.setScalar(scale);root.add(g);orb(.18,glow,0,.45,0,g);for(let i=0;i<4;i++){const r=add(new T.TorusGeometry(.48+i*.05,.025,8,40),i%2?gold:glow,0,.45,0,false,g);r.rotation.set(i*.55,i*.7,.25+i*.2);}cylinder(.17,.33,.34,10,stone,0,.1,0,false,g);animated.push(g);}
 function marker(x:number,z:number,i:number){cylinder(.48,.58,.18,16,dark,x,.19,z);const ring=add(new T.TorusGeometry(.46,.045,8,32),gold,x,.3,z);ring.rotation.x=Math.PI/2;for(let n=0;n<(i%3)+1;n++)orb(.055,glow,x+(n-(i%3)/2)*.13,.42,z);}

 // Massa principal e satélites em camadas, como nas cinco artes.
 island(0,0,12.8,4.8,3.2);island(-5.8,-7,3.4,2.2,3.5);island(1,-7.2,3.2,2.05,3.2);island(7.5,-6.4,3.5,2.3,3.6);island(-7.2,6.5,3.4,2.2,3.5);island(6.8,6.6,3.8,2.35,3.8);
 bridge(-5.7,-4.95,4.2,1,false);bridge(1,-5,4.3,1,false);bridge(7,-4.65,4,1,false);bridge(-7,4.55,3.8,1,false);bridge(6.8,4.65,4,1,false);
 // Duas estradas de combate e a fenda central, ainda totalmente transitáveis.
 for(const z of [-1.65,1.65]){for(let x=-10.5;x<=10.5;x+=.72){const tile=box(.58,.055,1.05,path,x,.19,z);tile.rotation.y=(Math.sin(x*1.7)*.015);}bridge(0,z,2.55,1.2,true);}
 const river=box(1.55,.05,9.4,water,0,.17,0);river.castShadow=false;waterfall(0,4.55,1.4,5);waterfall(0,-4.55,1.4,5);
 // Torres funcionais ganham a linguagem de portais do mapa.
 for(const x of [-9.5,9.5])for(const z of [-1.65,1.65]){cylinder(.58,.78,.52,12,stone,x,.43,z,true);cylinder(.45,.55,.55,12,dark,x,.91,z);const crown=add(new T.ConeGeometry(.36,.65,8),gold,x,1.48,z);crown.castShadow=true;orb(.18,glow,x,1.82,z);}
 castle(8.5,0,1.05);portal(-9.8,0,.9);observatory(-7.4,-3.7,.9);armillary(7.5,3.3,.9);
 for(let i=0;i<8;i++){const x=-8+i*2.25,z=i%2?-3.35:3.35;marker(x,z,i);}
 for(const [x,z] of [[-10,-3.8],[-8,3.8],[-5,4],[-3,-3.8],[3,3.8],[5,-3.8],[8,3.8],[10,-3.6],[-7,-7],[7,-6.5]])crystalCluster(x,z,.8+random()*.5);
 for(let i=0;i<26;i++){const x=-11+random()*22,z=(random()>.5?1:-1)*(2.8+random()*1.45);if(Math.abs(x)<1.4)continue;tree(x,z,.75+random()*.65);}
 for(const [x,z,w] of [[-10.5,-2.8,.8],[-6.5,4.55,1],[-1.8,-4.55,1.2],[4.2,4.5,1],[9,-3.6,.8]])waterfall(x,z,w,3.8+random()*1.4);
 // Cristais sustentam a borda inferior das ilhas flutuantes.
 for(let i=0;i<18;i++){const a=i/18*Math.PI*2,x=Math.cos(a)*11.8,z=Math.sin(a)*4.25;const c=add(new T.ConeGeometry(.22+random()*.18,1.4+random()*1.5,7),crystal,x,-3.25-random()*.4,z);c.rotation.z=(random()-.5)*.45;}

 // Pontos de interesse específicos de cada referência.
 if(theme.kind==='limits'){
  const hourglass=new T.Group();hourglass.position.set(1,-.0,-7.1);root.add(hourglass);for(const y of [.35,1.35])cylinder(.5,.5,.1,16,gold,0,y,0,false,hourglass);const cone1=add(new T.ConeGeometry(.35,.48,16),crystal,0,.67,0,false,hourglass),cone2=add(new T.ConeGeometry(.35,.48,16),crystal,0,1.03,0,false,hourglass);cone2.rotation.z=Math.PI;animated.push(hourglass);
  portal(7.7,-6.3,.9);armillary(6.8,6.5,1.05);
 }else if(theme.kind==='derivatives'){
  for(const z of [-.65,.65]){const target=cylinder(.28,.28,.06,20,white,-6.5,.68,-7+z);target.rotation.x=Math.PI/2;for(const r of [.22,.13,.05]){const t=add(new T.TorusGeometry(r,.025,6,24),r<.1?glow:gold,-6.5,.68,-7+z);t.rotation.x=Math.PI/2;}}
  const tangent=beam(new T.Vector3(-1.1,.32,-7.4),new T.Vector3(2.4,1.45,-7.4),.035,glow);animated.push(tangent);portal(7.5,-6.3,.9);
 }else if(theme.kind==='integrals'){
  for(let i=0;i<7;i++){const a=i/7*Math.PI*2;const branch=beam(new T.Vector3(1,.35,-7.1),new T.Vector3(1+Math.cos(a)*.85,1.35+Math.sin(a)*.35,-7.1+Math.sin(a)*.55),.06,gold);branch.castShadow=true;}orb(.35,glow,1,1.45,-7.1);
  const gear=add(new T.TorusGeometry(.72,.16,8,16),gold,7.4,.85,-6.4);gear.rotation.x=Math.PI/2;animated.push(gear);portal(-5.8,-7,.9);
 }else if(theme.kind==='series'){
  box(2.2,1.1,1.25,dark,-5.8,.75,-7);for(let i=0;i<5;i++)box(.32,.5,.18,i%2?gold:glow,-6.5+i*.35,.8,-6.32);
  const convergence=orb(.6,crystal,1,1.05,-7.2);convergence.scale.y=1.7;animated.push(convergence);portal(7.5,-6.3,.9);
 }else{
  const globe=orb(.62,new T.MeshPhysicalMaterial({color:0x277fd0,metalness:.35,roughness:.25,clearcoat:1}),1,1.05,-7.2);for(let i=0;i<3;i++){const ring=add(new T.TorusGeometry(.78+i*.06,.025,8,40),gold,1,1.05,-7.2);ring.rotation.set(i*.7,i*.6,.3);}animated.push(globe);
  observatory(7.4,-6.3,1.05);for(let i=0;i<2;i++){const sail=box(.05,.85,.65,white,-5.8+i*.7,.75,-7);sail.rotation.z=-.35;box(1,.08,.34,wood,-5.8+i*.7,.25,-7);}
 }
 // Oceano/abismo e nuvens abaixo do arquipélago.
 const oceanMaterial=new T.ShaderMaterial({uniforms:{time:{value:0},deep:{value:new T.Color(theme.sky)},bright:{value:new T.Color(theme.water)}},vertexShader:`varying vec3 world;void main(){world=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(world,1.);}`,fragmentShader:`uniform float time;uniform vec3 deep,bright;varying vec3 world;void main(){float w=sin(world.x*.28+time*.35)*sin(world.z*.35-time*.22);vec3 c=mix(deep,bright,.24+w*.08);gl_FragColor=vec4(c,1.);#include <tonemapping_fragment>\n#include <colorspace_fragment>}`});
 oceanMaterial.fragmentShader=oceanMaterial.fragmentShader.replace(';#include',';\n#include');const ocean=add(new T.PlaneGeometry(180,180),oceanMaterial,0,-7,0);ocean.rotation.x=-Math.PI/2;ocean.castShadow=false;
 const cloudMat=new T.MeshBasicMaterial({color:0xd9efff,transparent:true,opacity:.32,depthWrite:false});for(let i=0;i<28;i++){const a=random()*Math.PI*2,r=13+random()*30,puff=orb(.9+random()*1.5,cloudMat,Math.cos(a)*r,-4.5+random()*2,Math.sin(a)*r);puff.scale.set(1.8,.35,.8);puff.castShadow=false;}
 root.userData.biomes=['castelo','portais','pontes','cachoeiras','cristais'];
 return {root,obstacles,accent:theme.accent,sky:theme.sky,fog:theme.fog,update(time:number){oceanMaterial.uniforms.time.value=time;for(const object of animated){if(object instanceof T.Group)object.rotation.y=time*.22;else if(object instanceof T.Mesh&&object.geometry instanceof T.CircleGeometry)object.rotation.z=time*.35;else object.rotation.y+=.006;}}};
}
