import * as T from 'three';
import { getCardProfile } from './cardProfiles';
import type { CombatEvent } from './combat';
export function createAbilityEffect(event:CombatEvent){
 const p=getCardProfile(event.cardId),group=new T.Group();group.position.set(event.x,.85,event.z);
 const material=new T.PointsMaterial({color:p.glow,size:.12,transparent:true,opacity:1,depthWrite:false,blending:T.AdditiveBlending});
 const count=36,positions=new Float32Array(count*3),geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.BufferAttribute(positions,3));group.add(new T.Points(geometry,material));
 const ringMaterial=new T.MeshBasicMaterial({color:p.glow,transparent:true,opacity:.75,side:T.DoubleSide,depthWrite:false,blending:T.AdditiveBlending});
 const ring=new T.Mesh(new T.RingGeometry(.24,.29,32),ringMaterial);ring.rotation.x=Math.PI/2;ring.position.y=-.75;group.add(ring);
 const light=new T.PointLight(p.glow,2.4,4,2);group.add(light);
 const auraMaterial=new T.MeshBasicMaterial({color:p.glow,transparent:true,opacity:.32,wireframe:true,depthWrite:false,blending:T.AdditiveBlending});
 const aura=new T.Mesh(new T.SphereGeometry(.38,16,10),auraMaterial);aura.visible=['shield','heal','reflect','haste'].includes(p.kind);group.add(aura);
 let age=0;const signature=Array.from(event.cardId).reduce((sum,c)=>sum+c.charCodeAt(0),0)%11;
 return {group,update(dt:number){age+=dt;const t=age/1.1;for(let i=0;i<count;i++){const k=i/count,a=k*Math.PI*2*(1+signature%3)+age*3;let x=0,y=0,z=0;switch(p.motif){
  case 'arrow':x=t*1.8+k*.7;y=Math.sin(k*Math.PI)*.14;z=(i%3-1)*.08;break;
  case 'wave':x=k*2;y=Math.sin(k*Math.PI*4-age*8)*.25;z=(t-.4)*1.4;break;
  case 'helix':x=k*1.4;y=Math.sin(a)*(.25+t*.3);z=Math.cos(a)*(.25+t*.3);break;
  case 'rings':x=Math.cos(a)*(.25+t);y=Math.floor(i/12)*.25;z=Math.sin(a)*(.25+t);break;
  case 'shards':x=Math.cos(a)*t*1.4;y=Math.sin(k*9)*t+.3-t*t;z=Math.sin(a)*t*1.4;break;
  case 'beam':x=k*(1.5+t);y=Math.sin(a)*.07;z=Math.cos(a)*.07;break;
 }positions[i*3]=x*(event.enemy?-1:1);positions[i*3+1]=y;positions[i*3+2]=z;}geometry.attributes.position.needsUpdate=true;material.opacity=Math.max(0,1-t);ring.scale.setScalar(1+t*3);ringMaterial.opacity=Math.max(0,.7*(1-t));aura.scale.setScalar(1+t*2);auraMaterial.opacity=Math.max(0,.32*(1-t));light.intensity=Math.max(0,2.4*(1-t));return age<1.1;},dispose(){geometry.dispose();material.dispose();ring.geometry.dispose();ringMaterial.dispose();aura.geometry.dispose();auraMaterial.dispose();}};
}
