import assert from 'node:assert/strict';
import { Box3, Vector3, AnimationClip, NumberKeyframeTrack } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { arenaPosition, moveWithCollisions } from '../client/src/game/collisions.ts';
import { createCharacter, disposeObject } from '../client/src/game/characters.ts';
import { createWorld } from '../client/src/game/world.ts';

assert.equal(arenaPosition(0,false,1.65).x,-9);
assert.equal(arenaPosition(100,false,1.65).x,9);
assert.equal(arenaPosition(100,true,-1.65).x,-9);
const wall=new Box3(new Vector3(0,0,-2),new Vector3(1,3,2));
const pos=new Vector3(-3,0,0);moveWithCollisions(pos,new Vector3(3,0,1),[wall]);
assert(pos.x<-.28,'Não deve atravessar uma parede em um passo longo');
assert(Math.abs(pos.z-1)<.01,'Deve deslizar no eixo livre');
for(let i=0;i<5;i++){
 const world=createWorld(i);
 for(const enemy of [false,true]){const start=arenaPosition(0,enemy,enemy?-1.65:1.65);const end=arenaPosition(100,enemy,start.z);moveWithCollisions(start,end,world.obstacles);assert(start.distanceTo(end)<.01,`A rota da ilha ${i+1} deve ficar livre`);}
 disposeObject(world.root);
}
const actor=createCharacter('#33bbff','tropa');
for(const motion of ['idle','walk','run','jump','attack'] as const){actor.play(motion);actor.mixer.update(.3);assert(Number.isFinite(actor.group.getObjectByName('armR')!.rotation.x));}
actor.dispose();
// Exercita o parser real do GLTFLoader e mixers independentes num asset mínimo.
const gltf=await new GLTFLoader().parseAsync(JSON.stringify({asset:{version:'2.0'},scene:0,scenes:[{nodes:[0]}],nodes:[{name:'rig',children:[1]},{name:'bone',translation:[0,1,0]}]}),'');
gltf.animations=[new AnimationClip('Idle',1,[new NumberKeyframeTrack('bone.rotation[x]',[0,.5,1],[0,1,0])]),new AnimationClip('Walk',1,[new NumberKeyframeTrack('bone.rotation[x]',[0,.5,1],[0,-1,0])])];
const first=createCharacter('#33bbff','tropa',gltf),second=createCharacter('#ff8866','tropa',gltf);
first.play('idle');second.play('idle');first.mixer.update(.25);
assert.notEqual(first.group.getObjectByName('bone')!.rotation.x,second.group.getObjectByName('bone')!.rotation.x,'Clones não podem compartilhar pose');
first.play('walk');first.mixer.update(.3);assert(first.group.getObjectByName('bone')!.rotation.x<0,'Crossfade deve alcançar Walk');
first.dispose();second.dispose();disposeObject(gltf.scene);
console.log('PASS: coordenadas, colisão sem atravessamento, cinco rotas, cinco animações, GLTFLoader, clones e crossfade.');
