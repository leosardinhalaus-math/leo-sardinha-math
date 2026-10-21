// This module never copies authentication/session keys into game saves.
export const SAVE_KEYS=[
 'save-v2','main-deck','completed-worlds','card-levels','essence','wins','coins',
 'world-index','chapter','stage-progress','survival-leaderboard','survival-badges',
 'volume','muted','inventory','player-name'
].map(key=>'calculus-royale:'+key);
const MAX_SAVE_BYTES=200000;
const STAT_KEYS=['level','xp','trophies','wins','losses','completed_worlds','best_tower_wave','current_streak','best_streak','chests_opened','coins','essence'];
const SORTS={
 'trophies.desc':[['trophies','desc']],
 'best_tower_wave.desc':[['best_tower_wave','desc']],
 'completed_worlds.desc,xp.desc':[['completed_worlds','desc'],['xp','desc']]
};

export function cleanStats(value={}){
 return Object.fromEntries(STAT_KEYS.map(key=>{
  const number=Number(value[key]);
  return [key,Number.isFinite(number)?Math.min(2000000000,Math.max(0,Math.floor(number))):0];
 }));
}

export function readSave(storage){
 const data={};
 for(const key of SAVE_KEYS){const value=storage.getItem(key);if(value!==null){JSON.parse(value);data[key]=value;}}
 if(!Object.keys(data).length)throw Error('Jogue um pouco antes de salvar o progresso online.');
 const json=JSON.stringify(data);
 if(new TextEncoder().encode(json).length>MAX_SAVE_BYTES)throw Error('O progresso excede o limite de salvamento online.');
 return json;
}

export function restoreSave(storage,json){
 if(typeof json!=='string'||new TextEncoder().encode(json).length>MAX_SAVE_BYTES)throw Error('O salvamento recebido é inválido.');
 const data=JSON.parse(json);
 if(!data||typeof data!=='object'||Array.isArray(data)||!Object.keys(data).length)throw Error('O salvamento recebido é inválido.');
 for(const [key,value] of Object.entries(data)){
  if(!SAVE_KEYS.includes(key)||typeof value!=='string')throw Error('O salvamento contém campos inválidos.');
  JSON.parse(value);
 }
 const previous=new Map(SAVE_KEYS.map(key=>[key,storage.getItem(key)]));
 try{for(const key of SAVE_KEYS){if(Object.hasOwn(data,key))storage.setItem(key,data[key]);else storage.removeItem(key);}}
 catch(error){
  for(const [key,value] of previous){try{if(value===null)storage.removeItem(key);else storage.setItem(key,value);}catch{}}
  throw Error('Não foi possível carregar o progresso neste aparelho.');
 }
}

export function createFirebaseCloud({auth,db,sdk,localProgress,storage}){
 const session=async()=>auth.currentUser?{user:{id:auth.currentUser.uid}}:null;
 const uid=()=>{if(!auth.currentUser)throw Error('Entre na sua conta para continuar.');return auth.currentUser.uid;};
 const reference=(name,id)=>sdk.doc(db,name,id);
 const data=async ref=>{const snap=await sdk.getDoc(ref);return snap.exists()?snap.data():null;};
 const authError=error=>{
  const messages={
   'auth/invalid-credential':'E-mail ou senha incorretos.',
   'auth/email-already-in-use':'Esse e-mail já possui uma conta.',
   'auth/weak-password':'Escolha uma senha com pelo menos seis caracteres.',
   'auth/invalid-email':'Informe um e-mail válido.',
   'auth/too-many-requests':'Muitas tentativas. Aguarde um pouco e tente novamente.',
   'auth/network-request-failed':'Sem conexão com o serviço online. Seu progresso neste aparelho foi preservado.'
  };
  return Error(messages[error.code]||'Não foi possível acessar a conta agora. Tente novamente mais tarde.');
 };
 const getProfile=async()=>data(reference('players',uid()));
 async function ensureProfile(_session,name){
  const id=uid(),existing=await getProfile();if(existing)return existing;
  const username=String(name||'').trim().slice(0,24);
  if(username.length<3)throw Error('Escolha um nome com pelo menos três caracteres.');
  const profile={user_id:id,username,public_slug:'jogador-'+id,avatar_seed:username.slice(0,1).toUpperCase()};
  await sdk.setDoc(reference('players',id),{...profile,created_at:sdk.serverTimestamp()});
  return profile;
 }
 async function syncProgress(){
  const id=uid(),payload_json=readSave(storage),summary=cleanStats(localProgress());
  await sdk.setDoc(reference('progress',id),{user_id:id,schema_version:1,payload_json,summary,updated_at:sdk.serverTimestamp()});
  return summary;
 }
 async function restoreProgress(){
  const saved=await data(reference('progress',uid()));
  if(!saved)throw Error('Você ainda não tem um progresso salvo online.');
  restoreSave(storage,saved.payload_json);return cleanStats(saved.summary);
 }
 async function getMyStats(){const saved=await data(reference('progress',uid()));return saved?cleanStats(saved.summary):null;}
 async function publicProfile(slug){
  const result=await sdk.getDocs(sdk.query(sdk.collection(db,'players'),sdk.where('public_slug','==',String(slug)),sdk.limit(1)));
  if(!result.docs.length)return null;
  const profile=result.docs[0].data();
  return {profile,stats:await data(reference('leaderboard',profile.user_id))};
 }
 function rankingQuery(sort='trophies.desc'){
  if(!Object.hasOwn(SORTS,sort))throw Error('Ordenação de ranking inválida.');
  return sdk.query(sdk.collection(db,'leaderboard'),...SORTS[sort].map(([field,direction])=>sdk.orderBy(field,direction)),sdk.limit(100));
 }
 function rankingRows(snapshot){
  return snapshot.docs.map(doc=>doc.data()).filter(row=>row.profile&&typeof row.profile.username==='string').map(row=>({...cleanStats(row),profile:row.profile}));
 }
 return {
  session,getProfile,ensureProfile,syncProgress,restoreProgress,getMyStats,publicProfile,
  async signIn(email,password){try{await sdk.signInWithEmailAndPassword(auth,email,password);}catch(error){throw authError(error);}return session();},
  async signUp(email,password,name){
   if(String(name||'').trim().length<3)throw Error('Escolha um nome com pelo menos três caracteres.');
   try{await sdk.createUserWithEmailAndPassword(auth,email,password);}catch(error){throw authError(error);}
   await ensureProfile(null,name);return session();
  },
  async logout(){await sdk.signOut(auth);},
  async leaderboard(sort){return rankingRows(await sdk.getDocs(rankingQuery(sort)));},
  subscribeLeaderboard(sort,onData,onError){return sdk.onSnapshot(rankingQuery(sort),snapshot=>onData(rankingRows(snapshot)),onError);}
 };
}
