import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {isStageUnlocked,normalizeStageProgress,resolveStageVictory} from '../client/src/game/progression.ts';

assert.deepEqual(normalizeStageProgress([6,5],[2,99],[false,false]),[2,5]);
assert.deepEqual(normalizeStageProgress([6,5],[],[true,false]),[6,0]);
assert(isStageUnlocked(2,2));
assert(!isStageUnlocked(3,2));
// Invalid house identifiers and corrupted progress must never unlock navigation.
for(const invalid of [-1, -0.5, 1.5, NaN, Infinity, -Infinity]) assert(!isStageUnlocked(invalid,3),`Invalid house ${invalid}`);
for(const invalidProgress of [-1, NaN, Infinity, -Infinity]) assert(!isStageUnlocked(0,invalidProgress),`Invalid progress ${invalidProgress}`);
assert(isStageUnlocked(2,2.9));
assert(!isStageUnlocked(3,2.9));

assert.deepEqual(resolveStageVictory(0,0,6),{kind:'advance',nextProgress:1,nextStage:1});
assert.deepEqual(resolveStageVictory(5,5,6),{kind:'complete',nextProgress:6});
assert.deepEqual(resolveStageVictory(3,1,6),{kind:'replay',nextProgress:3});
console.log('PASS: casas avançam uma a uma e a próxima ilha só libera após a última batalha.');

// An empty save must never seed fictional victories in the public ranking.
const gameCanvas = readFileSync(new URL('../client/src/components/GameCanvas.tsx', import.meta.url), 'utf8');
assert.match(gameCanvas, /readStorage\(storageKeys\.wins,\s*0\)/);
assert.doesNotMatch(gameCanvas, /readStorage\(storageKeys\.wins,\s*12\)/);


 // Regression: replaying a cleared house cannot advance the island.
 for (let progress = 1; progress <= 6; progress++) {
   for (let stage = 0; stage < progress; stage++) {
     assert.deepEqual(resolveStageVictory(progress, stage, 6), {kind:'replay',nextProgress:progress});
   }
 }
 // The final house completes the island exactly once; a completed world remains a replay.
 assert.deepEqual(resolveStageVictory(5,5,6,true), {kind:'replay',nextProgress:5});
 assert.deepEqual(resolveStageVictory(6,5,6), {kind:'replay',nextProgress:6});
 // Invalid or missing saved progress must not unlock additional houses.
 assert.deepEqual(normalizeStageProgress([6,6],[NaN,-5],[false,false]),[0,0]);
 assert.deepEqual(normalizeStageProgress([6,6],[99,2.9],[false,false]),[6,2]);
 assert(!isStageUnlocked(3,2));

 // Locked or malformed house selections cannot unlock the next house after a victory.
 assert.deepEqual(resolveStageVictory(0,2,6),{kind:'replay',nextProgress:0});
 assert.deepEqual(resolveStageVictory(4,5,6),{kind:'replay',nextProgress:4});
 assert.deepEqual(resolveStageVictory(3,3.5,6),{kind:'replay',nextProgress:3});
 assert.deepEqual(resolveStageVictory(6,6,6),{kind:'replay',nextProgress:6});
 assert.deepEqual(resolveStageVictory(0,-1,6),{kind:'replay',nextProgress:0});
 // The current house still unlocks exactly one next house.
 assert.deepEqual(resolveStageVictory(4,4,6),{kind:'advance',nextProgress:5,nextStage:5});

// Invalid progress or stage counts must never create non-finite or fractional unlocks.
assert.deepEqual(resolveStageVictory(NaN,0,6),{kind:'advance',nextProgress:1,nextStage:1});
assert.deepEqual(resolveStageVictory(Infinity,0,6),{kind:'advance',nextProgress:1,nextStage:1});
assert.deepEqual(resolveStageVictory(2.9,2,6),{kind:'advance',nextProgress:3,nextStage:3});
assert.deepEqual(resolveStageVictory(0,0,0),{kind:'replay',nextProgress:0});
assert.deepEqual(resolveStageVictory(0,0,NaN),{kind:'replay',nextProgress:0});
assert.deepEqual(resolveStageVictory(0,0,-3),{kind:'replay',nextProgress:0});
