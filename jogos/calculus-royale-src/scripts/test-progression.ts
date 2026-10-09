import assert from 'node:assert/strict';
import {isStageUnlocked,normalizeStageProgress,resolveStageVictory} from '../client/src/game/progression.ts';

assert.deepEqual(normalizeStageProgress([6,5],[2,99],[false,false]),[2,5]);
assert.deepEqual(normalizeStageProgress([6,5],[],[true,false]),[6,0]);
assert(isStageUnlocked(2,2));
assert(!isStageUnlocked(3,2));
assert.deepEqual(resolveStageVictory(0,0,6),{kind:'advance',nextProgress:1,nextStage:1});
assert.deepEqual(resolveStageVictory(5,5,6),{kind:'complete',nextProgress:6});
assert.deepEqual(resolveStageVictory(3,1,6),{kind:'replay',nextProgress:3});
console.log('PASS: casas avançam uma a uma e a próxima ilha só libera após a última batalha.');
