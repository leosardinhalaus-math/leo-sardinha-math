import * as T from 'three';
import { getCardProfile } from './cardProfiles.ts';

// Modelagem procedural low-poly com materiais e acessórios por carta.
// Não usa o retrato como uma placa: todas as peças abaixo são geometria 3D.
export function createProceduralCharacter(cardId:string){
 const p=getCardProfile(cardId),root=new T.Group(),body=new T.Group();body.name='body';root.add(body);
 const cloth=new T.MeshStandardMaterial({color:p.color,roughness:.7});
 const gold=new T.MeshStandardMaterial({color:0xdab568,metalness:.65,roughness:.3});
 const steel=new T.MeshStandardMaterial({color:0xb4c5d4,metalness:.65,roughness:.35});
 const glow=new T.MeshStandardMaterial({color:p.glow,emissive:p.glow,emissiveIntensity:.8});
 const skin=new T.MeshStandardMaterial({color:0xdba17c,roughness:.85});
 const hair=new T.MeshStandardMaterial({color:p.hair,roughness:.9});
 const dark=new T.MeshStandardMaterial({color:0x142238});
 function mesh(g:T.BufferGeometry,m:T.Material,x:number,y:number,z:number,parent:T.Object3D=body){const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;parent.add(o);return o;}
 function bar(from:T.Vector3,to:T.Vector3,radius:number,material:T.Material,parent:T.Object3D){const v=to.clone().sub(from);const o=mesh(new T.CylinderGeometry(radius,radius,v.length(),6),material,0,0,0,parent);o.position.copy(from).add(to).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());return o;}
 function ring(radius:number,x:number,y:number,z:number,parent:T.Object3D=body){return mesh(new T.TorusGeometry(radius,.025,5,24),gold,x,y,z,parent);}
 const floating=['orb','relic'].includes(p.archetype);
 if(floating){
  if(cardId==='mirror'){const disc=mesh(new T.CircleGeometry(.55,24),steel,0,1.05,0);disc.material=new T.MeshStandardMaterial({color:p.glow,metalness:.95,roughness:.12,side:T.DoubleSide});disc.scale.y=1.4;const frame=ring(.59,0,1.05,0);frame.scale.y=1.4;}
  else if(cardId==='fractal'){mesh(new T.OctahedronGeometry(.45),glow,0,1,0);for(let i=0;i<8;i++){const angle=i*Math.PI/4;bar(new T.Vector3(0,.7,0),new T.Vector3(Math.sin(angle)*.55,1.5,Math.cos(angle)*.55),.028,gold,body);mesh(new T.OctahedronGeometry(.12),glow,Math.sin(angle)*.55,1.5,Math.cos(angle)*.55);}}
  else {mesh(new T.IcosahedronGeometry(cardId==='opt'?.25:.38,1),glow,0,1.1,0);for(let i=0;i<3;i++){const r=ring(.48+i*.075,0,1.1,0);r.rotation.set(i*.8,i*.7,.35);}}
 }else{
  const armor=['guardian','golem','titan'].includes(p.archetype),robe=['mage','priest','angel','dancer'].includes(p.archetype);
  const width=p.archetype==='golem'||p.archetype==='titan'?.47:.29;
  mesh(new T.CylinderGeometry(width*.85,width,.58,8),armor?steel:cloth,0,1.08,0);
  mesh(new T.BoxGeometry(width*2.12,.1,.43),gold,0,.81,0);
  if(robe)mesh(new T.CylinderGeometry(width*.8,.4,.65,10),cloth,0,.55,0);
  if(!['dancer','engineer'].includes(p.archetype)){const cape=mesh(new T.CylinderGeometry(.18,.45,1,8,1,true,0,Math.PI),cloth,0,.9,-.16);cape.rotation.y=Math.PI/2;}
  mesh(new T.SphereGeometry(.235,10,8),skin,0,1.65,0);
  // Visage orienté +Z: cabelo, olhos e sobrancelhas em volume.
  mesh(new T.SphereGeometry(.247,10,8,0,Math.PI*2,0,Math.PI*.54),hair,0,1.7,-.015);
  for(const side of [-1,1]){
   mesh(new T.BoxGeometry(.045,.037,.018),dark,side*.085,1.67,.216);
   const brow=mesh(new T.BoxGeometry(.085,.021,.025),hair,side*.08,1.73,.205);brow.rotation.z=side*.15;
   const leg=new T.Group();leg.name=side<0?'legL':'legR';leg.position.set(side*.16,.72,0);body.add(leg);
   mesh(new T.CapsuleGeometry(.095,.35,3,6),armor?steel:dark,0,-.24,0,leg);mesh(new T.BoxGeometry(.22,.15,.32),dark,0,-.51,.055,leg);
   const arm=new T.Group();arm.name=side<0?'armL':'armR';arm.position.set(side*(width+.08),1.31,0);body.add(arm);
   mesh(new T.CapsuleGeometry(.095,.3,3,6),armor?steel:cloth,0,-.22,0,arm);mesh(new T.SphereGeometry(.10,8,6),skin,0,-.47,.04,arm);
   mesh(new T.SphereGeometry(armor?.2:.12,6,4),gold,0,0,0,arm);
  }
  const left=body.getObjectByName('armL')!,right=body.getObjectByName('armR')!;
  if(p.archetype==='archer'){
   const pts=Array.from({length:17},(_,i)=>{const a=-Math.PI/2+i*Math.PI/16;return new T.Vector3(.25*Math.cos(a),.55*Math.sin(a)-.25,.2);});
   mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),16,.028,5,false),gold,0,0,0,left);bar(pts[0],pts[16],.009,glow,left);
   bar(new T.Vector3(0,-.4,-.1),new T.Vector3(0,-.4,.7),.013,gold,right);const tip=mesh(new T.ConeGeometry(.06,.16,4),glow,0,-.4,.75,right);tip.rotation.x=Math.PI/2;
   mesh(new T.CylinderGeometry(.09,.08,.55,6),dark,.13,1.12,-.3);
  }else if(p.archetype==='rogue'){
   for(const arm of [left,right]){const blade=mesh(new T.ConeGeometry(.065,.6,4),glow,0,-.48,.38,arm);blade.rotation.x=Math.PI/2;bar(new T.Vector3(-.12,-.48,.12),new T.Vector3(.12,-.48,.12),.02,gold,arm);}
  }else if(p.archetype==='guardian'){
   const shield=mesh(new T.CylinderGeometry(.32,.32,.08,6),steel,0,-.24,.22,left);shield.rotation.x=Math.PI/2;mesh(new T.OctahedronGeometry(.11),glow,0,-.24,.29,left);
   const blade=mesh(new T.ConeGeometry(.08,.8,4),glow,0,-.1,.18,right);blade.rotation.x=.25;
  }else if(p.archetype==='engineer'){
   for(const x of [-.12,.12]){const goggles=ring(.08,x,1.86,.12);goggles.material=gold;}
   bar(new T.Vector3(0,-.55,.1),new T.Vector3(0,.2,.1),.035,gold,right);mesh(new T.BoxGeometry(.5,.17,.2),steel,0,.18,.1,right);
   mesh(new T.BoxGeometry(.3,.45,.16),cloth,0,1.1,-.3);
  }else if(p.archetype==='angel'){
   for(const side of [-1,1])for(let i=0;i<5;i++){const feather=mesh(new T.ConeGeometry(.11,.9-i*.09,4),gold,side*(.4+i*.1),1.4+i*.09,-.15);feather.rotation.z=-side*(.55+i*.12);}
   const horn=mesh(new T.ConeGeometry(.2,.6,12,1,true),gold,0,-.3,.4,right);horn.rotation.x=Math.PI/2;
  }else if(p.archetype==='mage'||p.archetype==='priest'){
   bar(new T.Vector3(0,-.8,.12),new T.Vector3(0,.5,.12),.03,gold,right);mesh(new T.OctahedronGeometry(.14),glow,0,.57,.12,right);
   const book=mesh(new T.BoxGeometry(.33,.05,.24),gold,0,-.45,.15,left);book.rotation.z=.2;
   if(p.archetype==='mage'){mesh(new T.ConeGeometry(.27,.4,7),cloth,0,1.98,0);if(p.hair==='#ddd8c6'||p.hair==='#e2ddd2'||p.hair==='#ddd5c6'||p.hair==='#e1d8c5')mesh(new T.ConeGeometry(.16,.35,6),hair,0,1.42,.16).rotation.z=Math.PI;}
  }else if(p.archetype==='dancer'){
   for(const side of [-1,1]){const pts=Array.from({length:20},(_,i)=>new T.Vector3(side*(.35+i*.025),1+Math.sin(i*.35)*.25,Math.cos(i*.35)*.3));mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),20,.025,5,false),glow,0,0,0);}
  }else{mesh(new T.BoxGeometry(.48,.22,.4),steel,0,-.38,.1,right);mesh(new T.OctahedronGeometry(.14),glow,0,1.12,.3);}
 }
 const clips:T.AnimationClip[]=[];
 for(const [name,duration,swing,bounce] of [['idle',2,.025,.025],['walk',.8,.5,.045],['run',.45,.8,.08],['jump',.65,.3,.5],['attack',.7,.2,.07],['victory',1.2,.6,.18],['defeat',.8,0,0]] as const){
  const times=[0,duration*.25,duration*.5,duration*.75,duration];
  const tracks:T.KeyframeTrack[]=[new T.NumberKeyframeTrack('body.position[y]',times,name==='defeat'?[0,-.05,-.18,-.3,-.45]:[0,bounce+(floating?.15:0),0,bounce,0]),new T.NumberKeyframeTrack('body.rotation[z]',times,name==='defeat'?[0,.15,.5,.9,1.4]:[0,0,0,0,0])];
  if(!floating)for(const [part,sign] of [['legL',1],['legR',-1],['armL',-1],['armR',1]] as const){
   let values=[0,swing*sign,0,-swing*sign,0];
   if(name==='victory'&&part.startsWith('arm'))values=[0,-2.5,-2.2,-2.5,-2.2];
   if(name==='attack'&&part.startsWith('arm')){const a=p.archetype;values=a==='archer'?(part==='armL'?[0,-1.5,-1.5,-1.5,0]:[0,-1.2,-.6,-1.6,0]):a==='dancer'?[0,-1,-2,-1,0]:a==='rogue'?[0,-2,1,-2,0]:a==='guardian'||a==='titan'||a==='golem'?[0,-2.7,-2.7,.5,0]:[0,-1.5,-1.7,-1.5,0];}
   tracks.push(new T.NumberKeyframeTrack(`${part}.rotation[x]`,times,values));
  }
  if(floating||p.archetype==='dancer')tracks.push(new T.NumberKeyframeTrack('body.rotation[y]',times,name==='attack'?[0,Math.PI*.5,Math.PI,Math.PI*1.5,Math.PI*2]:[0,.1,0,-.1,0]));
  clips.push(new T.AnimationClip(name,duration,tracks));
 }
 root.userData.cardId=cardId;return {root,clips};
}
