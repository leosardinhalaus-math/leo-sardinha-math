import assert from 'node:assert/strict';
import { createSaveStore, storageKeys, SAVE_ENVELOPE_KEY, SAVE_SCHEMA_VERSION } from '../client/src/data/saveGame.ts';
import { awardStage, openChest, readChestLedger, chestId, chestRewards, stageReward } from '../client/src/data/chestRewards.ts';

class MemoryStorage {
 values=new Map<string,string>();fail=false;
 getItem(key:string){return this.values.get(key)??null;}
 setItem(key:string,value:string){if(this.fail&&key===SAVE_ENVELOPE_KEY)throw new Error('quota');this.values.set(key,value);}
}
const memory=new MemoryStorage(),store=createSaveStore(memory);
store.commit({[storageKeys.coins]:0,[storageKeys.essence]:0});
const first=awardStage(store,0,0,2,100);
assert.equal(first.kind,'advance');assert.equal(store.read(storageKeys.coins,0),25);assert.equal(store.read(storageKeys.essence,0),1);
assert.equal(awardStage(store,0,0,2).kind,'replay');
const final=awardStage(store,0,1,2,200);
assert.equal(final.kind,'complete');assert.equal(store.read(storageKeys.coins,0),50);assert.equal(store.read(storageKeys.essence,0),5);
assert.equal(readChestLedger(store).instances[0].state,'pending');
assert.equal(awardStage(store,0,1,2).kind,'replay');
const opened=openChest(store,chestId(0),300);assert(opened.opened);
assert.equal(opened.coins,130);assert.equal(opened.essence,6);assert.equal(opened.chest.itemId,'island:1:collectible');
assert.equal(openChest(createSaveStore(memory),chestId(0)).opened,false,'reload e clique duplo não duplicam');
assert.equal(store.read(storageKeys.coins,0),130);
for(let world=1;world<5;world++){
 const result=awardStage(store,world,0,1);assert.equal(result.kind,'complete');
 assert.equal(awardStage(store,world,0,1).kind,'replay');
 const claim=openChest(store,chestId(world));assert(claim.opened);
 assert.equal(claim.chest.coins,chestRewards[world].coins);assert.equal(claim.chest.essence,chestRewards[world].essence);
 assert.equal(openChest(store,chestId(world)).opened,false);
}
assert.equal(readChestLedger(store).instances.length,5);
assert.equal(store.read(storageKeys.coins,0),6*25+Object.values(chestRewards).reduce((sum,c)=>sum+c.coins,0));
assert.equal(store.read(storageKeys.essence,0),6+5*3+Object.values(chestRewards).reduce((sum,c)=>sum+c.essence,0));
assert.deepEqual(stageReward(true),{coins:25,essence:1,completionEssence:3},'decomposição apresentada pela UI');

const old=new MemoryStorage();old.setItem(SAVE_ENVELOPE_KEY,JSON.stringify({schemaVersion:2,updatedAt:1,data:{[storageKeys.coins]:800,[storageKeys.essence]:9,[storageKeys.inventory]:[{...chestRewards[0],world:0,claimedAt:1}]}}));
const migrated=createSaveStore(old);assert.equal(readChestLedger(migrated).instances[0].state,'opened');
assert.equal(openChest(migrated,chestId(0)).opened,false);assert.equal(migrated.read(storageKeys.coins,0),800);assert.equal(migrated.read(storageKeys.essence,0),9);
assert.equal(migrated.snapshot().schemaVersion,SAVE_SCHEMA_VERSION);
old.setItem(storageKeys.chests,JSON.stringify({instances:[null,{world:7}],stages:null}));
assert.equal(readChestLedger(migrated).instances.length,1,'registros incompletos não geram novos créditos');

const failed=new MemoryStorage(),retry=createSaveStore(failed);retry.commit({[storageKeys.coins]:0,[storageKeys.essence]:0});
failed.fail=true;assert.throws(()=>awardStage(retry,0,0,1));failed.fail=false;
assert.equal(retry.read(storageKeys.coins,0),0);assert.equal(readChestLedger(retry).instances.length,0);
awardStage(retry,0,0,1);failed.fail=true;assert.throws(()=>openChest(retry,chestId(0)));failed.fail=false;
assert.equal(readChestLedger(createSaveStore(failed)).instances[0].state,'pending');
assert.equal(retry.read(storageKeys.coins,0),25);assert(openChest(retry,chestId(0)).opened);assert.equal(retry.read(storageKeys.coins,0),105);
assert.equal(awardStage(retry,0,1,3).kind,'replay','ilha concluída não concede novamente');
const partial=new MemoryStorage();partial.setItem(SAVE_ENVELOPE_KEY,JSON.stringify({schemaVersion:2,data:{[storageKeys.stages]:null,[storageKeys.worlds]:null,[storageKeys.coins]:'inválido',[storageKeys.essence]:null}}));
assert.equal(awardStage(createSaveStore(partial),0,0,2).kind,'advance','save incompleto recupera sem NaN');
console.log('PASS: casas inéditas e finais, cinco baús, replay, abertura idempotente, migração v2, totais e recuperação de falha de gravação.');
