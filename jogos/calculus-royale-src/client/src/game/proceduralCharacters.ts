import * as T from 'three';
import { getCardProfile } from './cardProfiles.ts';

type HairStyle='short'|'long'|'curly'|'hood'|'helmet'|'bald'|'robot';
type HeroLook={female?:boolean;hair?:HairStyle;beard?:boolean;skin?:number;armor?:boolean;whiteGold?:boolean};

// Descritores observados nas artes. Eles controlam a silhueta 3D; nenhuma imagem
// da carta é aplicada como textura ou placa no personagem.
const LOOKS:Record<string,HeroLook>={
 area:{female:true,hair:'long'},average:{hair:'long',beard:true},bernoulli:{hair:'long',beard:true},cauchy:{hair:'short',beard:true,armor:true},
 cavalieri:{hair:'curly',beard:true},'cavalieri-advanced':{hair:'curly',beard:true},chain:{hair:'hood',beard:true},compare:{female:true,hair:'long'},
 comparison:{hair:'short',beard:true,armor:true},continuity:{female:true,hair:'long',armor:true},ftc:{hair:'curly',beard:true},gabriel:{female:true,hair:'long',whiteGold:true},
 growth:{female:true,hair:'long',armor:true},implicit:{hair:'robot',armor:true,skin:0x6f8395},improper:{hair:'helmet',armor:true,skin:0x5c4f66},inverse:{female:true,hair:'long'},
 limit:{hair:'helmet',armor:true,skin:0x7a8998},ln:{female:true,hair:'hood'},mean:{hair:'short',beard:true,armor:true},miner:{female:true,hair:'curly',armor:true},
 newton:{hair:'long'},parts:{female:true,hair:'long',armor:true},parts2:{hair:'short',beard:true,armor:true},power:{hair:'hood',beard:true},
 quotient:{female:true,hair:'hood'},rate:{hair:'short',skin:0x8d5f45},root:{hair:'short',beard:true,armor:true},secant:{hair:'short',beard:true,armor:true},
 series:{hair:'short'},simpson:{female:true,hair:'curly'},'simpson-advanced':{hair:'curly',beard:true},sine:{female:true,hair:'long'},slope:{female:true,hair:'long',armor:true},
 sub:{hair:'short',beard:true},surface:{female:true,hair:'long'},'surface-flux':{female:true,hair:'long'},taylor:{female:true,hair:'curly'},taylor2:{hair:'short',beard:true},
 trap:{female:true,hair:'curly'},volume:{female:true,hair:'long'},
};

const OBJECTS=new Set(['euler','expchain','fractal','mirror','opt']);

export function createProceduralCharacter(cardId:string){
 const p=getCardProfile(cardId),look=LOOKS[cardId]??{},root=new T.Group(),body=new T.Bone();body.name='body';root.add(body);
 const material=(color:number|string,roughness=.65,metalness=0,emissive?:number|string)=>new T.MeshStandardMaterial({color,roughness,metalness,emissive:emissive??0x000000,emissiveIntensity:emissive?1.05:0});
 const cloth=material(p.color,.62,.08),gold=material(look.whiteGold?0xffefbd:0xd9a94f,.28,.7),steel=material(look.whiteGold?0xf4efe0:0x9db4c9,.3,.72);
 const glow=material(p.glow,.22,.25,p.glow),skin=material(look.skin??(look.female?0xd7a07e:0xb97858),.82),hair=material(p.hair,.86),dark=material(0x101a2b,.62,.15);
 const crystal=new T.MeshPhysicalMaterial({color:p.glow,emissive:p.glow,emissiveIntensity:1.35,roughness:.12,metalness:.2,transmission:.18,transparent:true,opacity:.88});
 function mesh(g:T.BufferGeometry,m:T.Material,x:number,y:number,z:number,parent:T.Object3D=body){const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
 function bar(from:T.Vector3,to:T.Vector3,radius:number,m:T.Material,parent:T.Object3D=body,sides=7){const delta=to.clone().sub(from);const o=mesh(new T.CylinderGeometry(radius,radius,delta.length(),sides),m,0,0,0,parent);o.position.copy(from).add(to).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return o;}
 function torus(radius:number,tube:number,m:T.Material,x:number,y:number,z:number,parent:T.Object3D=body){return mesh(new T.TorusGeometry(radius,tube,8,32),m,x,y,z,parent);}
 function orb(radius:number,x:number,y:number,z:number,parent:T.Object3D=body){return mesh(new T.IcosahedronGeometry(radius,1),crystal,x,y,z,parent);}

 const floating=OBJECTS.has(cardId);
 if(floating)createRelic();else createHero();
 addCardIdentity();

 function createRelic(){
  if(cardId==='mirror'){
   const glass=new T.MeshPhysicalMaterial({color:0x9ddfff,metalness:.8,roughness:.08,transmission:.42,transparent:true,opacity:.72,side:T.DoubleSide});
   const face=mesh(new T.CircleGeometry(.55,40),glass,0,1.05,0);face.scale.y=1.38;
   const frame=torus(.6,.055,gold,0,1.05,.01);frame.scale.y=1.38;
   for(const y of [.35,1.78])orb(.11,0,y,.02);for(const x of [-.62,.62])orb(.09,x,1.05,.02);
  }else if(cardId==='fractal'){
   bar(new T.Vector3(0,.35,0),new T.Vector3(0,1.05,0),.13,gold);
   for(let level=0;level<3;level++)for(let i=0;i<2**(level+1);i++){
    const a=i/(2**(level+1)-1)*Math.PI-Math.PI/2,r=.32+level*.24,y=.9+level*.33;
    bar(new T.Vector3(0,y-.25,0),new T.Vector3(Math.sin(a)*r,y+.2,Math.cos(a)*r),.055-level*.012,gold);orb(.13-level*.018,Math.sin(a)*r,y+.2,Math.cos(a)*r);
   }
  }else if(cardId==='expchain'){
   for(let i=0;i<4;i++){const link=torus(.37,.075,i%2?glow:gold,(i-1.5)*.34,1.05+(i%2)*.22,0);link.rotation.set(i%2?Math.PI/2:0,i*.45,i*.3);}orb(.2,0,1.12,0);
  }else{
   const core=cardId==='opt'?mesh(new T.OctahedronGeometry(.28),crystal,0,1.05,0):orb(.28,0,1.05,0);core.rotation.y=.45;
   for(let i=0;i<4;i++){const ring=torus(.43+i*.09,.025,i%2?gold:glow,0,1.05,0);ring.rotation.set(i*.63,i*.77,.35+i*.22);}
   for(let i=0;i<4;i++){const a=i*Math.PI/2;orb(.075,Math.cos(a)*.72,1.05+Math.sin(a)*.52,0);}
  }
  mesh(new T.CylinderGeometry(.42,.58,.18,10),dark,0,.18,0);
 }

 function createHero(){
  const armored=look.armor||['guardian','golem'].includes(p.archetype)||(p.archetype==='titan'&&cardId==='ftc'),robed=['mage','priest','angel','dancer'].includes(p.archetype);
  const width=p.archetype==='golem'?.45:p.archetype==='titan'?.36:look.female?.27:.31;
  mesh(new T.CylinderGeometry(.085,.105,.16,16),skin,0,1.48,0);
  mesh(new T.CapsuleGeometry(width*.88,.35,8,18),cardId==='slope'?dark:armored?steel:cloth,0,1.05,0);mesh(new T.BoxGeometry(width*2.15,.1,.43),gold,0,.78,0);
  if(robed){mesh(new T.CylinderGeometry(width*.78,.43,.68,24),cloth,0,.54,0);for(const side of [-1,0,1]){const fold=mesh(new T.CapsuleGeometry(.022,.42,5,10),side===0?gold:glow,side*.19,.5,.37);fold.scale.y=.85;}}
  if(armored){mesh(new T.BoxGeometry(width*2.2,.12,.48),gold,0,1.32,0);for(const side of [-1,1])mesh(new T.SphereGeometry(.17,18,12),gold,side*(width+.08),1.34,0);}
  if(!['dancer','engineer'].includes(p.archetype)){const cape=mesh(new T.ConeGeometry(.5,1.05,24,3,true,0,Math.PI),cloth,0,.88,-.18);cape.rotation.x=.08;}
  mesh(new T.SphereGeometry(.23,28,20),skin,0,1.68,0);addHair();addFace();
  const bones:T.Bone[]=[body];
  for(const side of [-1,1]){
   const leg=new T.Bone();leg.name=side<0?'legL':'legR';leg.position.set(side*.15,.72,0);body.add(leg);bones.push(leg);mesh(new T.CapsuleGeometry(.09,.36,8,14),armored?steel:dark,0,-.24,0,leg);mesh(new T.CapsuleGeometry(.105,.12,5,12),dark,0,-.51,.08,leg);
   const arm=new T.Bone();arm.name=side<0?'armL':'armR';arm.position.set(side*(width+.08),1.3,0);body.add(arm);bones.push(arm);mesh(new T.CapsuleGeometry(.092,.32,8,14),armored?steel:cloth,0,-.22,0,arm);const hand=mesh(new T.CapsuleGeometry(.07,.09,7,12),skin,0,-.48,.04,arm);hand.rotation.z=side*.08;mesh(new T.SphereGeometry(.035,12,8),skin,side*.07,-.47,.07,arm);
  }
  const rigGeometry=new T.CylinderGeometry(width*.78,width,.58,20,5);rigGeometry.translate(0,1.08,0);const count=rigGeometry.attributes.position.count,indices=new Uint16Array(count*4),weights=new Float32Array(count*4);for(let i=0;i<count;i++)weights[i*4]=1;rigGeometry.setAttribute('skinIndex',new T.Uint16BufferAttribute(indices,4));rigGeometry.setAttribute('skinWeight',new T.Float32BufferAttribute(weights,4));const torso=new T.SkinnedMesh(rigGeometry,armored?steel:cloth);torso.name='riggedTorso';torso.castShadow=true;root.add(torso);torso.bind(new T.Skeleton(bones));
  addSignature(body.getObjectByName('armL')!,body.getObjectByName('armR')!);
 }

 function addHair(){
  const style=look.hair??'short';
  if(style==='robot'){const helmet=mesh(new T.SphereGeometry(.25,22,16),steel,0,1.69,0);mesh(new T.BoxGeometry(.34,.09,.03),glow,0,1.69,.225);helmet.scale.y=1.05;return;}
  if(style==='helmet'){mesh(new T.SphereGeometry(.255,22,16),steel,0,1.69,0);mesh(new T.BoxGeometry(.035,.34,.27),gold,0,1.74,.08);mesh(new T.BoxGeometry(.3,.08,.06),dark,0,1.67,.225);return;}
  if(style==='hood'){const back=mesh(new T.SphereGeometry(.29,24,18),cloth,0,1.7,-.2);back.scale.set(1,1.14,.72);const rim=mesh(new T.TorusGeometry(.245,.065,12,32),cloth,0,1.69,.015);rim.scale.y=1.12;}
  else if(style!=='bald')mesh(new T.SphereGeometry(.245,24,18,0,Math.PI*2,0,Math.PI*.55),hair,0,1.73,-.02);
  if(style==='long'&&cardId!=='slope')for(const side of [-1,1]){const lock=mesh(new T.CapsuleGeometry(.075,.72,8,14),hair,side*.19,1.34,-.1);lock.rotation.z=side*.14;}
  if(style==='curly')for(let i=0;i<11;i++){const a=i/11*Math.PI*2;mesh(new T.SphereGeometry(.082,16,12),hair,Math.cos(a)*.22,1.64+Math.sin(a)*.17,-.1);}
  if(look.beard&&cardId!=='power'){const beard=mesh(new T.ConeGeometry(.18,.38,18),hair,0,1.43,.11);beard.rotation.z=Math.PI;for(const side of [-1,1])mesh(new T.CapsuleGeometry(.025,.13,5,10),hair,side*.09,1.58,.22).rotation.z=side*.55;}
  if(look.female)for(const side of [-1,1]){const earring=orb(.035,side*.22,1.59,.08);earring.material=gold;}
 }

 function addFace(){
  for(const side of [-1,1]){
   mesh(new T.SphereGeometry(.041,12,8),material(0xf4f2e8,.45),side*.08,1.69,.216);
   mesh(new T.SphereGeometry(.019,10,7),dark,side*.08,1.69,.249);
   mesh(new T.SphereGeometry(.006,7,5),material(0xffffff,.2),side*.074,1.698,.266);
   const brow=mesh(new T.CapsuleGeometry(.01,.07,5,8),hair,side*.075,1.755,.225);brow.rotation.z=side*.14;
   const ear=mesh(new T.SphereGeometry(.043,12,8),skin,side*.226,1.67,0);ear.scale.x=.65;
  }
  const nose=mesh(new T.ConeGeometry(.032,.09,10),skin,0,1.64,.245);nose.rotation.x=Math.PI/2;
  const mouth=mesh(new T.CapsuleGeometry(.008,.052,4,8),material(look.female?0x8e3e4c:0x713b35),0,1.58,.225);mouth.rotation.z=Math.PI/2;
 }

 function addCardIdentity(){
  const identity=new T.Group();identity.name=`identity-${cardId}`;body.add(identity);
  const piece=(g:T.BufferGeometry,m:T.Material,x=0,y=0,z=0)=>mesh(g,m,x,y,z,identity);
  const identityOrb=(radius:number,x:number,y:number,z:number,m:T.Material=crystal)=>{const value=piece(new T.IcosahedronGeometry(radius,1),m,x,y,z);return value;};
  const identityBar=(from:T.Vector3,to:T.Vector3,radius:number,m:T.Material,sides=8)=>bar(from,to,radius,m,identity,sides);
  const identityTorus=(radius:number,tube:number,m:T.Material,x:number,y:number,z:number)=>torus(radius,tube,m,x,y,z,identity);
  const curve=(points:T.Vector3[],m:T.Material,radius=.025)=>piece(new T.TubeGeometry(new T.CatmullRomCurve3(points),Math.max(24,points.length*2),radius,7,false),m);
  const blade=(x:number,y:number,z:number,m:T.Material=crystal,tilt=0)=>{const value=piece(new T.ConeGeometry(.075,.72,6),m,x,y,z);value.rotation.set(Math.PI/2,0,tilt);return value;};
  const arc=(m:T.Material,x=0,y=1.15,z=.28,scale=1)=>{const points=Array.from({length:25},(_,i)=>{const u=i/24*2-1;return new T.Vector3(x+u*.5*scale,y+(1-u*u)*.34*scale,z);});return curve(points,m,.025);};
  const book=(x:number,y:number,z:number,m:T.Material=gold)=>{const value=piece(new T.BoxGeometry(.42,.07,.3),m,x,y,z);value.rotation.z=.15;identityBar(new T.Vector3(x,y+.045,z-.14),new T.Vector3(x,y+.045,z+.14),.012,dark);return value;};
  const goggles=()=>{for(const side of [-1,1]){const lens=identityTorus(.075,.018,gold,side*.085,1.73,.22);lens.rotation.x=Math.PI/2;}identityBar(new T.Vector3(-.02,1.73,.23),new T.Vector3(.02,1.73,.23),.012,gold);};
  const shoulderMantle=(m:T.Material)=>{for(const side of [-1,1]){const pad=piece(new T.SphereGeometry(.16,18,12),m,side*.34,1.36,0);pad.scale.set(1.15,.72,1);}};
  const shield=(x:number,m:T.Material=steel,r=.31)=>{const value=piece(new T.CylinderGeometry(r,r,.07,20),m,x,1.03,.28);value.rotation.x=Math.PI/2;const rim=identityTorus(r*.82,.025,glow,x,1.03,.33);rim.rotation.x=Math.PI/2;return value;};
  if(cardId==='slope'){
   // Arqueira: cabelo preso alto, corpete azul-escuro, capa vermelha e detalhes dourados.
   const corset=piece(new T.CapsuleGeometry(.245,.38,8,20),dark,0,1.09,.10);corset.scale.set(.94,1,.72);corset.name='slope-navy-corset';
   for(const side of [-1,1]){
    identityBar(new T.Vector3(side*.18,.84,.30),new T.Vector3(side*.18,1.32,.27),.018,gold).name='slope-gold-corset-seam';
    identityBar(new T.Vector3(side*.2,.93,.27),new T.Vector3(-side*.075,1.38,.25),.023,gold);
    piece(new T.CylinderGeometry(.13,.15,.18,18),gold,side*.3,1.34,0).name='slope-shoulder-guard';
    piece(new T.CylinderGeometry(.12,.10,.24,16),dark,side*.44,.97,.1).name='slope-archer-bracer';
   }
   piece(new T.TorusGeometry(.28,.06,10,32,Math.PI*1.6),cloth,0,1.48,-.02).name='slope-red-collar';
   const sash=piece(new T.ConeGeometry(.36,.74,24,2,true),cloth,.1,.57,.015);sash.rotation.z=-.15;
   const ponytail=new T.Bone();ponytail.name='ponytail';ponytail.position.set(.17,1.92,-.23);identity.add(ponytail);
   mesh(new T.SphereGeometry(.12,16,12),hair,0,0,0,ponytail).name='slope-high-hair-knot';
   mesh(new T.TorusGeometry(.09,.03,8,18),gold,0,-.04,-.04,ponytail).name='slope-ponytail-gold-tie';
   for(let i=0;i<4;i++){const strand=mesh(new T.CapsuleGeometry(.078-i*.012,.49+i*.08,8,14),hair,.025+i*.036,-.25-i*.09,-.12-i*.04,ponytail);strand.rotation.z=.35+i*.17;strand.name='slope-ponytail-strand-'+i;}
   const capeHem=new T.Bone();capeHem.name='capeHem';capeHem.position.set(0,1.35,-.23);identity.add(capeHem);
   for(const side of [-1,1]){const clothPanel=mesh(new T.ConeGeometry(.26,.92,14,2,true),cloth,side*.22,-.40,-.13,capeHem);clothPanel.rotation.z=side*.16;clothPanel.name='slope-red-cape-panel';}
  }else if(cardId==='limit'){
   // Elmo fechado, crista, peitoral facetado e capa azul formam a leitura do guardião da carta.
   const crest=piece(new T.ConeGeometry(.085,.58,12),gold,0,2.08,-.04);crest.rotation.z=-.08;
   const breast=piece(new T.OctahedronGeometry(.34,1),steel,0,1.14,.17);breast.scale.set(1,.85,.45);
   for(const side of [-1,1]){const trim=identityBar(new T.Vector3(side*.08,.88,.27),new T.Vector3(side*.27,1.35,.2),.028,gold);trim.rotation.z=side*.1;}
   identityOrb(.075,0,1.37,.18);
  }else if(cardId==='power'){
   // Mago: capuz rubro pontudo, longa barba branca, bordados e medalhão dourados.
   const medallion=identityTorus(.105,.025,gold,0,1.27,.28);medallion.rotation.x=Math.PI/2;medallion.name='power-gold-medallion';
   piece(new T.ConeGeometry(.27,.42,20),cloth,0,2.02,-.11).name='power-pointed-ruby-hood';
   const hoodTrim=identityTorus(.26,.04,gold,0,1.69,.05);hoodTrim.rotation.x=Math.PI/2;hoodTrim.name='power-hood-gold-border';
   for(const side of [-1,1]){
    const mantle=piece(new T.SphereGeometry(.22,16,12),cloth,side*.25,1.41,-.1);mantle.scale.set(1.2,.65,1);mantle.name='power-crimson-mantle';
    for(const y of [.5,.81,1.1])identityBar(new T.Vector3(side*.27,y,.24),new T.Vector3(side*.3,y+.14,.25),.017,gold).name='power-gold-robe-embroidery';
    const moustache=piece(new T.CapsuleGeometry(.038,.16,7,12),hair,side*.08,1.56,.24);moustache.rotation.z=side*.5;
   }
   const beardTail=new T.Bone();beardTail.name='beardTail';beardTail.position.set(0,1.51,.14);identity.add(beardTail);
   for(let i=-2;i<=2;i++){const strand=mesh(new T.ConeGeometry(.095-Math.abs(i)*.012,.70-Math.abs(i)*.10,12),hair,i*.077,-.27+Math.abs(i)*.018,.063,beardTail);strand.rotation.z=i*.14;strand.name='power-long-white-beard-'+i;}
   const capeHem=new T.Bone();capeHem.name='capeHem';capeHem.position.set(0,1.3,-.28);identity.add(capeHem);
   for(const side of [-1,1]){const tail=mesh(new T.ConeGeometry(.32,1.1,16,2,true),cloth,side*.23,-.47,-.16,capeHem);tail.rotation.z=side*.13;tail.name='power-crimson-cloak-panel';}
   for(let i=0;i<13;i++){const a=i*.82,r=.22+i*.012;identityOrb(.028,Math.cos(a)*r,.52+i*.075,Math.sin(a)*r-.24);}
  }else if(cardId==='sine'){
   // Saia em camadas, coque, joias e fitas ondulantes reproduzem a bailarina verde e dourada.
   piece(new T.SphereGeometry(.12,20,14),hair,.1,1.96,-.08);
   for(let i=0;i<3;i++){const skirt=piece(new T.CylinderGeometry(.24+i*.06,.43+i*.08,.24,28,1,true),i===1?gold:cloth,0,.66-i*.16,0);skirt.scale.z=.88;}
   for(const side of [-1,1]){const band=identityTorus(.105,.018,gold,side*.29,1.28,0);band.rotation.x=Math.PI/2;}
   for(const side of [-1,1]){const points=Array.from({length:16},(_,i)=>new T.Vector3(side*(.18+i*.045),1.3-i*.055,-.12+Math.sin(i*.72)*.18));const ribbon=curve(points,side<0?glow:gold,.027);ribbon.castShadow=false;}
  }else if(cardId==='area'){
   // Sacerdotisa verde: diadema, manto branco e cajado curvo da integral.
   const hood=piece(new T.TorusGeometry(.27,.045,10,32,Math.PI),gold,0,1.72,.02);hood.rotation.z=Math.PI/2;
   const mantle=piece(new T.ConeGeometry(.47,1.08,28,2,true),material(0xe8eadc,.7),0,.88,-.12);mantle.rotation.x=.06;
   identityBar(new T.Vector3(.43,.42,.12),new T.Vector3(.43,1.55,.12),.035,gold);
   const crook=curve(Array.from({length:16},(_,i)=>{const a=i/15*Math.PI*1.45;return new T.Vector3(.43+Math.cos(a)*.22,1.55+Math.sin(a)*.22,.12);}),glow,.035);crook.name='integral-staff';
  }else if(cardId==='average'){
   // Monge do valor médio: túnica azul-petróleo e duas colunas luminosas equilibradas.
   shoulderMantle(gold);for(const side of [-1,1]){const column=piece(new T.BoxGeometry(.17,.62,.17),glow,side*.48,1.12,.24);column.name=`mean-column-${side}`;for(let i=-1;i<=1;i++)identityTorus(.12,.012,gold,side*.48,1.12+i*.2,.24).rotation.x=Math.PI/2;}
   piece(new T.BoxGeometry(.38,.08,.48),gold,0,.78,.03);
  }else if(cardId==='bernoulli'){
   // Ancião azul e dourado, com espiral exponencial sustentada entre as mãos.
   shoulderMantle(gold);book(-.34,.83,.2,dark);
   const points=Array.from({length:30},(_,i)=>{const a=i*.72,r=.05+i*.012;return new T.Vector3(Math.cos(a)*r,1.1+i*.022,Math.sin(a)*r+.3);});curve(points,glow,.035).name='bernoulli-spiral';
   for(const side of [-1,1])identityOrb(.085,side*.4,1.08,.28,side<0?gold:glow);
  }else if(cardId==='cauchy'){
   // Cavaleiro azul de armadura pesada e dois escudos simétricos.
   shoulderMantle(gold);shield(-.43,steel,.32);shield(.43,steel,.32);
   const crest=piece(new T.ConeGeometry(.07,.45,10),gold,0,2.02,-.03);crest.rotation.z=-.12;
  }else if(cardId==='cavalieri'){
   // Mestre arquiteto: sólido em lâminas e esfera seccionada, como na carta.
   shoulderMantle(gold);for(let i=0;i<5;i++){const plate=piece(new T.BoxGeometry(.42-i*.025,.035,.3-i*.018),i%2?glow:gold,-.42,.82+i*.13,.25);plate.rotation.y=i*.18;}
   for(let i=0;i<4;i++){const ring=identityTorus(.11+i*.045,.015,i%2?gold:glow,.43,1.08,.28);ring.rotation.x=Math.PI/2;ring.scale.y=.72;}
  }else if(cardId==='cavalieri-advanced'){
   // Arquiteto azul: cilindro e tronco de cone com seções equivalentes.
   shoulderMantle(gold);for(const side of [-1,1])for(let i=0;i<5;i++){const radius=side<0?.19:.11+i*.025;const ring=identityTorus(radius,.014,i%2?gold:glow,side*.43,.82+i*.14,.27);ring.rotation.x=Math.PI/2;}
  }else if(cardId==='chain'){
   // Mago encapuzado, medalhão e corrente de elos violeta atravessando o peito.
   const medallion=identityOrb(.105,0,1.28,.3,gold);medallion.name='chain-medallion';
   for(let i=0;i<6;i++){const link=identityTorus(.105,.022,i%2?gold:glow,(i-2.5)*.16,1.12+(i%2)*.1,.25);link.rotation.set(i%2?Math.PI/2:0,0,.45);}
  }else if(cardId==='compare'){
   // Oráculo feminina com duas curvas ordenadas, uma dourada e outra violeta.
   shoulderMantle(gold);for(const side of [-1,1])curve(Array.from({length:18},(_,i)=>{const u=i/17;return new T.Vector3(side*(.2+u*.55),.72+u*.85+Math.sin(u*Math.PI)*.16,.22);}),side<0?gold:glow,.03);
   identityTorus(.1,.018,gold,0,1.87,.02).rotation.x=Math.PI/2;
  }else if(cardId==='comparison'){
   // Guardião da comparação: armadura azul e par de escudos-curva ordenados.
   shoulderMantle(gold);shield(-.42,steel,.3);shield(.42,steel,.3);for(const side of [-1,1])arc(side<0?gold:glow,side*.42,.98,.36,.55);
  }else if(cardId==='continuity'){
   // Sentinela violeta: coroa fina e domo contínuo sem interrupções.
   identityTorus(.23,.025,gold,0,1.84,.02).rotation.x=Math.PI/2;shoulderMantle(gold);
   const dome=arc(glow,0,1.15,.18,1.65);dome.name='continuous-dome';
  }else if(cardId==='euler'){
   // Orbe mecânico dourado com núcleo exponencial e gaiola giroscópica.
   for(let i=0;i<5;i++){const ring=identityTorus(.32+i*.055,.022,i%2?gold:glow,0,1.08,0);ring.rotation.set(i*.62,i*.83,.25+i*.31);}identityOrb(.22,0,1.08,0,crystal);
  }else if(cardId==='expchain'){
   // Quatro elos tridimensionais em ascensão e um núcleo violeta.
   for(let i=0;i<5;i++){const link=identityTorus(.2,.04,i%2?gold:glow,(i-2)*.22,.82+(i%2)*.2,.08);link.rotation.set(i%2?Math.PI/2:0,i*.42,i*.3);}identityOrb(.13,0,1.17,.15);
  }else if(cardId==='fractal'){
   // Semente verde abrindo ramificações auto-semelhantes.
   identityOrb(.2,0,.55,0);for(let level=0;level<3;level++)for(let i=0;i<2**(level+1);i++){const a=i/(2**(level+1)-1)*1.8-.9,r=.24+level*.22,y=.82+level*.27;identityBar(new T.Vector3(0,y-.25,0),new T.Vector3(Math.sin(a)*r,y+.16,Math.cos(a)*r),.04-level*.009,gold);identityOrb(.075,Math.sin(a)*r,y+.16,Math.cos(a)*r);}
  }else if(cardId==='ftc'){
   // Colosso branco e dourado: livro do teorema e raio que emerge da mão.
   shoulderMantle(gold);book(-.36,.94,.25,material(0x392719,.65));
   const bolt=[new T.Vector3(.28,1.55,.25),new T.Vector3(.5,1.32,.28),new T.Vector3(.36,1.11,.3),new T.Vector3(.63,.78,.32)];curve(bolt,glow,.045).name='fundamental-bolt';
  }else if(cardId==='gabriel'){
   // A silhueta angelical é completada por halo e filigranas da túnica.
   const halo=identityTorus(.26,.025,gold,0,2.02,-.06);halo.rotation.x=Math.PI/2;for(let i=0;i<3;i++){const trim=identityTorus(.28+i*.06,.013,i%2?gold:steel,0,.72+i*.2,.04);trim.rotation.x=Math.PI/2;}
  }else if(cardId==='growth'){
   // Batedora ruiva com armadura negra, folhas verdes e fluxo crescente.
   shoulderMantle(dark);for(let i=0;i<5;i++){const leaf=piece(new T.OctahedronGeometry(.07),glow,-.48+i*.24,.72+i*.18,.22);leaf.scale.set(.65,1.8,.5);}
   curve(Array.from({length:20},(_,i)=>new T.Vector3(-.62+i*.065,.58+i*.045+Math.sin(i*.55)*.08,.28)),glow,.03);
  }else if(cardId==='implicit'){
   // Golem de pedra: placas rochosas, núcleo ciano e rachaduras emissivas.
   for(const [x,y,s] of [[-.3,1.22,.25],[.3,1.22,.25],[-.24,.83,.2],[.24,.83,.2]] as const){const rock=piece(new T.DodecahedronGeometry(s,0),steel,x,y,0);rock.rotation.set(x,y,s);}
   const core=identityOrb(.16,0,1.13,.29);core.name='implicit-core';for(const side of [-1,1])identityBar(new T.Vector3(0,1.13,.3),new T.Vector3(side*.28,.86,.25),.022,glow);
  }else if(cardId==='improper'){
   // Sentinela violeta fechada, com bastão e halo infinito.
   shoulderMantle(gold);identityBar(new T.Vector3(.42,.38,.08),new T.Vector3(.42,1.7,.08),.04,gold);identityOrb(.11,.42,1.78,.08);
   for(const side of [-1,1]){const loop=identityTorus(.2,.026,glow,side*.17,1.86,-.08);loop.scale.x=1.35;loop.rotation.z=side*.34;}
  }else if(cardId==='inverse'){
   // Bruxa da inversa: diadema, orbe roxo e trajetórias que retornam.
   identityTorus(.2,.022,gold,0,1.86,.02).rotation.x=Math.PI/2;identityOrb(.15,.42,1.16,.3);
   for(const side of [-1,1])curve(Array.from({length:18},(_,i)=>{const a=i/17*Math.PI*1.6;return new T.Vector3(Math.cos(a)*(.28+i*.012),.92+Math.sin(a)*.34,.22+side*.08);}),side<0?gold:glow,.025);
  }else if(cardId==='ln'){
   // Ladina encapuzada escura, máscara e lâmina logarítmica azul.
   const mask=piece(new T.BoxGeometry(.3,.1,.04),dark,0,1.64,.235);mask.rotation.z=-.05;
   const points=Array.from({length:20},(_,i)=>{const u=i/19;return new T.Vector3(-.45+u*.9,.65+Math.log1p(u*4)*.38,.32);});curve(points,glow,.045).name='log-blade';
  }else if(cardId==='mean'){
   // Juiz barbado com balança de dois pratos e corrente central.
   shoulderMantle(gold);identityBar(new T.Vector3(0,.74,.28),new T.Vector3(0,1.48,.28),.025,gold);identityBar(new T.Vector3(-.42,1.34,.28),new T.Vector3(.42,1.34,.28),.025,gold);
   for(const side of [-1,1]){identityBar(new T.Vector3(side*.34,1.34,.28),new T.Vector3(side*.34,1.02,.28),.012,gold);const plate=piece(new T.CylinderGeometry(.15,.2,.025,16),glow,side*.34,1,.28);plate.rotation.x=Math.PI/2;}
  }else if(cardId==='miner'){
   // Mineradora ruiva: óculos, ombreiras de couro, picareta e cristais verdes.
   goggles();shoulderMantle(material(0x6d4129,.72));identityBar(new T.Vector3(.42,.42,.1),new T.Vector3(.42,1.42,.12),.035,gold);const pick=piece(new T.BoxGeometry(.55,.12,.14),steel,.42,1.46,.12);pick.rotation.z=-.08;
   for(let i=0;i<4;i++){const shard=piece(new T.OctahedronGeometry(.09),crystal,-.5+i*.22,.45+(i%2)*.13,.12);shard.scale.y=1.8;}
  }else if(cardId==='mirror'){
   // Espelho implícito: moldura azul-dourada, reflexo interno e pedestais.
   const glass=new T.MeshPhysicalMaterial({color:0xa8dcff,metalness:.72,roughness:.08,transmission:.32,transparent:true,opacity:.72,side:T.DoubleSide});const face=piece(new T.CircleGeometry(.42,40),glass,0,1.12,.05);face.scale.y=1.35;const frame=identityTorus(.48,.045,gold,0,1.12,.08);frame.scale.y=1.35;for(const side of [-1,1])identityOrb(.07,side*.49,1.12,.08);
  }else if(cardId==='newton'){
   // Newton jovem de casaco azul: gola branca, lapelas e sequência de aproximação.
   piece(new T.BoxGeometry(.46,.14,.38),material(0xe8e5d9,.72),0,1.34,.02);for(const side of [-1,1]){const lapel=piece(new T.BoxGeometry(.12,.55,.05),gold,side*.13,1.12,.24);lapel.rotation.z=side*.3;}
   const steps=Array.from({length:5},(_,i)=>new T.Vector3(-.55+i*.27,.48+i*.17,.26));curve(steps,glow,.035);for(const point of steps)identityOrb(.055,point.x,point.y,point.z);
  }else if(cardId==='opt'){
   // Bússola Ótima com anéis orbitais e ponteiro azul central.
   for(let i=0;i<4;i++){const ring=identityTorus(.28+i*.07,.022,i%2?gold:glow,0,1.08,0);ring.rotation.set(i*.5,i*.72,.3+i*.2);}const needle=piece(new T.ConeGeometry(.09,.72,5),crystal,0,1.08,.2);needle.rotation.z=-Math.PI/2;
  }else if(cardId==='parts'){
   // Duelista de lenço vermelho com lâminas complementares azul e laranja.
   const scarf=identityTorus(.25,.055,cloth,0,1.48,-.02);scarf.rotation.x=Math.PI/2;blade(-.34,.92,.28,glow,-.28);blade(.34,.92,.28,gold,.28);
  }else if(cardId==='parts2'){
   // Mestre veterano: manto rubro, placas douradas e duas energias trocadas.
   shoulderMantle(gold);blade(-.38,.98,.3,glow,-.32);blade(.38,.98,.3,gold,.32);for(const side of [-1,1])identityOrb(.09,side*.3,1.38,.3,side<0?gold:glow);
  }else if(cardId==='quotient'){
   // Ladina verde encapuzada com duas lâminas curvas cruzando numerador e denominador.
   const mask=piece(new T.BoxGeometry(.3,.1,.04),dark,0,1.64,.235);blade(-.34,.96,.3,glow,-.55);blade(.34,.96,.3,gold,.55);identityBar(new T.Vector3(-.43,1.08,.34),new T.Vector3(.43,1.08,.34),.018,glow);
  }else if(cardId==='rate'){
   // Engenheiro das taxas: óculos, relógio de bolso e engrenagens de cobre.
   goggles();const clock=identityTorus(.26,.035,gold,-.38,1.04,.3);clock.rotation.x=Math.PI/2;identityBar(new T.Vector3(-.38,1.04,.32),new T.Vector3(-.28,1.2,.32),.016,glow);for(let i=0;i<3;i++){const gear=identityTorus(.11+i*.035,.025,i%2?steel:gold,.28+i*.08,.72+i*.18,.18);gear.rotation.x=Math.PI/2;}
  }else if(cardId==='root'){
   // Mestre verde com braçadeira de raízes e punho cristalino rompendo a defesa.
   shoulderMantle(gold);for(let i=0;i<5;i++){const shard=piece(new T.ConeGeometry(.06,.32,6),crystal,.28+i*.075,1.05+(i%2)*.14,.24);shard.rotation.z=-.7+i*.15;}curve(Array.from({length:16},(_,i)=>new T.Vector3(-.48+i*.065,.66+Math.sqrt(i/15)*.54,.22)),glow,.03);
  }else if(cardId==='secant'){
   // Cavaleiro verde e dourado com lança luminosa atravessando dois pontos.
   shoulderMantle(gold);identityBar(new T.Vector3(-.55,.62,.28),new T.Vector3(.62,1.5,.28),.035,glow);for(const point of [new T.Vector3(-.28,.82,.28),new T.Vector3(.35,1.3,.28)])identityOrb(.07,point.x,point.y,point.z,gold);
  }else if(cardId==='series'){
   // A carta mostra dois feiticeiros: cria uma segunda silhueta ao lado do mago principal.
   const twin=piece(new T.CapsuleGeometry(.2,.42,8,16),cloth,.5,1.02,-.08);twin.scale.set(.9,1,.8);piece(new T.SphereGeometry(.19,22,16),skin,.5,1.58,-.08);piece(new T.SphereGeometry(.2,22,16,0,Math.PI*2,0,Math.PI*.55),hair,.5,1.65,-.1);for(const side of [-1,1])identityOrb(.08,side*.5,1.15,.28,side<0?gold:glow);arc(glow,0,.78,.24,1.25);
  }else if(cardId==='simpson'){
   // Mecânica ruiva com óculos e arco parabólico apoiado em três pontos.
   goggles();shoulderMantle(material(0x6b4328,.72));const parabola=arc(gold,0,.78,.3,1.35);parabola.name='simpson-parabola';for(const x of [-.5,0,.5])identityOrb(.06,x,.78+(1-(x/.5)**2)*.34,.3,glow);
  }else if(cardId==='simpson-advanced'){
   // Oráculo ancião violeta e dourado com parábolas sucessivas.
   shoulderMantle(gold);for(let i=0;i<3;i++)arc(i%2?glow:gold,0,.68+i*.14,.22-i*.03,1.45-i*.22);identityOrb(.09,0,1.35,.3);
  }else if(cardId==='sub'){
   // Alquimista u: casaco escuro e dois frascos ligados por fluxo dourado-azul.
   shoulderMantle(gold);for(const side of [-1,1]){const vial=piece(new T.SphereGeometry(.12,18,14),side<0?glow:gold,side*.38,.9,.28);piece(new T.CylinderGeometry(.04,.055,.16,10),steel,side*.38,1.05,.28);}curve(Array.from({length:20},(_,i)=>new T.Vector3(-.38+i*.04,.94+Math.sin(i/19*Math.PI)*.3,.3)),glow,.025);
  }else if(cardId==='surface'){
   // Navegadora azul-dourada com folha de superfície e astrolábio.
   shoulderMantle(gold);const grid=new T.Group();grid.name='surface-grid';identity.add(grid);for(let row=-2;row<=2;row++)curve(Array.from({length:14},(_,i)=>{const u=i/13*2-1;return new T.Vector3(u*.55,.72+row*.08+Math.sin(u*Math.PI)*.16,.28+row*.025);}),row%2?gold:glow,.014);for(let i=0;i<3;i++){const ring=identityTorus(.17+i*.055,.014,i%2?gold:glow,.44,1.3,.12);ring.rotation.set(i*.55,i*.72,.25);}
  }else if(cardId==='surface-flux'){
   // Tecelã violeta-azul com esfera fechada e linhas vetoriais atravessando-a.
   const shell=piece(new T.SphereGeometry(.35,20,14),new T.MeshBasicMaterial({color:p.glow,wireframe:true,transparent:true,opacity:.55}),.3,1.12,.08);shell.scale.y=.82;for(let i=-2;i<=2;i++)identityBar(new T.Vector3(-.35,i*.13+1.12,.22),new T.Vector3(.72,i*.13+1.12,.22),.014,i%2?gold:glow);
  }else if(cardId==='taylor'){
   // Oráculo de óculos, livro aberto e páginas douradas em série.
   goggles();book(.12,.93,.3,material(0x4b2d24,.7));for(let i=0;i<5;i++){const page=piece(new T.BoxGeometry(.22,.018,.15),i%2?gold:glow,-.48+i*.22,1.25+i*.1,.18);page.rotation.set(.15,i*.3,-.25+i*.12);}
  }else if(cardId==='taylor2'){
   // Escriba masculino com pergaminho curvo, pena e aproximações em camadas.
   shoulderMantle(gold);const scroll=arc(material(0xe4d6ae,.78),0,.88,.26,1.05);scroll.scale.z=1.8;identityBar(new T.Vector3(.42,.62,.26),new T.Vector3(.58,1.38,.26),.022,gold);for(let i=0;i<4;i++)curve(Array.from({length:10},(_,j)=>new T.Vector3(-.42+j*.09,.72+i*.12+Math.sin(j*.45)*.035,.3)),i%2?gold:glow,.012);
  }else if(cardId==='trap'){
   // Engenheira steampunk com óculos e placas trapezoidais empilhadas.
   goggles();shoulderMantle(material(0x70462d,.72));for(let i=0;i<5;i++){const shape=new T.Shape();const top=.12+i*.02,bottom=.22+i*.035;shape.moveTo(-bottom,0);shape.lineTo(bottom,0);shape.lineTo(top,.2);shape.lineTo(-top,.2);shape.closePath();const plate=piece(new T.ShapeGeometry(shape),i%2?gold:glow,0,.46+i*.18,.3);plate.rotation.y=i*.08;}
  }else if(cardId==='volume'){
   // Tecelã azul criando um sólido por camadas elípticas.
   shoulderMantle(gold);for(let i=0;i<7;i++){const radius=.12+Math.sin((i+1)/8*Math.PI)*.28;const ring=identityTorus(radius,.018,i%2?gold:glow,.34,.62+i*.14,.18);ring.rotation.x=Math.PI/2;ring.scale.z=.65;}identityBar(new T.Vector3(.34,.55,.18),new T.Vector3(.34,1.58,.18),.014,glow);
  }
 }

 function addSignature(left:T.Object3D,right:T.Object3D){
  if(cardId==='slope'){
   const points=Array.from({length:17},(_,i)=>{const a=-Math.PI/2+i*Math.PI/16;return new T.Vector3(.25*Math.cos(a),.55*Math.sin(a)-.25,.2);});
   const bow=mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),24,.032,8,false),gold,0,0,0,left);bow.name='slope-gold-bow';
   bar(points[0],points[16],.009,glow,left).name='slope-drawn-bowstring';
   bar(new T.Vector3(0,-.42,-.1),new T.Vector3(0,-.42,.75),.015,gold,right).name='slope-arrow-shaft';
   const tip=mesh(new T.ConeGeometry(.052,.18,8),glow,0,-.42,.76,right);tip.rotation.x=Math.PI/2;tip.name='slope-arrow-tip';
  }else if(cardId==='power'){
    const staff=bar(new T.Vector3(0,-.83,.11),new T.Vector3(0,.77,.11),.052,gold,left);staff.name='power-ornate-gold-staff';
    for(const y of [-.65,-.25,.1,.46,.68]){const ring=torus(.073,.018,gold,0,y,.11,left);ring.rotation.x=Math.PI/2;}
    const halo=torus(.2,.03,glow,0,.88,.11,left);halo.rotation.x=Math.PI/2;halo.name='power-staff-flame-halo';
    const fire=Array.from({length:28},(_,i)=>{const t=i/27,a=t*Math.PI*4;return new T.Vector3(Math.sin(a)*(.08+t*.11),.56+t*.7,.11+Math.cos(a)*(.08+t*.11));});
    mesh(new T.TubeGeometry(new T.CatmullRomCurve3(fire),64,.027,8,false),glow,0,0,0,left).name='power-golden-energy-helix';
    orb(.16,0,-.32,.48,right).name='power-casting-orb';
  }else if(['ln','quotient','parts','parts2','growth'].includes(cardId)){
   for(const arm of [left,right]){const blade=mesh(new T.ConeGeometry(.07,.68,5),crystal,0,-.44,.4,arm);blade.rotation.x=Math.PI/2;bar(new T.Vector3(-.13,-.45,.12),new T.Vector3(.13,-.45,.12),.022,gold,arm);}
  }else if(['limit','cauchy','comparison','root','secant'].includes(cardId)){
   const shield=mesh(new T.CylinderGeometry(.34,.34,.085,8),steel,0,-.25,.23,left);shield.rotation.x=Math.PI/2;torus(.26,.028,glow,0,-.25,.29,left);
   const blade=mesh(new T.ConeGeometry(.085,.82,5),crystal,0,-.12,.2,right);blade.rotation.x=.25;
  }else if(cardId==='miner'){
   bar(new T.Vector3(0,-.7,.1),new T.Vector3(0,.25,.1),.04,gold,right);mesh(new T.BoxGeometry(.52,.2,.22),steel,0,.22,.1,right);
  }else if(cardId==='rate'){
   for(const x of [-.11,.11])torus(.075,.018,gold,x,1.87,.14);const clock=torus(.25,.035,gold,0,-.25,.2,left);for(let i=0;i<8;i++){const a=i*Math.PI/4;bar(new T.Vector3(Math.cos(a)*.17,-.25+Math.sin(a)*.17,.2),new T.Vector3(Math.cos(a)*.22,-.25+Math.sin(a)*.22,.2),.012,gold,left);}bar(new T.Vector3(0,-.25,.22),new T.Vector3(.1,-.08,.22),.014,glow,left);
  }else if(cardId==='gabriel'){
   for(const side of [-1,1])for(let i=0;i<5;i++){const feather=mesh(new T.ConeGeometry(.11,.9-i*.08,5),look.whiteGold?steel:gold,side*(.4+i*.1),1.38+i*.09,-.16);feather.rotation.z=-side*(.55+i*.11);}
   const horn=mesh(new T.ConeGeometry(.2,.62,14,1,true),gold,0,-.3,.42,right);horn.rotation.x=Math.PI/2;
  }else{
   bar(new T.Vector3(0,-.75,.12),new T.Vector3(0,.45,.12),.032,gold,right);orb(.13,0,.52,.12,right);
   if(['taylor','taylor2','cavalieri','cavalieri-advanced','ftc'].includes(cardId)){const book=mesh(new T.BoxGeometry(.38,.06,.27),gold,0,-.44,.16,left);book.rotation.z=.18;}
  }
  addPowerGeometry(left);
 }

 function addPowerGeometry(parent:T.Object3D){
  const center=new T.Vector3(0,-.28,.48);
  if(['cavalieri','cavalieri-advanced','trap'].includes(cardId))for(let i=0;i<4;i++){const plate=mesh(new T.BoxGeometry(.36-i*.035,.025,.25-i*.02),crystal,center.x,center.y+i*.14,center.z,parent);plate.rotation.y=i*.25;}
  else if(cardId==='mean'){bar(new T.Vector3(-.34,-.22,.45),new T.Vector3(.34,-.22,.45),.025,gold,parent);for(const x of [-.28,.28]){bar(new T.Vector3(x,-.22,.45),new T.Vector3(x,-.5,.45),.012,gold,parent);mesh(new T.CylinderGeometry(.13,.18,.035,12),gold,x,-.52,.45,parent);}}
  else if(['average','simpson','simpson-advanced'].includes(cardId))for(let i=-1;i<=1;i++)orb(.075,i*.22,center.y+Math.abs(i)*.18,center.z,parent);
  else if(['continuity','inverse','compare'].includes(cardId))for(let i=0;i<3;i++){const ring=torus(.18+i*.07,.018,i%2?gold:glow,center.x,center.y,center.z,parent);ring.rotation.set(i*.5,i*.7,i*.35);}
  else if(['surface','surface-flux','volume','sine'].includes(cardId)){const points=Array.from({length:22},(_,i)=>new T.Vector3((i-10.5)*.04,center.y+Math.sin(i*.62)*.12,center.z+Math.cos(i*.62)*.12));mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),24,.025,6,false),glow,0,0,0,parent);}
  else if(p.motif==='helix')for(let i=0;i<12;i++){const a=i*.85;orb(.035,Math.cos(a)*.2,center.y+(i-5.5)*.055,center.z+Math.sin(a)*.2,parent);}
  else if(p.motif==='shards')for(let i=0;i<5;i++){const a=i*Math.PI*2/5;const shard=mesh(new T.OctahedronGeometry(.08),crystal,Math.cos(a)*.24,center.y+Math.sin(a)*.18,center.z,parent);shard.scale.y=1.7;}
 }

 const clips:T.AnimationClip[]=[];
 for(const [name,duration,swing,bounce] of [['idle',2,.025,.025],['walk',.8,.5,.045],['run',.45,.8,.08],['jump',.65,.3,.5],['summon',.75,.25,.34],['attack',.7,.2,.07],['power',.9,.35,.12],['hurt',.45,.12,.04],['victory',1.2,.6,.18],['defeat',.8,0,0]] as const){
  const times=[0,duration*.25,duration*.5,duration*.75,duration];
  const yValues=name==='defeat'?[0,-.05,-.18,-.3,-.45]:name==='summon'?[-.45,.2,.06,.13,0]:[0,bounce+(floating?.14:0),0,bounce,0];
  const zValues=name==='defeat'?[0,.15,.5,.9,1.4]:name==='hurt'?[0,-.16,.13,-.07,0]:[0,0,0,0,0];
  const tracks:T.KeyframeTrack[]=[new T.NumberKeyframeTrack('body.position[y]',times,yValues),new T.NumberKeyframeTrack('body.rotation[z]',times,zValues)];
  if(!floating)for(const [part,sign] of [['legL',1],['legR',-1],['armL',-1],['armR',1]] as const){
   let values=[0,swing*sign,0,-swing*sign,0];if(name==='victory'&&part.startsWith('arm'))values=[0,-2.5,-2.2,-2.5,-2.2];
   if((name==='attack'||name==='power')&&part.startsWith('arm'))values=name==='power'?[0,-2.45,-2.2,-2.45,0]:p.archetype==='archer'?(part==='armL'?[0,-1.5,-1.5,-1.5,0]:[0,-1.2,-.6,-1.6,0]):p.archetype==='dancer'?[0,-1,-2,-1,0]:p.archetype==='rogue'?[0,-2,1,-2,0]:['guardian','titan','golem'].includes(p.archetype)?[0,-2.7,-2.7,.5,0]:[0,-1.5,-1.7,-1.5,0];
   tracks.push(new T.NumberKeyframeTrack(`${part}.rotation[x]`,times,values));
  }
  if(floating||p.archetype==='dancer')tracks.push(new T.NumberKeyframeTrack('body.rotation[y]',times,name==='attack'?[0,Math.PI*.5,Math.PI,Math.PI*1.5,Math.PI*2]:[0,.1,0,-.1,0]));
  if(cardId==='slope'||cardId==='power'){
   const strike=name==='attack'||name==='power',stride=name==='walk'||name==='run';
   tracks.push(new T.NumberKeyframeTrack('body.rotation[y]',times,strike?[0,-.14,-.2,.12,0]:stride?[0,.05,0,-.05,0]:[0,.018,0,-.018,0]));
   tracks.push(new T.NumberKeyframeTrack('body.rotation[x]',times,strike?[0,-.09,-.13,.09,0]:[0,.012,0,-.012,0]));
   tracks.push(new T.NumberKeyframeTrack('capeHem.rotation[z]',times,strike?[0,-.11,.17,-.2,0]:stride?[0,-.12,.08,-.08,0]:[0,.04,.07,-.025,0]));
   if(cardId==='slope')tracks.push(new T.NumberKeyframeTrack('ponytail.rotation[z]',times,strike?[0,.06,-.28,.24,0]:stride?[0,.17,-.13,.14,0]:[0,-.03,.08,.035,0]));
   if(cardId==='power')tracks.push(new T.NumberKeyframeTrack('beardTail.rotation[x]',times,strike?[0,.08,-.18,.11,0]:stride?[0,.09,-.06,.07,0]:[0,.035,.07,-.015,0]));
  }
  clips.push(new T.AnimationClip(name,duration,tracks));
 }
 root.userData.cardId=cardId;root.userData.reference='geometry-only';return {root,clips};
}
