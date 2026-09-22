import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { AnimationMixer, Box3, Vector3 } from 'three';
import { CARD_PROFILES } from '../client/src/game/cardProfiles.ts';
import { disposeObject } from '../client/src/game/characters.ts';
for(const id of Object.keys(CARD_PROFILES)){
 const bytes=await readFile(new URL(`../client/public/assets/models/generated/${id}.glb`,import.meta.url));
 const asset=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
 const bounds=new Box3().setFromObject(asset.scene).getSize(new Vector3());assert(bounds.y>1&&bounds.y<4);
 assert.deepEqual(asset.animations.map(a=>a.name).sort(),['idle','walk','run','jump','summon','attack','power','hurt','victory','defeat'].sort());
 const mixer=new AnimationMixer(asset.scene);
 for(const clip of asset.animations){mixer.clipAction(clip).play();mixer.update(.3);asset.scene.traverse(node=>assert(node.quaternion.toArray().every(Number.isFinite)));mixer.stopAllAction();}
 mixer.uncacheRoot(asset.scene);disposeObject(asset.scene);
}
console.log('PASS: os 45 GLBs abrem com GLTFLoader, possuem dez animações válidas e escala consistente.');
