import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import * as T from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { createProceduralCharacter } from '../client/src/game/proceduralCharacters.ts';
import { CARD_PROFILES } from '../client/src/game/cardProfiles.ts';
import { disposeObject } from '../client/src/game/characters.ts';

// Adapta a API de Blob usada pelo exportador ao Node, sem navegador ou texturas externas.
class NodeFileReader {
 result:ArrayBuffer|string|null=null;
 onloadend:(()=>void)|null=null;
 readAsArrayBuffer(blob:Blob){void blob.arrayBuffer().then(buffer=>{this.result=buffer;this.onloadend?.();});}
 readAsDataURL(blob:Blob){void blob.arrayBuffer().then(buffer=>{this.result=`data:${blob.type};base64,${Buffer.from(buffer).toString('base64')}`;this.onloadend?.();});}
}
Object.assign(globalThis,{FileReader:NodeFileReader});
const directory=fileURLToPath(new URL('../client/public/assets/models/generated/',import.meta.url));await mkdir(directory,{recursive:true});
const characters:Record<string,unknown>={};let bytes=0;
for(const id of Object.keys(CARD_PROFILES)){
 const {root,clips}=createProceduralCharacter(id);
 // GLTF exige translações vetoriais e rotações quaternion. Amostra as curvas dos pivôs.
 const animations=clips.map(clip=>{
  const mixer=new T.AnimationMixer(root);mixer.clipAction(clip).setLoop(T.LoopOnce,1).play();
  const names=[...new Set(clip.tracks.map(track=>track.name.split('.')[0]))];
  const samples=25,times=Array.from({length:samples},(_,i)=>i*clip.duration/(samples-1));
  const positions:Record<string,number[]>={},rotations:Record<string,number[]>={};for(const name of names){positions[name]=[];rotations[name]=[];}
  for(const time of times){mixer.setTime(time);for(const name of names){const node=root.getObjectByName(name)!;positions[name].push(...node.position.toArray());rotations[name].push(...node.quaternion.toArray());}}
  mixer.stopAllAction();mixer.uncacheRoot(root);
  return new T.AnimationClip(clip.name,clip.duration,names.flatMap(name=>[new T.VectorKeyframeTrack(`${name}.position`,times,positions[name]),new T.QuaternionKeyframeTrack(`${name}.quaternion`,times,rotations[name])]));
 });
 const result=await new GLTFExporter().parseAsync(root,{binary:true,animations,onlyVisible:true}) as ArrayBuffer;
 await writeFile(`${directory}${id}.glb`,Buffer.from(result));bytes+=result.byteLength;
 characters[id]={url:`./assets/models/generated/${id}.glb`,height:2.15};disposeObject(root);
}
await writeFile(`${directory}manifest.json`,JSON.stringify({characters},null,2)+'\n');
console.log(`Gerados ${Object.keys(characters).length} GLBs animados (${(bytes/1024/1024).toFixed(2)} MiB). Interpretações procedurais, não reproduções detalhadas dos retratos.`);
