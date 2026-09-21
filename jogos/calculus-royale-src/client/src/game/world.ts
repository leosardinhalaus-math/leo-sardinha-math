import * as T from 'three';

// Ilha cartunesca original, construída em geometria 3D. Corredores de combate
// mantêm X/Z e colisões do jogo; cidade, relevo e biomas ficam ao redor deles.
export function createWorld(index:number){
 const root=new T.Group();root.name='Ilha Royale';const obstacles:T.Box3[]=[];
 const themes=[
  {accent:0x24d9fb,grass:0x64bd35,leaf:0x259c53,rock:0x987752,roof:0xfb7856},
  {accent:0xff8154,grass:0x9dbc39,leaf:0x569642,rock:0xc87949,roof:0xec5a52},
  {accent:0xa775ff,grass:0x68aa51,leaf:0x438e80,rock:0x7777ab,roof:0xad6ddc},
  {accent:0x38e5aa,grass:0x43ba52,leaf:0x188865,rock:0x8b9279,roof:0x2d9fa5},
  {accent:0xffd063,grass:0x8fbb35,leaf:0x428e4b,rock:0xb78a51,roof:0xee8a38},
 ];
 const theme=themes[index]??themes[0],accent=theme.accent;
 let seed=1571+index*97;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const mat=(color:number,roughness=.8,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
 const grass=mat(theme.grass),leaf=mat(theme.leaf),lime=mat(0x8acb44),sand=mat(0xf4d78e),cliff=mat(theme.rock),wood=mat(0x995d36),woodLight=mat(0xdeab66),cream=mat(0xffedc3),roof=mat(theme.roof),navy=mat(0x304669),road=mat(0x53667a),metal=mat(0xc4dfeb,.36,.45),white=mat(0xe5f8ff,.4,.25);
 const neon=new T.MeshStandardMaterial({color:accent,emissive:accent,emissiveIntensity:.65,roughness:.3,metalness:.35});
 const glass=new T.MeshStandardMaterial({color:0x37c9ed,emissive:0x0d93bd,emissiveIntensity:.15,roughness:.15,metalness:.55});
 const gold=mat(0xffce55,.45,.3);const animated:T.Object3D[]=[];
 function add(geometry:T.BufferGeometry,material:T.Material,x:number,y:number,z:number,solid=false,parent:T.Object3D=root){const mesh=new T.Mesh(geometry,material);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);if(solid){root.updateMatrixWorld(true);obstacles.push(new T.Box3().setFromObject(mesh));}return mesh;}
 const box=(w:number,h:number,d:number,m:T.Material,x:number,y:number,z:number,solid=false,parent:T.Object3D=root)=>add(new T.BoxGeometry(w,h,d),m,x,y,z,solid,parent);
 const ball=(r:number,m:T.Material,x:number,y:number,z:number,parent:T.Object3D=root)=>add(new T.IcosahedronGeometry(r,1),m,x,y,z,false,parent);
 function beam(from:T.Vector3,to:T.Vector3,r:number,m:T.Material,parent:T.Object3D=root){const delta=to.clone().sub(from);const mesh=add(new T.CylinderGeometry(r,r,delta.length(),5),m,0,0,0,false,parent);mesh.position.copy(from).add(to).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return mesh;}
 // Contorno irregular, praia em anel e paredões da ilha acima do mar.
 const segments=72,contour=Array.from({length:segments},(_,i)=>{const angle=i/segments*Math.PI*2;const wobble=1+.035*Math.sin(angle*7)+.025*Math.cos(angle*11);return new T.Vector2(Math.cos(angle)*15.3*wobble,Math.sin(angle)*9.8*wobble);});
 function terrainRing(inner:number,outer:number,innerY:number,outerY:number,material:T.Material){const positions:number[]=[];for(let i=0;i<segments;i++){const a=contour[i],b=contour[(i+1)%segments];positions.push(a.x*inner,innerY,a.y*inner,a.x*outer,outerY,a.y*outer,b.x*outer,outerY,b.y*outer,a.x*inner,innerY,a.y*inner,b.x*outer,outerY,b.y*outer,b.x*inner,innerY,b.y*inner);}const geometry=new T.BufferGeometry();for(let offset=0;offset<positions.length;offset+=9){for(let axis=0;axis<3;axis++){const value=positions[offset+3+axis];positions[offset+3+axis]=positions[offset+6+axis];positions[offset+6+axis]=value;}}geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.computeVertexNormals();const mesh=new T.Mesh(geometry,material);mesh.receiveShadow=true;root.add(mesh);return mesh;}
 terrainRing(0,.87,.015,.015,grass);terrainRing(.87,.94,.015,-.35,sand);terrainRing(.94,1,-.35,-1.7,cliff);terrainRing(1,1.04,-1.7,-1.94,sand);
 // Oceano animado no shader: poucas geometrias e nenhum arquivo 8K pesado.
 const oceanMaterial=new T.ShaderMaterial({uniforms:{time:{value:0}},vertexShader:`varying vec3 world; void main(){world=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(world,1.);}`,fragmentShader:`uniform float time;varying vec3 world;void main(){vec2 p=world.xz;float ripple=sin(p.x*1.8+p.y*.85-time*1.4)*sin(p.y*2.1-p.x*.5+time*.8);float broad=sin(p.x*.1+p.y*.07+time*.14);vec3 col=mix(vec3(.025,.35,.70),vec3(.035,.66,.81),.45+broad*.18);float sparkle=pow(max(0.,ripple),18.);col+=vec3(.42,.61,.60)*sparkle*.28;float distanceFade=smoothstep(35.,95.,length(p));gl_FragColor=vec4(mix(col,vec3(.48,.79,.93),distanceFade),1.);#include <tonemapping_fragment>\n#include <colorspace_fragment>
}`});
 // Diretivas GLSL precisam começar numa linha própria.
 oceanMaterial.fragmentShader=oceanMaterial.fragmentShader.replace(';#include',';\n#include');
 const ocean=add(new T.PlaneGeometry(220,220),oceanMaterial,0,-2,0);ocean.rotation.x=-Math.PI/2;ocean.castShadow=false;
 const foam=new T.MeshBasicMaterial({color:0xb9f6ea,transparent:true,opacity:.5,side:T.DoubleSide,depthWrite:false});terrainRing(1.015,1.035,-1.98,-1.98,foam);
 // Rio e duas pontes rústicas: as faixas funcionais continuam em Z = ±1,65.
 const riverMaterial=new T.MeshStandardMaterial({color:0x159fda,roughness:.25,metalness:.35});
 box(1.9,.035,19,riverMaterial,0,.045,0);
 for(const x of [-1.08,1.08])box(.23,.11,17.2,sand,x,.035,0);
 for(const z of [-1.65,1.65]){
  for(const x of [-5.5,5.5])box(8.4,.035,1.26,sand,x,.054,z);
  box(2.85,.15,1.52,wood,0,.02,z);
  for(let n=0;n<11;n++)box(.21,.045,1.48,woodLight,-1.25+n*.25,.112,z);
  for(const side of [-1,1]){
   box(2.9,.13,.075,wood,0,.54,z+side*.79,true);
   for(const x of [-1.25,0,1.25])box(.12,.65,.12,wood,x,.3,z+side*.81);
  }
 }
 // Bases futuristas contrastam com o terreno e as pontes de madeira.
 for(const x of [-9.5,9.5])for(const z of [-1.65,1.65]){
  add(new T.CylinderGeometry(.65,.85,.62,8),white,x,.34,z,true);
  add(new T.CylinderGeometry(.48,.59,.65,8),navy,x,.91,z);
  add(new T.CylinderGeometry(.57,.57,.10,8),neon,x,1.25,z);
  add(new T.OctahedronGeometry(.34),neon,x,1.72,z);
  for(let i=0;i<4;i++){const angle=i*Math.PI/2;box(.14,.34,.14,metal,x+Math.cos(angle)*.56,.75,z+Math.sin(angle)*.56);}
 }
 // Colinas volumétricas facetadas; todas ficam fora dos corredores.
 const hills=[[-11,-4.8,1.4,.8],[-2,-6.5,2,1.4],[2.2,-6.6,2.1,1.2],[10.8,-4.8,1.4,1],[-11,4,1.5,.6],[7,5,1.8,.65]];
 for(const [x,z,r,h] of hills){const hill=add(new T.SphereGeometry(r,12,6,0,Math.PI*2,0,Math.PI/2),grass,x,.015,z);hill.scale.y=h/r;}
 function tree(x:number,z:number,height:number,pine=false){
  add(new T.CylinderGeometry(.08,.13,height*.52,5),wood,x,height*.26,z,true);
  if(pine){for(let i=0;i<3;i++)add(new T.ConeGeometry(height*(.30-i*.045),height*.5,7),i%2?lime:leaf,x,height*(.5+i*.19),z);}
  else {const crown=ball(height*.36,leaf,x,height*.75,z);crown.scale.set(1.05,1,.9);ball(height*.28,lime,x+.15,height*.97,z-.08);}
 }
 const grove=[[-12,-2.9],[-11,-4],[-10,-6.4],[-8,-6.8],[-6.8,-6.6],[-4.5,-7.5],[-2,-7],[2.4,-7.8],[4,-7.4],[6.3,-7],[11,-4.3],[12,-2.8],[-12,2.3],[-11.7,4],[-7.5,5.9],[-5.7,6.5],[-3.3,6.8],[2.6,6.8],[5,6.8],[8,5.4],[11,3.6]];
 for(const [x,z] of grove)tree(x,z,1.1+random()*1.5,index===3||random()>.6);
 // Pequena cidade colorida, com telhados, vitrines, calçadas e rua marcada.
 box(7.8,.055,2.2,road,-6.1,.07,-4.5);box(8,.08,.2,cream,-6,.08,-3.3);
 for(let i=0;i<11;i++)box(.35,.015,.04,cream,-9.6+i*.65,.106,-4.45);
 function house(x:number,z:number,w:number,h:number,color:number,flat=false){
  const facade=mat(color);box(w,h,1.05,facade,x,h/2+.1,z,true);
  box(w+.16,.12,1.2,cream,x,h+.13,z);
  if(flat){box(w+.1,.16,1.16,roof,x,h+.27,z);box(.3,.25,.3,metal,x+.22,h+.47,z);}
  else {const gable=add(new T.CylinderGeometry(w*.75,w*.75,1.28,3),roof,x,h+.4,z);gable.rotation.x=Math.PI/2;gable.rotation.z=Math.PI/2;}
  box(.25,.52,.025,navy,x-.18,.38,z+.536);
  for(let row=0;row<Math.floor(h/.6);row++)for(const dx of [-w*.28,w*.28]){box(.24,.29,.035,cream,x+dx,.6+row*.58,z+.54);box(.18,.22,.045,glass,x+dx,.6+row*.58,z+.55);}
  box(w*.8,.12,.35,roof,x,h*.48,z+.65);
 }
 house(-8.7,-5.3,1.25,1.7,0xffb850);house(-6.9,-5.6,1.15,2.5,0x6c83e9,true);house(-5.25,-5.1,1.25,1.5,0xef8292);house(-3.7,-5.2,1.05,1.9,0x63d5d1,true);
 // Veículo estilizado e postes completam o ponto de interesse da cidade.
 box(.72,.27,.35,mat(0xffd244),-7.8,.3,-4.4);box(.35,.2,.3,glass,-7.9,.52,-4.4);
 for(const x of [-8.05,-7.55])for(const z of [-4.62,-4.18]){const wheel=add(new T.CylinderGeometry(.1,.1,.055,8),navy,x,.19,z);wheel.rotation.x=Math.PI/2;}
 for(const x of [-9.8,-4.5]){add(new T.CylinderGeometry(.035,.04,1.3,6),navy,x,.7,-3.4);ball(.12,gold,x,1.38,-3.4);}
 // Centro de pesquisa: plataformas, anéis, antenas e painéis solares.
 box(4.8,.17,3.3,navy,6.8,.09,-4.9,true);
 for(const x of [5.3,7.1,8.9]){box(1.25,.12,2.7,metal,x,.24,-4.9);box(1.0,1.0,1.2,white,x,.8,-5.35,true);box(1.01,.24,1.22,glass,x,1.03,-5.35);box(1.2,.12,1.42,navy,x,1.37,-5.35);}
 const portal=add(new T.TorusGeometry(.77,.11,8,36),metal,7.1,2.35,-5.3);const portalLight=add(new T.TorusGeometry(.64,.035,6,36),neon,7.1,2.35,-5.29);portal.rotation.y=-.3;portalLight.rotation.y=-.3;
 const floating=add(new T.OctahedronGeometry(.33),neon,7.1,2.35,-5.3);animated.push(floating);
 for(const x of [5.4,8.8]){const panel=box(.85,.07,.6,glass,x,.65,-3.8);panel.rotation.x=-.35;box(.08,.5,.08,metal,x,.3,-3.8);}
 beam(new T.Vector3(9.4,.2,-4.5),new T.Vector3(9.4,2.2,-4.5),.04,metal);ball(.12,neon,9.4,2.25,-4.5);
 // Acampamento rústico e moinho em escala reduzida na costa dianteira.
 house(-7.9,3.9,1.25,.8,0xc58c52);
 add(new T.CylinderGeometry(.28,.42,1.8,7),cream,-9.8,.92,3.6,true);add(new T.ConeGeometry(.47,.56,7),roof,-9.8,2,3.6);
 const rotor=new T.Group();rotor.position.set(-9.8,1.65,3.93);root.add(rotor);rotor.name='moinho';
 for(let i=0;i<4;i++){const blade=box(.12,.8,.055,woodLight,0,.44,0,false,rotor);const pivot=new T.Group();rotor.remove(blade);blade.position.set(0,.42,0);pivot.rotation.z=i*Math.PI/2;pivot.add(blade);rotor.add(pivot);}animated.push(rotor);
 for(const x of [-6.7,-6.2])box(.38,.35,.4,wood,x,.21,3.8);
 // Píer, rochas e detalhes costeiros, sem ocupar as áreas de invocação.
 for(let i=0;i<12;i++)box(1.1,.07,.24,woodLight,4.5,-.1,7.0+i*.25);
 for(const z of [7.1,8.3,9.5])for(const x of [4,5])add(new T.CylinderGeometry(.055,.07,1.8,6),wood,x,-.65,z);
 for(let i=0;i<18;i++){const a=random()*Math.PI*2,x=Math.cos(a)*13.8,z=Math.sin(a)*8.8;const rock=add(new T.DodecahedronGeometry(.25+random()*.3),cliff,x,-.2,z);rock.scale.y=.7;}
 for(let i=0;i<20;i++){const x=-10+random()*20,z=(i%2?1:-1)*(3+random()*.55);if(Math.abs(x)<1.5)continue;const tuft=add(new T.ConeGeometry(.08,.28,4),i%3?lime:gold,x,.17,z);tuft.rotation.z=.2;}
 // Nuvens leves no horizonte: formas arredondadas, sem encobrir a arena.
 const cloudMaterial=new T.MeshBasicMaterial({color:0xf4fbff});
 for(const [x,z] of [[-26,-18],[23,-23],[-30,19],[31,14]])for(let i=0;i<4;i++){const puff=ball(1.2+i%2*.5,cloudMaterial,x+i*1.4,4.5+Math.sin(i)*.3,z);puff.scale.set(1.4,.5,.8);puff.castShadow=false;}
 // Assinatura de cada ilha: cristais, cânion, observatório, mata e forja.
 if(index===1){for(const x of [-3,1,4]){const mesa=add(new T.CylinderGeometry(.75,1.3,2.1,6),cliff,x,1.05,-7.5);mesa.rotation.y=x;add(new T.CylinderGeometry(.82,.8,.2,6),sand,x,2.15,-7.5);}}
 if(index===2){add(new T.CylinderGeometry(1.05,1.25,1.4,12),white,0,.73,-6.8);add(new T.SphereGeometry(1.08,16,10,0,Math.PI*2,0,Math.PI/2),mat(0x8b7ede,.4,.3),0,1.43,-6.8);const telescope=add(new T.CylinderGeometry(.14,.24,1.8,10),navy,0,2.2,-6.3);telescope.rotation.x=.95;}
 if(index===0){for(const x of [-3.2,2.8]){const crystal=add(new T.OctahedronGeometry(.55),neon,x,.85,-6.2);crystal.scale.y=1.7;}}
 if(index===3){for(const x of [-3.7,-2.3,2.3,3.8])tree(x,-5.7,2.7,true);}
 if(index===4){for(const x of [-2.3,2.3]){box(1.1,1.3,1.1,cliff,x,.7,-6.4);box(.5,.5,.05,gold,x,.55,-5.82);add(new T.CylinderGeometry(.22,.25,1.6,7),metal,x,2,-6.4);}}
 root.userData.biomes=['colinas','cidade','centro futurista','acampamento','praia'];
 return {root,obstacles,accent,update(time:number){oceanMaterial.uniforms.time.value=time;for(const object of animated){if(object.name==='moinho')object.rotation.z=time*.35;else {object.rotation.y=time*.7;object.position.y=2.35+Math.sin(time*1.2)*.12;}}}};
}
