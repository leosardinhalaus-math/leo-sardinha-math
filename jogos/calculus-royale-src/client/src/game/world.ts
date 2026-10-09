import * as T from 'three';

type Theme={accent:number;accent2:number;grass:number;foliage:number;sky:number;fog:number;rock:number;path:number;water:number;kind:'limits'|'derivatives'|'series'|'integrals'|'applications'};

// Cinco arquipélagos flutuantes inspirados diretamente nos mapas ilustrados.
// As duas rotas funcionais permanecem em Z = ±1,65, livres de colisões.
export function createWorld(index:number){
 const themes:Theme[]=[
  {kind:'limits',accent:0x4fdcff,accent2:0xffd66b,grass:0x385e43,foliage:0x123429,sky:0x041432,fog:0x173b69,rock:0x202c43,path:0xdacb94,water:0x0a6599},
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
 function irregularCylinder(topRadius:number,bottomRadius:number,height:number,phase:number,amount:number){const geometry=new T.CylinderGeometry(topRadius,bottomRadius,height,20,1,false),position=geometry.attributes.position as T.BufferAttribute;for(let i=0;i<position.count;i++){const px=position.getX(i),pz=position.getZ(i);if(Math.abs(px)+Math.abs(pz)<.001)continue;const angle=Math.atan2(pz,px),variation=1+Math.sin(angle*3+phase)*amount+Math.sin(angle*7-phase*.7)*amount*.55;position.setX(i,px*variation);position.setZ(i,pz*variation);}position.needsUpdate=true;geometry.computeVertexNormals();return geometry;}
 function island(x:number,z:number,rx:number,rz:number,depth=3){const phase=random()*Math.PI*2,base=add(irregularCylinder(1,.42,depth,phase,.1),rock,x,-depth/2+.03,z);base.scale.set(rx,1,rz);const top=add(irregularCylinder(1,1,.18,phase,.075),grass,x,.06,z);top.scale.set(rx*1.01,1,rz*1.01);for(let i=0;i<Math.max(4,Math.floor(rx));i++){const a=random()*Math.PI*2,r=.55+random()*.38;const shard=add(new T.ConeGeometry(.2+random()*.28,.9+random()*1.4,6),rock,x+Math.cos(a)*rx*r,-depth-.2-random(),z+Math.sin(a)*rz*r);shard.rotation.z=(random()-.5)*.45;}return top;}
 function bridge(x:number,z:number,length:number,width:number,alongX=true){const group=new T.Group();group.position.set(x,.24,z);root.add(group);const deck=box(alongX?length:width,.16,alongX?width:length,path,0,0,0,false,group);for(const side of [-1,1]){const a=alongX?new T.Vector3(-length/2,.58,side*width/2):new T.Vector3(side*width/2,.58,-length/2);const b=alongX?new T.Vector3(length/2,.58,side*width/2):new T.Vector3(side*width/2,.58,length/2);beam(a,b,.045,gold,group);for(let i=0;i<5;i++){const t=i/4;const px=T.MathUtils.lerp(a.x,b.x,t),pz=T.MathUtils.lerp(a.z,b.z,t);beam(new T.Vector3(px,.03,pz),new T.Vector3(px,.58,pz),.025,gold,group);}}deck.receiveShadow=true;}
 function waterfall(x:number,z:number,w:number,h:number,rotation=0){const fall=box(w,h,.09,water,x,-h/2+.05,z);fall.rotation.y=rotation;fall.castShadow=false;const foam=orb(w*.45,glow,x,-h+.1,z);foam.scale.set(1,.18,.45);animated.push(fall);}
 function crystalCluster(x:number,z:number,scale=1){for(let i=0;i<5;i++){const a=i*Math.PI*2/5+random()*.4,c=add(new T.OctahedronGeometry((.17+random()*.15)*scale),crystal,x+Math.cos(a)*.32*scale,.42+random()*.35,z+Math.sin(a)*.32*scale);c.scale.y=1.7+random();}}
 function tree(x:number,z:number,h=1){cylinder(.07,.12,h*.5,8,wood,x,h*.25,z);for(let i=0;i<3;i++){const crown=orb(h*(.23-i*.03),i%2?foliage:grass,x+(i-1)*.1,h*(.62+i*.14),z+(i%2?.08:-.08));crown.scale.y=.9;}}
 function spire(x:number,z:number,h:number,material:T.Material=white,parent:T.Object3D=root){cylinder(.18,.28,h*.72,10,material,x,h*.36,z,false,parent);const roof=add(new T.ConeGeometry(.3,h*.32,10),gold,x,h*.88,z,false,parent);roof.castShadow=true;return roof;}
 function castle(x:number,z:number,scale=1){const g=new T.Group();g.position.set(x,.14,z);g.scale.setScalar(scale);root.add(g);box(2.5,1.25,1.7,white,0,.7,0,false,g);box(2.8,.16,1.95,gold,0,1.37,0,false,g);for(const sx of [-1.15,1.15])for(const sz of [-.72,.72])spire(sx,sz,2.25,stone,g);spire(0,-.1,3.2,white,g);const gate=box(.62,.9,.06,dark,0,.58,.88,false,g);const gateGlow=box(.38,.72,.07,glow,0,.58,.93,false,g);gateGlow.castShadow=false;for(let i=-2;i<=2;i++)spire(i*.38,-.65,1.9-i%2*.15,white,g);}
 function portal(x:number,z:number,scale=1){const group=new T.Group();group.position.set(x,.2,z);group.scale.setScalar(scale);root.add(group);const outer=add(new T.TorusGeometry(.7,.11,12,48),gold,0,.85,0,false,group),inner=add(new T.TorusGeometry(.55,.035,10,48),glow,0,.85,.02,false,group);outer.rotation.x=inner.rotation.x=0;const vortex=add(new T.CircleGeometry(.49,48),new T.MeshBasicMaterial({color:theme.accent,transparent:true,opacity:.58,side:T.DoubleSide,blending:T.AdditiveBlending,depthWrite:false}),0,.85,.01,false,group);animated.push(inner,vortex);for(const sx of [-.7,.7])spire(sx,0,1.35,stone,group);}
 function observatory(x:number,z:number,scale=1){const g=new T.Group();g.position.set(x,.18,z);g.scale.setScalar(scale);root.add(g);cylinder(.72,.85,.55,16,white,0,.28,0,false,g);const dome=add(new T.SphereGeometry(.69,20,12,0,Math.PI*2,0,Math.PI/2),dark,0,.55,0,false,g);const scope=cylinder(.13,.19,1.2,12,gold,.1,1.08,0,false,g);scope.rotation.z=-.8;dome.castShadow=true;}
 function armillary(x:number,z:number,scale=1){const g=new T.Group();g.position.set(x,.62,z);g.scale.setScalar(scale);root.add(g);orb(.18,glow,0,.45,0,g);for(let i=0;i<4;i++){const r=add(new T.TorusGeometry(.48+i*.05,.025,8,40),i%2?gold:glow,0,.45,0,false,g);r.rotation.set(i*.55,i*.7,.25+i*.2);}cylinder(.17,.33,.34,10,stone,0,.1,0,false,g);animated.push(g);}
 function obelisk(x:number,z:number,scale=1){const g=new T.Group();g.name='Landmark_1_7_Obelisco';g.position.set(x,.16,z);g.scale.setScalar(scale);root.add(g);cylinder(.52,.68,.18,8,gold,0,.09,0,false,g);const shaft=box(.42,1.45,.42,dark,0,.89,0,false,g);shaft.rotation.y=Math.PI/4;const tip=add(new T.OctahedronGeometry(.36),crystal,0,1.72,0,false,g);tip.scale.y=1.55;for(const y of [.55,.9,1.25]){const rune=box(.04,.08,.24,glow,-.31,y,0,false,g);rune.rotation.z=Math.PI/4;}animated.push(tip);}
 function ruins(x:number,z:number,scale=1){const g=new T.Group();g.name='Landmark_1_4_Ruinas';g.position.set(x,.13,z);g.scale.setScalar(scale);root.add(g);for(const [px,pz,h] of [[-.72,-.35,1.35],[.72,-.35,1.05],[-.72,.42,.9],[.72,.42,1.48]] as const){cylinder(.11,.16,h,10,stone,px,h/2,pz,false,g);cylinder(.18,.2,.11,10,gold,px,h+.03,pz,false,g);}const lintel=box(1.62,.18,.24,stone,0,1.43,.42,false,g);lintel.rotation.z=-.08;crystalCluster(x-.15,z+.04,.62*scale);}
 function guardianStatue(x:number,z:number,side:-1|1){const g=new T.Group();g.name=side<0?'Guardiao_Aproximacao':'Guardiao_Infinito';g.position.set(x,.18,z);g.scale.setScalar(1.48);root.add(g);const robe=add(new T.ConeGeometry(.72,2.15,20),std(0x25344e,.76,.08),0,1.08,0,false,g);robe.castShadow=true;const shoulder=add(new T.SphereGeometry(.58,20,12),std(0x344764,.68,.08),0,2.05,0,false,g);shoulder.scale.set(1,.48,.72);const hood=add(new T.SphereGeometry(.43,20,14),dark,0,2.48,0,false,g);hood.scale.set(1,.98,.86);const face=add(new T.SphereGeometry(.27,18,12),std(0xc9bba9,.62),-.11,2.43,0,false,g);face.scale.set(.72,1,.8);const hand=new T.Vector3(-.42,2.2,-side*.78);beam(new T.Vector3(-.05,2.05,0),hand,.09,white,g);orb(.11,std(0xc9bba9,.62),hand.x,hand.y,hand.z,g);if(side<0){const magic=orb(.25,crystal,hand.x-.03,hand.y+.3,hand.z,g);animated.push(magic);}else{for(let i=0;i<3;i++){const ring=add(new T.TorusGeometry(.29+i*.1,.025,8,32),i%2?glow:gold,hand.x,hand.y+.32,hand.z,false,g);ring.rotation.y=Math.PI/2;ring.rotation.z=i*.7;animated.push(ring);}}}
 function infinitySigil(x:number,y:number,z:number){const points:T.Vector3[]=[];for(let i=0;i<72;i++){const t=i/72*Math.PI*2;points.push(new T.Vector3(x,y+Math.sin(2*t)*.58,z+Math.sin(t)*1.28));}const curve=new T.CatmullRomCurve3(points,true,'centripetal');const sigil=add(new T.TubeGeometry(curve,120,.055,8,true),glow,0,0,0);sigil.name='Simbolo_Infinito';sigil.castShadow=false;animated.push(sigil);return sigil;}
 function marker(x:number,z:number,i:number){cylinder(.48,.58,.18,16,dark,x,.19,z);const ring=add(new T.TorusGeometry(.46,.045,8,32),gold,x,.3,z);ring.rotation.x=Math.PI/2;for(let n=0;n<(i%3)+1;n++)orb(.055,glow,x+(n-(i%3)/2)*.13,.42,z);}

 // Massa principal e satélites em camadas, como nas cinco artes.
 island(0,0,12.8,4.8,3.2);island(-5.8,-7,3.4,2.2,3.5);island(1,-7.2,3.2,2.05,3.2);island(7.5,-6.4,3.5,2.3,3.6);island(-7.2,6.5,3.4,2.2,3.5);island(6.8,6.6,3.8,2.35,3.8);
 bridge(-5.7,-4.95,4.2,1,false);bridge(1,-5,4.3,1,false);bridge(7,-4.65,4,1,false);bridge(-7,4.55,3.8,1,false);bridge(6.8,4.65,4,1,false);
 // Duas estradas de combate e a fenda central, ainda totalmente transitáveis.
 for(const z of [-1.65,1.65]){for(let x=-10.5;x<=10.5;x+=.72){const tile=box(.58,.055,1.05,path,x,.19,z);tile.rotation.y=(Math.sin(x*1.7)*.015);}bridge(0,z,2.55,1.2,true);}
 const river=box(1.55,.05,9.4,water,0,.17,0);river.castShadow=false;waterfall(0,4.55,1.4,5);waterfall(0,-4.55,1.4,5);
 // Torres funcionais ganham a linguagem de portais do mapa.
 for(const x of [-9.5,9.5])for(const z of [-1.65,1.65]){cylinder(.58,.78,.52,12,stone,x,.43,z,true);cylinder(.45,.55,.55,12,dark,x,.91,z);const crown=add(new T.ConeGeometry(.36,.65,8),gold,x,1.48,z);crown.castShadow=true;orb(.18,glow,x,1.82,z);}
 castle(8.5,0,theme.kind==='limits'?1.42:1.05);portal(-9.8,0,.9);observatory(-7.4,-3.7,theme.kind==='limits'?1.08:.9);armillary(7.5,3.3,theme.kind==='limits'?1.08:.9);
 for(let i=0;i<8;i++){const x=-8+i*2.25,z=i%2?-3.35:3.35;marker(x,z,i);}
 for(const [x,z] of [[-10,-3.8],[-8,3.8],[-5,4],[-3,-3.8],[3,3.8],[5,-3.8],[8,3.8],[10,-3.6],[-7,-7],[7,-6.5]])crystalCluster(x,z,.8+random()*.5);
 for(let i=0;i<26;i++){const x=-11+random()*22,z=(random()>.5?1:-1)*(2.8+random()*1.45);if(Math.abs(x)<1.4)continue;tree(x,z,.75+random()*.65);}
 for(const [x,z,w] of [[-10.5,-2.8,.8],[-6.5,4.55,1],[-1.8,-4.55,1.2],[4.2,4.5,1],[9,-3.6,.8]])waterfall(x,z,w,3.8+random()*1.4);
 // Cristais sustentam a borda inferior das ilhas flutuantes.
 for(let i=0;i<18;i++){const a=i/18*Math.PI*2,x=Math.cos(a)*11.8,z=Math.sin(a)*4.25;const c=add(new T.ConeGeometry(.22+random()*.18,1.4+random()*1.5,7),crystal,x,-3.25-random()*.4,z);c.rotation.z=(random()-.5)*.45;}

 // Pontos de interesse específicos de cada referência.
 if(theme.kind==='limits'){
  // O eixo X é o avanço sul→norte na câmera: o spawn fica em X negativo e o castelo em X positivo.
  const hourglass=new T.Group();hourglass.name='Landmark_1_5_Ampulheta';hourglass.position.set(-6.75,.02,0);hourglass.scale.setScalar(1.15);root.add(hourglass);for(const y of [.35,1.35])cylinder(.5,.5,.1,16,gold,0,y,0,false,hourglass);for(const z of [-.42,.42])for(const x of [-.36,.36])beam(new T.Vector3(x,.38,z),new T.Vector3(x,1.32,z),.035,gold,hourglass);const cone1=add(new T.ConeGeometry(.35,.48,16),crystal,0,.67,0,false,hourglass),cone2=add(new T.ConeGeometry(.35,.48,16),crystal,0,1.03,0,false,hourglass);cone2.rotation.z=Math.PI;animated.push(hourglass,cone1,cone2);
  ruins(-.7,-3.45,.92);crystalCluster(-4.1,-3.55,1.28);obelisk(4.55,3.48,.94);portal(2.4,3.55,.9);portal(10.15,3.75,.92);armillary(7.15,3.42,1.12);
  guardianStatue(9.45,-2.78,-1);guardianStatue(9.45,2.78,1);infinitySigil(10.05,4.25,0);
  // Cascatas laterais enquadram o castelo sem ocupar as duas faixas transitáveis.
  waterfall(8.2,-3.85,.72,3.5);waterfall(8.2,3.85,.72,3.5);
  for(const [x,z] of [[-8.1,-3.75],[-4.1,-3.8],[-.7,-3.7],[2.4,3.8],[4.6,3.75],[7.2,3.72]]){const lamp=cylinder(.055,.08,.5,8,gold,x,.43,z);orb(.09,glow,x,.78,z);lamp.castShadow=false;}
  root.userData.landmarks=[
   {id:'1.1',name:'Castelo do Limite',position:[8.5,0]},
   {id:'1.2',name:'Observatório da Tangente',position:[-7.4,-3.7]},
   {id:'1.3',name:'Campo de Cristais',position:[-4.1,-3.55]},
   {id:'1.4',name:'Ruínas da Continuidade',position:[-.7,-3.45]},
   {id:'1.5',name:'Ampulheta da Convergência',position:[-6.75,0]},
   {id:'1.6',name:'Vórtice de Euler',position:[2.4,3.55]},
   {id:'1.7',name:'Obelisco Rúnico',position:[4.55,3.48]},
   {id:'1.8',name:'Máquina Armilar',position:[7.15,3.42]},
  ];
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
 const cloudMat=new T.MeshBasicMaterial({color:0xd9efff,transparent:true,opacity:.13,depthWrite:false});for(let i=0;i<32;i++){const a=random()*Math.PI*2,r=15+random()*32,puff=orb(.55+random()*1.05,cloudMat,Math.cos(a)*r,-5+random()*1.5,Math.sin(a)*r);puff.scale.set(2.2,.18,1.1);puff.castShadow=false;}
 root.userData.biomes=['castelo','portais','pontes','cachoeiras','cristais'];
 return {root,obstacles,accent:theme.accent,sky:theme.sky,fog:theme.fog,update(time:number){oceanMaterial.uniforms.time.value=time;for(const object of animated){if(object instanceof T.Group)object.rotation.y=time*.22;else if(object instanceof T.Mesh&&object.geometry instanceof T.CircleGeometry)object.rotation.z=time*.35;else object.rotation.y+=.006;}}};
}
