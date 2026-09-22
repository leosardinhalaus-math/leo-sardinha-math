import * as T from 'three';
import { getCardProfile } from './cardProfiles.ts';

type HairStyle='short'|'long'|'curly'|'hood'|'helmet'|'bald'|'robot';
type HeroLook={female?:boolean;hair?:HairStyle;beard?:boolean;skin?:number;armor?:boolean;whiteGold?:boolean};

// Descritores observados nas artes. Eles controlam a silhueta 3D; nenhuma imagem
// da carta é aplicada como textura ou placa no personagem.
const LOOKS:Record<string,HeroLook>={
 area:{female:true,hair:'long'},average:{hair:'short',beard:true},bernoulli:{hair:'curly',beard:true},cauchy:{hair:'short',beard:true,armor:true},
 cavalieri:{hair:'curly',beard:true},'cavalieri-advanced':{hair:'curly',beard:true},chain:{hair:'hood',beard:true},compare:{female:true,hair:'long'},
 comparison:{hair:'short',beard:true,armor:true},continuity:{female:true,hair:'long',armor:true},ftc:{hair:'curly',beard:true},gabriel:{female:true,hair:'long',whiteGold:true},
 growth:{female:true,hair:'curly',armor:true},implicit:{hair:'robot',armor:true,skin:0x6f8395},improper:{hair:'helmet',armor:true,skin:0x5c4f66},inverse:{female:true,hair:'long'},
 limit:{hair:'helmet',armor:true,skin:0x7a8998},ln:{female:true,hair:'hood'},mean:{hair:'short',beard:true,armor:true},miner:{female:true,hair:'curly',armor:true},
 newton:{hair:'long'},parts:{female:true,hair:'long',armor:true},parts2:{hair:'short',beard:true,armor:true},power:{hair:'hood',beard:true},
 quotient:{female:true,hair:'hood'},rate:{hair:'short',skin:0x8d5f45},root:{hair:'short',beard:true,armor:true},secant:{hair:'short',beard:true,armor:true},
 series:{hair:'short'},simpson:{female:true,hair:'curly'},'simpson-advanced':{hair:'curly',beard:true},sine:{female:true,hair:'long'},slope:{female:true,hair:'long',armor:true},
 sub:{hair:'short',beard:true},surface:{female:true,hair:'long'},'surface-flux':{female:true,hair:'long'},taylor:{female:true,hair:'curly'},taylor2:{hair:'short',beard:true},
 trap:{female:true,hair:'curly'},volume:{female:true,hair:'long'},
};

const OBJECTS=new Set(['euler','expchain','fractal','mirror','opt']);

export function createProceduralCharacter(cardId:string){
 const p=getCardProfile(cardId),look=LOOKS[cardId]??{},root=new T.Group(),body=new T.Group();body.name='body';root.add(body);
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
  const armored=look.armor||['guardian','golem','titan'].includes(p.archetype),robed=['mage','priest','angel','dancer'].includes(p.archetype);
  const width=p.archetype==='golem'||p.archetype==='titan'?.45:look.female?.27:.31;
  mesh(new T.CylinderGeometry(width*.82,width,.62,10),armored?steel:cloth,0,1.08,0);mesh(new T.BoxGeometry(width*2.15,.1,.43),gold,0,.78,0);
  if(robed)mesh(new T.CylinderGeometry(width*.78,.43,.68,12),cloth,0,.54,0);
  if(armored){mesh(new T.BoxGeometry(width*2.2,.12,.48),gold,0,1.32,0);for(const side of [-1,1])mesh(new T.SphereGeometry(.17,8,6),gold,side*(width+.08),1.34,0);}
  if(!['dancer','engineer'].includes(p.archetype)){const cape=mesh(new T.ConeGeometry(.5,1.05,10,1,true,0,Math.PI),cloth,0,.88,-.18);cape.rotation.x=.08;}
  mesh(new T.SphereGeometry(.23,14,10),skin,0,1.68,0);addHair();addFace();
  for(const side of [-1,1]){
   const leg=new T.Group();leg.name=side<0?'legL':'legR';leg.position.set(side*.15,.72,0);body.add(leg);mesh(new T.CapsuleGeometry(.09,.36,4,7),armored?steel:dark,0,-.24,0,leg);mesh(new T.BoxGeometry(.21,.14,.34),dark,0,-.51,.07,leg);
   const arm=new T.Group();arm.name=side<0?'armL':'armR';arm.position.set(side*(width+.08),1.3,0);body.add(arm);mesh(new T.CapsuleGeometry(.092,.32,4,7),armored?steel:cloth,0,-.22,0,arm);mesh(new T.SphereGeometry(.095,9,7),skin,0,-.48,.04,arm);
  }
  addSignature(body.getObjectByName('armL')!,body.getObjectByName('armR')!);
 }

 function addHair(){
  const style=look.hair??'short';
  if(style==='robot'){const helmet=mesh(new T.SphereGeometry(.25,10,7),steel,0,1.69,0);mesh(new T.BoxGeometry(.34,.09,.03),glow,0,1.69,.225);helmet.scale.y=1.05;return;}
  if(style==='helmet'){mesh(new T.SphereGeometry(.255,10,7),steel,0,1.69,0);mesh(new T.BoxGeometry(.035,.34,.27),gold,0,1.74,.08);mesh(new T.BoxGeometry(.3,.08,.06),dark,0,1.67,.225);return;}
  if(style==='hood'){const hood=mesh(new T.SphereGeometry(.32,12,8),cloth,0,1.7,-.04);hood.scale.set(1,1.13,.82);mesh(new T.SphereGeometry(.235,12,8),skin,0,1.66,.08);}
  else if(style!=='bald')mesh(new T.SphereGeometry(.245,12,8,0,Math.PI*2,0,Math.PI*.55),hair,0,1.73,-.02);
  if(style==='long')for(const side of [-1,1]){const lock=mesh(new T.CapsuleGeometry(.075,.72,4,7),hair,side*.19,1.34,-.1);lock.rotation.z=side*.14;}
  if(style==='curly')for(let i=0;i<7;i++){const a=i/7*Math.PI*2;mesh(new T.SphereGeometry(.095,8,6),hair,Math.cos(a)*.22,1.64+Math.sin(a)*.16,-.1);}
  if(look.beard){const beard=mesh(new T.ConeGeometry(.18,.38,9),hair,0,1.43,.11);beard.rotation.z=Math.PI;for(const side of [-1,1])mesh(new T.CapsuleGeometry(.025,.13,3,5),hair,side*.09,1.58,.22).rotation.z=side*.55;}
  if(look.female)for(const side of [-1,1]){const earring=orb(.035,side*.22,1.59,.08);earring.material=gold;}
 }

 function addFace(){for(const side of [-1,1]){mesh(new T.SphereGeometry(.026,7,5),dark,side*.078,1.69,.216);const brow=mesh(new T.BoxGeometry(.082,.018,.022),hair,side*.075,1.75,.208);brow.rotation.z=side*.12;}mesh(new T.BoxGeometry(.065,.018,.018),material(0x713b35),0,1.58,.223);}

 function addSignature(left:T.Object3D,right:T.Object3D){
  if(cardId==='slope'){
   const points=Array.from({length:17},(_,i)=>{const a=-Math.PI/2+i*Math.PI/16;return new T.Vector3(.25*Math.cos(a),.55*Math.sin(a)-.25,.2);});
   mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),18,.027,6,false),gold,0,0,0,left);bar(points[0],points[16],.008,glow,left);bar(new T.Vector3(0,-.42,-.1),new T.Vector3(0,-.42,.7),.014,gold,right);
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
 for(const [name,duration,swing,bounce] of [['idle',2,.025,.025],['walk',.8,.5,.045],['run',.45,.8,.08],['jump',.65,.3,.5],['attack',.7,.2,.07],['victory',1.2,.6,.18],['defeat',.8,0,0]] as const){
  const times=[0,duration*.25,duration*.5,duration*.75,duration];
  const tracks:T.KeyframeTrack[]=[new T.NumberKeyframeTrack('body.position[y]',times,name==='defeat'?[0,-.05,-.18,-.3,-.45]:[0,bounce+(floating?.14:0),0,bounce,0]),new T.NumberKeyframeTrack('body.rotation[z]',times,name==='defeat'?[0,.15,.5,.9,1.4]:[0,0,0,0,0])];
  if(!floating)for(const [part,sign] of [['legL',1],['legR',-1],['armL',-1],['armR',1]] as const){
   let values=[0,swing*sign,0,-swing*sign,0];if(name==='victory'&&part.startsWith('arm'))values=[0,-2.5,-2.2,-2.5,-2.2];
   if(name==='attack'&&part.startsWith('arm'))values=p.archetype==='archer'?(part==='armL'?[0,-1.5,-1.5,-1.5,0]:[0,-1.2,-.6,-1.6,0]):p.archetype==='dancer'?[0,-1,-2,-1,0]:p.archetype==='rogue'?[0,-2,1,-2,0]:['guardian','titan','golem'].includes(p.archetype)?[0,-2.7,-2.7,.5,0]:[0,-1.5,-1.7,-1.5,0];
   tracks.push(new T.NumberKeyframeTrack(`${part}.rotation[x]`,times,values));
  }
  if(floating||p.archetype==='dancer')tracks.push(new T.NumberKeyframeTrack('body.rotation[y]',times,name==='attack'?[0,Math.PI*.5,Math.PI,Math.PI*1.5,Math.PI*2]:[0,.1,0,-.1,0]));clips.push(new T.AnimationClip(name,duration,tracks));
 }
 root.userData.cardId=cardId;root.userData.reference='geometry-only';return {root,clips};
}
