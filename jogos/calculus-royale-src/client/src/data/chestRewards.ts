import { createSaveStore, storageKeys } from './saveGame.ts';
import { resolveStageVictory } from '../game/progression.ts';

export type ChestReward = { rarity:'comum'|'rara'|'épica'|'lendária'; chest:string; coins:number; essence:number; item:string; icon:string };
export type ChestInstance = ChestReward & { id:string; itemId:string; world:number; state:'pending'|'opened'; earnedAt:number; claimedAt?:number; tableVersion:1 };
export const chestRewards:Record<number,ChestReward> = {
  0:{rarity:'comum',chest:'Baú do Aprendiz',coins:80,essence:1,item:'Fragmento de Tangente',icon:'↗'},
  1:{rarity:'rara',chest:'Baú da Cadeia',coins:135,essence:2,item:'Núcleo de Composição',icon:'∘'},
  2:{rarity:'épica',chest:'Baú do Valor Médio',coins:220,essence:3,item:'Pergaminho de Taylor',icon:'Σ'},
  3:{rarity:'lendária',chest:'Baú Integral Prismático',coins:340,essence:5,item:'Relíquia de Cavalieri',icon:'∫'},
  4:{rarity:'lendária',chest:'Baú do Infinito',coins:500,essence:8,item:'Selo da Convergência',icon:'∞'},
};
export type ChestLedger = { instances:ChestInstance[]; stages:string[] };
export const chestId = (world:number) => `island:${world+1}:chest:v1`;
const instance = (world:number,now:number,state:ChestInstance['state']):ChestInstance => ({...chestRewards[world],id:chestId(world),itemId:`island:${world+1}:collectible`,world,state,earnedAt:now,...(state==='opened'?{claimedAt:now}:{}),tableVersion:1});

/** Histórico v2 representa prêmios pagos. Nunca vira pendência nem novo crédito. */
export function migrateChestLedger(saved:unknown,inventory:unknown):ChestLedger {
 const raw=saved&&typeof saved==='object'?saved as Partial<ChestLedger>:{};
 const byId=new Map<string,ChestInstance>();
 for(const value of Array.isArray(raw.instances)?raw.instances:[]){
  if(!value||!Number.isInteger(value.world)||!chestRewards[value.world]||!['pending','opened'].includes(value.state))continue;
  const normalized={...instance(value.world,Number.isFinite(value.earnedAt)?value.earnedAt:0,value.state),...(value.state==='opened'?{claimedAt:Number.isFinite(value.claimedAt)?value.claimedAt:0}:{})};
  if(byId.get(normalized.id)?.state!=='opened')byId.set(normalized.id,normalized);
 }
 for(const value of Array.isArray(inventory)?inventory:[]){
  if(!value||!Number.isInteger(value.world)||!chestRewards[value.world])continue;
  byId.set(chestId(value.world),instance(value.world,Number.isFinite(value.claimedAt)?value.claimedAt:0,'opened'));
 }
 return {instances:[...byId.values()],stages:Array.isArray(raw.stages)?[...new Set(raw.stages.filter((id):id is string=>typeof id==='string'&&/^island:[1-5]:stage:\d+$/.test(id)))]:[]};
}

const balance=(value:unknown,fallback:number)=>typeof value==='number'&&Number.isFinite(value)&&value>=0?Math.floor(value):fallback;
export const stageReward = (last:boolean) => ({coins:25,essence:1,completionEssence:last?3:0});
type Store=ReturnType<typeof createSaveStore>;
export function readChestLedger(store:Store){return migrateChestLedger(store.read(storageKeys.chests,null),store.read(storageKeys.inventory,[]));}

export function awardStage(store:Store,world:number,stage:number,total:number,now=Date.now()){
 if(!chestRewards[world]||!Number.isInteger(stage)||stage<0||stage>=total)throw new Error('Casa inválida.');
 const rawProgress=store.read<unknown>(storageKeys.stages,[]),rawCompleted=store.read<unknown>(storageKeys.worlds,[]);
 const progress=Array.from({length:5},(_,index)=>balance(Array.isArray(rawProgress)?rawProgress[index]:undefined,0));
 const completed=Array.from({length:5},(_,index)=>Array.isArray(rawCompleted)&&rawCompleted[index]===true);
 const ledger=readChestLedger(store),id=`island:${world+1}:stage:${stage+1}`;
 const result=resolveStageVictory(progress[world]??0,stage,total,completed[world]);
 if(stage>(progress[world]??0)||result.kind==='replay'||ledger.stages.includes(id))return {kind:'replay' as const,ledger};
 const reward=stageReward(result.kind==='complete');
 const coins=balance(store.read(storageKeys.coins,320),320)+reward.coins,essence=balance(store.read(storageKeys.essence,6),6)+reward.essence+reward.completionEssence;
 ledger.stages.push(id);progress[world]=result.nextProgress;
 if(result.kind==='complete'){
  completed[world]=true;
  if(!ledger.instances.some(c=>c.id===chestId(world)))ledger.instances.push(instance(world,now,'pending'));
 }
 store.commit({[storageKeys.coins]:coins,[storageKeys.essence]:essence,[storageKeys.stages]:progress,[storageKeys.worlds]:completed,[storageKeys.chests]:ledger});
 return {...result,ledger,coins,essence,progress,completed,reward};
}

export function openChest(store:Store,id:string,now=Date.now()){
 const ledger=readChestLedger(store),chest=ledger.instances.find(c=>c.id===id);
 if(!chest||chest.state==='opened')return {opened:false as const,ledger};
 chest.state='opened';chest.claimedAt=now;
 const coins=balance(store.read(storageKeys.coins,320),320)+chest.coins,essence=balance(store.read(storageKeys.essence,6),6)+chest.essence;
 const inventory=ledger.instances.filter(c=>c.state==='opened');
 store.commit({[storageKeys.coins]:coins,[storageKeys.essence]:essence,[storageKeys.inventory]:inventory,[storageKeys.chests]:ledger});
 return {opened:true as const,ledger,chest,coins,essence};
}
