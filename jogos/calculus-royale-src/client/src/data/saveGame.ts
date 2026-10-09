export const SAVE_SCHEMA_VERSION = 2;
export const SAVE_ENVELOPE_KEY = 'calculus-royale:save-v2';

export const storageKeys = {
  deck: 'calculus-royale:main-deck',
  worlds: 'calculus-royale:completed-worlds',
  levels: 'calculus-royale:card-levels',
  essence: 'calculus-royale:essence',
  wins: 'calculus-royale:wins',
  coins: 'calculus-royale:coins',
  worldIndex: 'calculus-royale:world-index',
  chapter: 'calculus-royale:chapter',
  stages: 'calculus-royale:stage-progress',
  survivalLeaderboard: 'calculus-royale:survival-leaderboard',
  survivalBadges: 'calculus-royale:survival-badges',
  volume: 'calculus-royale:volume',
  muted: 'calculus-royale:muted',
  inventory: 'calculus-royale:inventory',
  playerName: 'calculus-royale:player-name',
} as const;

export type StorageKey = typeof storageKeys[keyof typeof storageKeys];
type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;
export type SaveEnvelope = {
  schemaVersion: number;
  updatedAt: number;
  data: Partial<Record<StorageKey, unknown>>;
};

const emptyEnvelope = (): SaveEnvelope => ({schemaVersion:SAVE_SCHEMA_VERSION,updatedAt:Date.now(),data:{}});
const parse = <T,>(value:string|null):T|undefined => {
  if(value===null)return undefined;
  try{return JSON.parse(value) as T;}catch{return undefined;}
};
const browserStorage = ():StorageLike|undefined => typeof window==='undefined'?undefined:window.localStorage;

// Mantém as chaves antigas por compatibilidade e agrega uma cópia versionada,
// pronta para migrações futuras e sincronização opcional.
export function createSaveStore(storage?:StorageLike){
 const target=storage??browserStorage();
 const envelope=():SaveEnvelope=>{
  const saved=parse<SaveEnvelope>(target?.getItem(SAVE_ENVELOPE_KEY)??null);
  if(!saved||typeof saved!=='object'||typeof saved.data!=='object')return emptyEnvelope();
  return {...saved,schemaVersion:SAVE_SCHEMA_VERSION,data:{...saved.data}};
 };
 const persist=(next:SaveEnvelope)=>{try{target?.setItem(SAVE_ENVELOPE_KEY,JSON.stringify(next));}catch{/* armazenamento indisponível ou cheio */}};
 return {
  read<T>(key:StorageKey,fallback:T):T{
   if(!target)return fallback;
   const saved=envelope(),fromEnvelope=saved.data[key];
   if(fromEnvelope!==undefined)return fromEnvelope as T;
   const legacy=parse<T>(target.getItem(key));
   if(legacy===undefined)return fallback;
   saved.data[key]=legacy;saved.updatedAt=Date.now();persist(saved);
   return legacy;
  },
  write<T>(key:StorageKey,value:T){
   if(!target)return;
   try{target.setItem(key,JSON.stringify(value));}catch{/* compatibilidade best-effort */}
   const saved=envelope();saved.data[key]=value;saved.updatedAt=Date.now();persist(saved);
  },
  snapshot(){return envelope();},
 };
}

export const readStorage=<T,>(key:StorageKey,fallback:T)=>createSaveStore().read(key,fallback);
export const writeStorage=<T,>(key:StorageKey,value:T)=>createSaveStore().write(key,value);
