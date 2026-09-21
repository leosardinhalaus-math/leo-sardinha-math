import * as T from 'three';
import { clone } from 'three/addons/utils/SkeletonUtils.js';
import { createProceduralCharacter } from './proceduralCharacters.ts';
import type { GLTF } from 'three/addons/loaders/GLTFLoader.js';

export type Motion = 'idle' | 'walk' | 'run' | 'jump' | 'attack' | 'victory' | 'defeat';
export type ModelSpec = { url: string; height?: number; yaw?: number; animations?: Partial<Record<Motion,string>> };

export function createCharacter(color:string,kind:string,asset?:GLTF,spec?:ModelSpec,cardId="slope"){
 let root:T.Object3D;let clips:T.AnimationClip[];
 if(asset){root=clone(asset.scene);clips=asset.animations;const box=new T.Box3().setFromObject(root);const size=box.getSize(new T.Vector3());const scale=(spec?.height??2)/Math.max(size.y,.01);root.scale.multiplyScalar(scale);root.position.y=-box.min.y*scale;root.rotation.y=spec?.yaw??0;root.traverse(o=>{if(o instanceof T.Mesh)o.castShadow=true;});}
 else ({root,clips}=createProceduralCharacter(cardId));
 const group=new T.Group();group.add(root);
 const ring=new T.Mesh(new T.RingGeometry(.48,.56,24),new T.MeshBasicMaterial({color,side:T.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=.025;group.add(ring);
 const mixer=new T.AnimationMixer(root);const actions=new Map<Motion,T.AnimationAction>();
 const aliases={idle:/idle|standing/i,walk:/walk/i,run:/run|sprint/i,jump:/jump/i,attack:/attack|punch|slash/i,victory:/victory|win|celebrat/i,defeat:/defeat|death|dying/i};
 for(const name of Object.keys(aliases) as Motion[]){const clip=clips.find(c=>c.name===spec?.animations?.[name])??clips.find(c=>aliases[name].test(c.name));if(clip)actions.set(name,mixer.clipAction(clip));}
 let current:T.AnimationAction|undefined;
 return {group,mixer,play(name:Motion){const next=actions.get(name)??actions.get('idle');if(!next||next===current)return;next.reset();next.setLoop(name==='defeat'?T.LoopOnce:T.LoopRepeat,name==='defeat'?1:Infinity);next.clampWhenFinished=name==='defeat';next.play();if(current)next.crossFadeFrom(current,.2,false);current=next;},dispose(){mixer.stopAllAction();mixer.uncacheRoot(root);if(!asset)disposeObject(root);disposeObject(ring);}};
}
export function disposeObject(root:T.Object3D){
 const geometries=new Set<T.BufferGeometry>(),materials=new Set<T.Material>(),textures=new Set<T.Texture>();
 root.traverse(o=>{if(o instanceof T.Mesh){geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material]){materials.add(m);for(const value of Object.values(m))if(value instanceof T.Texture)textures.add(value);}}});
 geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>{t.dispose();const bitmap=t.source?.data;if(typeof ImageBitmap!=='undefined'&&bitmap instanceof ImageBitmap)bitmap.close();});
}
