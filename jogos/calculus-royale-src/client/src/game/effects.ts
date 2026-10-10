import * as T from 'three';
import { getCardProfile } from './cardProfiles.ts';
import type { CombatEvent } from './combat.ts';
export function createAbilityEffect(event:CombatEvent){
 const p=getCardProfile(event.cardId),group=new T.Group();group.position.set(event.x,.85,event.z);
 const material=new T.PointsMaterial({color:p.glow,size:.12,transparent:true,opacity:1,depthWrite:false,blending:T.AdditiveBlending});
 const count=36,positions=new Float32Array(count*3),geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.BufferAttribute(positions,3));group.add(new T.Points(geometry,material));
 const ringMaterial=new T.MeshBasicMaterial({color:p.glow,transparent:true,opacity:.75,side:T.DoubleSide,depthWrite:false,blending:T.AdditiveBlending});
 const ring=new T.Mesh(new T.RingGeometry(.24,.29,32),ringMaterial);ring.rotation.x=Math.PI/2;ring.position.y=-.75;group.add(ring);
 const light=new T.PointLight(p.glow,2.4,4,2);group.add(light);
 const auraMaterial=new T.MeshBasicMaterial({color:p.glow,transparent:true,opacity:.32,wireframe:true,depthWrite:false,blending:T.AdditiveBlending});
 const aura=new T.Mesh(new T.SphereGeometry(.38,16,10),auraMaterial);aura.visible=['shield','heal','reflect','haste'].includes(p.kind);group.add(aura);
 const signature=new T.Group();group.add(signature);const signatureMaterials:T.Material[]=[];
 const sigMaterial=(opacity=.82)=>{const value=new T.MeshBasicMaterial({color:p.glow,transparent:true,opacity,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide});signatureMaterials.push(value);return value;};
 const sigMesh=(geometry:T.BufferGeometry,material:T.Material,x=0,y=0,z=0)=>{const value=new T.Mesh(geometry,material);value.position.set(x,y,z);signature.add(value);return value;};
 if(p.motif==='arrow'){
  const shaft=sigMesh(new T.CylinderGeometry(.025,.025,1.55,8),sigMaterial(),.72,.08,0);shaft.rotation.z=Math.PI/2;
  const tip=sigMesh(new T.ConeGeometry(.09,.28,8),sigMaterial(),1.56,.08,0);tip.rotation.z=-Math.PI/2;
 }else if(p.motif==='wave'){
  const points=Array.from({length:30},(_,i)=>new T.Vector3((i/29-0.5)*2.2,Math.sin(i/29*Math.PI*4)*.24,.08));sigMesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),48,.035,8,false),sigMaterial());
 }else if(p.motif==='helix'){
  const points=Array.from({length:36},(_,i)=>{const a=i*.62;return new T.Vector3(Math.cos(a)*(.16+i*.008),i*.035-.55,Math.sin(a)*(.16+i*.008));});sigMesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),64,.032,7,false),sigMaterial(),0,.3,0);
 }else if(p.motif==='rings'){
  for(let i=0;i<3;i++){const circle=sigMesh(new T.TorusGeometry(.32+i*.18,.035,8,40),sigMaterial(.72-i*.12),0,.08,0);circle.rotation.x=Math.PI/2;circle.rotation.y=i*.34;}
 }else if(p.motif==='beam'){
  const beam=sigMesh(new T.CylinderGeometry(.045,.045,1.9,10),sigMaterial(),.9,.08,0);beam.rotation.z=Math.PI/2;
 }else{
  for(let i=0;i<5;i++){const shard=sigMesh(new T.OctahedronGeometry(.11),sigMaterial(),Math.cos(i*Math.PI*2/5)*.55,.08,Math.sin(i*Math.PI*2/5)*.55);shard.scale.y=1.8;}
 }
 let age=0;const signatureHash=Array.from(event.cardId).reduce((sum,c)=>sum+c.charCodeAt(0),0)%11;
 return {group,update(dt:number){age+=dt;const t=age/1.1;for(let i=0;i<count;i++){const k=i/count,a=k*Math.PI*2*(1+signatureHash%3)+age*3;let x=0,y=0,z=0;switch(p.motif){
  case 'arrow':x=t*1.8+k*.7;y=Math.sin(k*Math.PI)*.14;z=(i%3-1)*.08;break;
  case 'wave':x=k*2;y=Math.sin(k*Math.PI*4-age*8)*.25;z=(t-.4)*1.4;break;
  case 'helix':x=k*1.4;y=Math.sin(a)*(.25+t*.3);z=Math.cos(a)*(.25+t*.3);break;
  case 'rings':x=Math.cos(a)*(.25+t);y=Math.floor(i/12)*.25;z=Math.sin(a)*(.25+t);break;
  case 'shards':x=Math.cos(a)*t*1.4;y=Math.sin(k*9)*t+.3-t*t;z=Math.sin(a)*t*1.4;break;
  case 'beam':x=k*(1.5+t);y=Math.sin(a)*.07;z=Math.cos(a)*.07;break;
 }positions[i*3]=x*(event.enemy?-1:1);positions[i*3+1]=y;positions[i*3+2]=z;}geometry.attributes.position.needsUpdate=true;material.opacity=Math.max(0,1-t);ring.scale.setScalar(1+t*3);ringMaterial.opacity=Math.max(0,.7*(1-t));aura.scale.setScalar(1+t*2);auraMaterial.opacity=Math.max(0,.32*(1-t));signature.position.x=(event.enemy?-1:1)*t*.65;signature.rotation.y=age*(p.motif==='rings'||p.motif==='helix'?2.4:.35);signature.scale.setScalar(.75+t*.75);for(const value of signatureMaterials)if(value instanceof T.MeshBasicMaterial)value.opacity=Math.max(0,value.opacity*(1-dt*1.8));light.intensity=Math.max(0,2.4*(1-t));return age<1.1;},dispose(){geometry.dispose();material.dispose();ring.geometry.dispose();ringMaterial.dispose();aura.geometry.dispose();auraMaterial.dispose();signature.traverse(object=>{if(object instanceof T.Mesh)object.geometry.dispose();});signatureMaterials.forEach(value=>value.dispose());}};
}
