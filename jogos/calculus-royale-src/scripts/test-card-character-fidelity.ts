import assert from 'node:assert/strict';
import * as T from 'three';
import {createProceduralCharacter} from '../client/src/game/proceduralCharacters.ts';
import {disposeObject} from '../client/src/game/characters.ts';

const checks={
 slope:['slope-navy-corset','slope-high-hair-knot','slope-ponytail-gold-tie','slope-ponytail-strand-0','slope-red-cape-panel','slope-gold-bow','slope-drawn-bowstring','slope-arrow-shaft'],
 power:['power-pointed-ruby-hood','power-hood-gold-border','power-gold-medallion','power-long-white-beard-0','power-crimson-cloak-panel','power-ornate-gold-staff','power-golden-energy-helix','power-casting-orb']
} as const;

for(const id of ['slope','power'] as const){
 const {root,clips}=createProceduralCharacter(id);
 try{
  assert.equal(root.userData.cardId,id);
  assert.equal(root.userData.reference,'geometry-only');
  for(const name of checks[id])assert.ok(root.getObjectByName(name),`${id}: missing ${name}`);
  assert.ok(root.getObjectByName('capeHem') instanceof T.Bone,`${id}: no cape pivot`);
  const accessory=id==='slope'?'ponytail':'beardTail';
  assert.ok(root.getObjectByName(accessory) instanceof T.Bone,`${id}: no responsive ${accessory}`);
  for(const motion of ['idle','walk','run','attack','power','hurt','victory','defeat']){
   const clip=clips.find(x=>x.name===motion);
   assert.ok(clip,`${id}: missing animation ${motion}`);
   assert.ok(clip.tracks.some(t=>t.name===`capeHem.rotation[z]`),`${id}: cape doesn't move ${motion}`);
   assert.ok(clip.tracks.some(t=>t.name.startsWith(accessory+'.rotation')),`${id}: accessory doesn't move ${motion}`);
   assert.ok(clip.tracks.some(t=>t.name==='body.rotation[y]'),`${id}: no weight shift ${motion}`);
   assert.equal(clip.validate(),true,`${id}: invalid animation ${motion}`);
  }
  const clip=clips.find(x=>x.name==='attack')!;
  const mixer=new T.AnimationMixer(root);mixer.clipAction(clip).setLoop(T.LoopOnce,1).play();
  mixer.setTime(clip.duration*.5);
  assert.ok(Math.abs(root.getObjectByName(accessory)!.rotation.z)+Math.abs(root.getObjectByName(accessory)!.rotation.x)>.05,`${id}: secondary motion not visible during attack`);
  mixer.stopAllAction();mixer.uncacheRoot(root);
  let meshes=0;root.traverse(o=>{if(o instanceof T.Mesh)meshes++});
  assert.ok(meshes>30,`${id}: character has too few modeled parts: ${meshes}`);
  console.log(`${id}: ${meshes} meshes, card-specific costume, weapon and animation pivots verified`);
 }finally{disposeObject(root);}
}
