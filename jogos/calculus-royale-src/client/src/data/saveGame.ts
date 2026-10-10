export const SAVE_SCHEMA_VERSION = 3;
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
  chests: 'calculus-royale:chests',
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
const browserStorage = ():StorageLike|undefined => {try{return typeof window==='undefined'?undefined:window.localStorage;}catch{return undefined;}};

// Mantém as chaves antigas por compatibilidade e agrega uma cópia versionada,
// pronta para migrações futuras e sincronização opcional.
export function createSaveStore(storage?:StorageLike){
 const target=storage??browserStorage();
 const envelope=():SaveEnvelope=>{
  let saved:SaveEnvelope|undefined;
  try{saved=parse<SaveEnvelope>(target?.getItem(SAVE_ENVELOPE_KEY)??null);}catch{return emptyEnvelope();}
  if(!saved||typeof saved!=='object'||!saved.data||typeof saved.data!=='object'||Array.isArray(saved.data))return emptyEnvelope();
  return {...saved,schemaVersion:SAVE_SCHEMA_VERSION,data:{...saved.data}};
 };
 const persist=(next:SaveEnvelope)=>{try{target?.setItem(SAVE_ENVELOPE_KEY,JSON.stringify(next));}catch{/* armazenamento indisponível ou cheio */}};
 return {
  read<T>(key:StorageKey,fallback:T):T{
   if(!target)return fallback;
   const saved=envelope(),fromEnvelope=saved.data[key];
   if(fromEnvelope!==undefined)return fromEnvelope as T;
   let legacy:T|undefined;
   try{legacy=parse<T>(target.getItem(key));}catch{return fallback;}
   if(legacy===undefined)return fallback;
   saved.data[key]=legacy;saved.updatedAt=Date.now();persist(saved);
   return legacy;
  },
  write<T>(key:StorageKey,value:T){
   if(!target)return;
   try{target.setItem(key,JSON.stringify(value));}catch{/* compatibilidade best-effort */}
   const saved=envelope();saved.data[key]=value;saved.updatedAt=Date.now();persist(saved);
  },
  // A única gravação do envelope confirma saldos e recibos juntos. As chaves
  // legadas são espelhos best-effort, nunca a fonte para uma concessão parcial.
  commit(values:Partial<Record<StorageKey,unknown>>){
   if(!target)throw new Error('Armazenamento indisponível. Tente novamente antes de receber a recompensa.');
   const saved=envelope();Object.assign(saved.data,values);saved.updatedAt=Date.now();
   target.setItem(SAVE_ENVELOPE_KEY,JSON.stringify(saved));
   for(const [key,value] of Object.entries(values)){try{target.setItem(key,JSON.stringify(value));}catch{/* espelho legado */}}
   return saved;
  },
  snapshot(){return envelope();},
 };
}

export const readStorage=<T,>(key:StorageKey,fallback:T)=>createSaveStore().read(key,fallback);
export const writeStorage=<T,>(key:StorageKey,value:T)=>createSaveStore().write(key,value);
