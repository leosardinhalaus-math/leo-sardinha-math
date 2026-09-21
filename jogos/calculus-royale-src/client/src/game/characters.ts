import * as T from 'three';
import { clone } from 'three/addons/utils/SkeletonUtils.js';
import type { GLTF } from 'three/addons/loaders/GLTFLoader.js';

export type Motion = 'idle' | 'walk' | 'run' | 'jump' | 'attack';
export type ModelSpec = { url: string; height?: number; yaw?: number; animations?: Partial<Record<Motion,string>> };

// Todas as versões provisórias usam o mesmo sistema de animação dos modelos GLB.
function placeholder(color:string, kind:string) {
 const root=new T.Group(); const body=new T.Group(); body.name='body';root.add(body);
 const mat=new T.MeshStandardMaterial({color,roughness:.48,metalness:.2});
 const skin=new T.MeshStandardMaterial({color:0xffd3ac});
 function mesh(g:T.BufferGeometry,m:T.Material,x:number,y:number,z:number,parent:T.Object3D=body){const v=new T.Mesh(g,m);v.position.set(x,y,z);v.castShadow=true;parent.add(v);return v;}
 mesh(new T.CapsuleGeometry(.24,.4,3,6),mat,0,.95,0);
 mesh(new T.SphereGeometry(.23,8,6),skin,0,1.55,0);
 const metal=new T.MeshStandardMaterial({color:0xd9efff,metalness:.7,roughness:.3});
 mesh(new T.ConeGeometry(.3,.42,6),mat,0,1.87,0);
 for(const side of [-1,1]){
  const leg=new T.Group();leg.name=side<0?'legL':'legR';leg.position.set(side*.16,.7,0);body.add(leg);
  mesh(new T.BoxGeometry(.19,.55,.23),metal,0,-.28,0,leg);
  const arm=new T.Group();arm.name=side<0?'armL':'armR';arm.position.set(side*.33,1.2,0);body.add(arm);
  mesh(new T.CapsuleGeometry(.09,.38,2,5),mat,0,-.23,0,arm);
  if(side===1){mesh(new T.CylinderGeometry(.035,.035,1,5),metal,0,-.2,.18,arm);mesh(new T.OctahedronGeometry(.14),mat,0,.38,.18,arm);}
 }
 if(kind==='feitiço'||kind==='relíquia')mesh(new T.TorusGeometry(.5,.035,4,16),metal,0,1,0).rotation.x=Math.PI/2;
 const clips: T.AnimationClip[]=[];
 for(const [name,duration,swing,bounce] of [['idle',2,.03,.03],['walk',.8,.6,.07],['run',.45,1,.12],['jump',.65,.3,.65],['attack',.6,.15,.06]] as const){
  const times=[0,duration/4,duration/2,duration*3/4,duration];
  const tracks:T.KeyframeTrack[]=[new T.NumberKeyframeTrack('body.position[y]',times,[0,bounce,0,bounce,0])];
  for(const [part,sign] of [['legL',1],['legR',-1],['armL',-1],['armR',1]] as const){
   tracks.push(new T.NumberKeyframeTrack(`${part}.rotation[x]`,times,name==='attack'&&part==='armR'?[0,-2,-.5,-1.8,0]:[0,swing*sign,0,-swing*sign,0]));
  }
  clips.push(new T.AnimationClip(name,duration,tracks));
 }
 return {root,clips};
}
export function createCharacter(color:string,kind:string,asset?:GLTF,spec?:ModelSpec){
 let root:T.Object3D;let clips:T.AnimationClip[];
 if(asset){root=clone(asset.scene);clips=asset.animations;const box=new T.Box3().setFromObject(root);const size=box.getSize(new T.Vector3());const scale=(spec?.height??2)/Math.max(size.y,.01);root.scale.multiplyScalar(scale);root.position.y=-box.min.y*scale;root.rotation.y=spec?.yaw??0;root.traverse(o=>{if(o instanceof T.Mesh)o.castShadow=true;});}
 else ({root,clips}=placeholder(color,kind));
 const group=new T.Group();group.add(root);
 const ring=new T.Mesh(new T.RingGeometry(.48,.56,24),new T.MeshBasicMaterial({color,side:T.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=.025;group.add(ring);
 const mixer=new T.AnimationMixer(root);const actions=new Map<Motion,T.AnimationAction>();
 const aliases={idle:/idle|standing/i,walk:/walk/i,run:/run|sprint/i,jump:/jump/i,attack:/attack|punch|slash/i};
 for(const name of Object.keys(aliases) as Motion[]){const clip=clips.find(c=>c.name===spec?.animations?.[name])??clips.find(c=>aliases[name].test(c.name));if(clip)actions.set(name,mixer.clipAction(clip));}
 let current:T.AnimationAction|undefined;
 return {group,mixer,play(name:Motion){const next=actions.get(name)??actions.get('idle');if(!next||next===current)return;next.reset().play();if(current)next.crossFadeFrom(current,.2,false);current=next;},dispose(){mixer.stopAllAction();mixer.uncacheRoot(root);if(!asset)disposeObject(root);disposeObject(ring);}};
}
export function disposeObject(root:T.Object3D){
 const geometries=new Set<T.BufferGeometry>(),materials=new Set<T.Material>(),textures=new Set<T.Texture>();
 root.traverse(o=>{if(o instanceof T.Mesh){geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material]){materials.add(m);for(const value of Object.values(m))if(value instanceof T.Texture)textures.add(value);}}});
 geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>{t.dispose();const bitmap=t.source?.data;if(typeof ImageBitmap!=='undefined'&&bitmap instanceof ImageBitmap)bitmap.close();});
}
